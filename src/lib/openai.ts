import OpenAI from 'openai';
import { formatDateToDDMMYYYY } from '../utils/dateUtils';

const openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY;

// Check if API key is missing or is a placeholder
const isValidApiKey = openaiApiKey && openaiApiKey !== 'your_openai_api_key';

let openai: OpenAI | null = null;

if (isValidApiKey) {
  openai = new OpenAI({
    apiKey: openaiApiKey as string,
    dangerouslyAllowBrowser: true // Note: In production, API calls should be made server-side
  });
}

interface GenerateReportParams {
  clientInfo: {
    childFirstName: string;
    childLastName: string;
    childDob: string;
    parentName: string;
    idNumber?: string;
    gender?: string;
  };
  parentIntake: any;
  evaluatorAssessment: any;
}

export const generateReport = async ({ clientInfo, parentIntake, evaluatorAssessment }: GenerateReportParams) => {
  try {
    // Check if OpenAI integration is available
    if (!isValidApiKey || !openai) {
      console.warn('OpenAI API key is missing or invalid. Using mock report generator.');
      return generateMockReport({ clientInfo, parentIntake, evaluatorAssessment });
    }
    
    // Determine gender for proper text formatting
    const gender = clientInfo.gender || 'male';
    const isFemale = gender === 'female';
    
    // Create structured prompt for the AI
    const prompt = `
    You are an expert child psychologist with years of experience in writing detailed psychological assessment reports.
    Based on the following information from a parent intake form and a psychologist's evaluation, 
    create a comprehensive psychological assessment report in Hebrew.
    
    ## Client Information
    Child's Name: ${clientInfo.childFirstName} ${clientInfo.childLastName}
    Date of Birth: ${formatDateToDDMMYYYY(clientInfo.childDob)}
    ID Number: ${clientInfo.idNumber || 'Not specified'}
    Parent's Name: ${clientInfo.parentName}
    Gender: ${isFemale ? 'Female' : 'Male'}
    
    ## Parent Intake Information
    ${JSON.stringify(parentIntake, null, 2)}
    
    ## Psychologist's Evaluation
    ${JSON.stringify(evaluatorAssessment, null, 2)}
    
    Please structure your report with the following sections:
    1. רקע ומידע כללי (Introduction/Background)
    2. היסטוריה התפתחותית (Developmental History - based on parent intake)
    3. תצפיות התנהגותיות (Behavioral Observations)
    4. ניתוח מקיף של תפקוד קוגניטיבי (Cognitive Assessment Results)
       - Include detailed analysis of cognitive strengths and weaknesses
       - Compare scores across different cognitive domains
       - Explain the practical implications of these scores
    5. ניתוח מיומנויות אקדמיות (Academic Skills Assessment)
       - Provide detailed analysis of academic performance patterns
       - Identify specific learning challenges and strengths
    6. ניתוח תפקודים ניהוליים (Executive Functioning Assessment)
       - Analyze executive function profile in detail
       - Connect executive function to real-world performance
    7. ניתוח תפקוד רגשי-התנהגותי (Emotional and Behavioral Assessment)
       - Provide comprehensive analysis of emotional/behavioral factors
       - Analyze how these factors affect learning and development
    8. תפקוד אדפטיבי (Adaptive Functioning)
       - Analyze daily living skills and independence
       - Compare adaptive skills across different contexts
    9. סיכום והתכללות הממצאים (Summary/Integration of Findings)
       - Provide comprehensive synthesis of all assessment components
       - Explain how different findings interact with each other
       - Include clinical reasoning for your conclusions
    10. אבחנה (Diagnosis - if applicable)
        - Provide clear rationale for any diagnoses given
        - Explain why criteria are or are not met
    11. סיכום והמלצות (Summary and Recommendations)
        - Provide specific, detailed, and practical recommendations
        - Connect recommendations directly to assessment findings
    
    IMPORTANT: Please use the correct Hebrew gender forms throughout the report based on the child's gender (${isFemale ? 'female' : 'male'}).
    
    For the recommendations section, please provide specific, detailed, and practical recommendations that address the 
    specific needs identified in the assessment. Divide recommendations into two sections: one for educational staff 
    and one for parents.
    
    Please write the report in Hebrew, in a professional but accessible manner.
    
    IMPORTANT: In the introductory paragraph under "רקע ומידע כללי", include the following sentence with the referral reason:
    "${clientInfo.childFirstName} הופנ${isFemale ? 'תה' : 'ה'} להערכה פסיכולוגית התפתחותית לבקשת ההורים והמסגרת החינוכית עקב ${evaluatorAssessment?.evaluator?.referralReason || 'לא צוין'}."
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a professional child psychologist with expertise in writing comprehensive psychological assessment reports with detailed analysis, integration of findings, and clinical reasoning. Use correct Hebrew gender forms based on the child's gender."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 4000
    });

    // Extract report content
    const reportContent = response.choices[0].message.content || '';

    // Generate specific recommendations in a separate call for better focus
    const recommendationsPrompt = `
    Based on the assessment information provided below, generate detailed, practical recommendations 
    divided into two sections:
    1. המלצות מפורטות לצוות החינוכי (Recommendations for educational staff)
    2. המלצות מפורטות להורים (Recommendations for parents)
    
    Make sure the recommendations directly address the specific needs and challenges identified in the assessment.
    
    Each recommendation should:
    - Be specific and actionable
    - Explain WHY it's being recommended (connect to assessment findings)
    - Include HOW to implement it effectively
    - Consider both immediate and long-term needs
    
    IMPORTANT: Use the correct Hebrew gender forms throughout based on the child's gender (${isFemale ? 'female' : 'male'}).
    
    ## Assessment Summary
    ${reportContent.substring(0, 2000)}...
    
    ## Parent Intake Information (Key Points)
    ${JSON.stringify(parentIntake.currentFunctioning || {}, null, 2)}
    ${JSON.stringify(parentIntake.education || {}, null, 2)}
    
    ## Psychologist's Evaluation (Key Points)
    ${JSON.stringify(evaluatorAssessment.cognitiveResults || {}, null, 2)}
    ${JSON.stringify(evaluatorAssessment.academicResults || {}, null, 2)}
    ${JSON.stringify(evaluatorAssessment.executiveFunction || {}, null, 2)}
    ${JSON.stringify(evaluatorAssessment.emotionalBehavioral || {}, null, 2)}
    
    Write the recommendations in Hebrew in a clear, practical, and actionable manner.
    Format each major point with numbering (e.g., "1. כותרת ההמלצה:")
    `;

    const recommendationsResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a professional child psychologist specializing in practical intervention recommendations. Use correct Hebrew gender forms based on the child's gender."
        },
        {
          role: "user",
          content: recommendationsPrompt
        }
      ],
      temperature: 0.3,
      max_tokens: 2000
    });

    // Parse the recommendations response to extract the two sections
    const recommendationsText = recommendationsResponse.choices[0].message.content || '';
    
    // Simple parsing logic - in a production environment, you'd want more robust parsing
    let recommendationsSchool = '';
    let recommendationsParents = '';
    
    if (recommendationsText.includes('המלצות לצוות החינוכי') && recommendationsText.includes('המלצות להורים')) {
      const parts = recommendationsText.split(/המלצות להורים/i);
      const schoolParts = parts[0].split(/המלצות לצוות החינוכי/i);
      
      recommendationsSchool = schoolParts.length > 1 ? schoolParts[1].trim() : '';
      recommendationsParents = parts.length > 1 ? parts[1].trim() : '';
    } else {
      // Fallback if the specific headers aren't found
      const halfwayPoint = Math.floor(recommendationsText.length / 2);
      recommendationsSchool = recommendationsText.substring(0, halfwayPoint);
      recommendationsParents = recommendationsText.substring(halfwayPoint);
    }

    return {
      reportContent,
      recommendations: {
        school: recommendationsSchool,
        parents: recommendationsParents
      }
    };
  } catch (error) {
    console.error('Error generating report with OpenAI:', error);
    throw error;
  }
};

// Enhanced mock report generator for development/testing purposes
const generateMockReport = ({ clientInfo, parentIntake, evaluatorAssessment }: GenerateReportParams) => {
  // Determine gender for proper text formatting
  const gender = clientInfo.gender || 'male';
  const isFemale = gender === 'female';
  
  // Gender-specific text helpers
  const he_she = isFemale ? 'היא' : 'הוא';
  const his_her = isFemale ? 'שלה' : 'שלו';
  const him_her = isFemale ? 'אותה' : 'אותו';
  const verb_suffix = isFemale ? 'ה' : '';
  
  // Extract cognitive scores
  const cognitiveScore = evaluatorAssessment?.cognitiveResults?.fsiq || 100;
  const cognitiveIndices = Array.isArray(evaluatorAssessment?.cognitiveResults?.indices) ? 
    evaluatorAssessment.cognitiveResults.indices : [];
  
  // Extract academic data
  const readingResults = evaluatorAssessment?.academicResults?.reading || {};
  const writingResults = evaluatorAssessment?.academicResults?.writing || {};
  const mathResults = evaluatorAssessment?.academicResults?.math || {};
  
  // Executive function data
  const execFunction = evaluatorAssessment?.executiveFunction || {};
  
  // Emotional behavioral data
  const emotionalData = evaluatorAssessment?.emotionalBehavioral || {};
  
  // Get diagnosis if available
  const diagnosisList = Array.isArray(evaluatorAssessment?.diagnosis) 
    ? evaluatorAssessment.diagnosis 
    : [];
  const diagnosisString = diagnosisList.length > 0 ? diagnosisList.join(', ') : 'לא זוהו אבחנות';
  
  // Get parent intake data
  const educationInfo = parentIntake?.education?.currentSetting || 'לא צוין';
  const strengths = parentIntake?.currentFunctioning?.strengths || 'לא צוין';
  const challenges = parentIntake?.currentFunctioning?.challenges || 'לא צוין';
  const socialSkills = parentIntake?.currentFunctioning?.socialSkills || 'לא צוין';
  
  // Get referral reason from evaluator
  const referralReason = evaluatorAssessment?.evaluator?.referralReason || 'לא צוין';
  
  // Get recommendations from evaluator
  const evalRecsSchool = evaluatorAssessment?.recommendations?.school || '';
  const evalRecsParents = evaluatorAssessment?.recommendations?.parents || '';

  // Calculate cognitive profile strengths and weaknesses
  const cognitiveProfile = analyzeCognitiveProfile(cognitiveScore, cognitiveIndices);
  
  // Calculate academic strengths and weaknesses
  const academicProfile = analyzeAcademicProfile(readingResults, writingResults, mathResults);
  
  // Generate a detailed mock report with enhanced analysis
  const reportContent = `
רקע ומידע כללי
שם הילד/ה: ${clientInfo.childFirstName} ${clientInfo.childLastName}
תעודת זהות: ${clientInfo.idNumber || 'לא צוין'}
תאריך לידה: ${formatDateToDDMMYYYY(clientInfo.childDob)}
גיל בעת האבחון: ${calculateAge(clientInfo.childDob)}
הורה/אפוטרופוס: ${clientInfo.parentName}

${clientInfo.childFirstName} הופנ${isFemale ? 'תה' : 'ה'} להערכה פסיכולוגית התפתחותית לבקשת ההורים והמסגרת החינוכית עקב ${referralReason}. מטרת ההערכה היא לספק הבנה מקיפה של החוזקות, האתגרים והצרכים הייחודיים של ${clientInfo.childFirstName}, וכן לגבש המלצות אופרטיביות להתערבות.

היסטוריה התפתחותית
המידע שנמסר על-ידי המשפחה מצביע על התפתחות ${
    parentIntake?.developmentalMilestones?.concernsMotor || parentIntake?.developmentalMilestones?.concernsSpeech ? 
    'עם מספר נקודות דאגה' : 'תקינה בדרך כלל'
  }. ${clientInfo.childFirstName} לומד${isFemale ? 'ת' : ''} כיום ב${educationInfo}.

${parentIntake?.developmentalMilestones?.concernsMotor ? 
  `ההורים דיווחו על קשיים בתחום המוטורי: ${parentIntake.developmentalMilestones.concernsMotorDetails}` : 
  ''}

${parentIntake?.developmentalMilestones?.concernsSpeech ? 
  `בתחום השפתי, ההורים ציינו: ${parentIntake.developmentalMilestones.concernsSpeechDetails}` : 
  ''}

תצפיות התנהגותיות
במהלך האבחון, ${clientInfo.childFirstName} ${
    evaluatorAssessment?.clinicalObservation?.eyeContact >= 4 ? 
    `יצר${isFemale ? 'ה' : ''} קשר עין טוב ושיתפ${isFemale ? 'ה' : ''} פעולה באופן מלא עם המטלות` : 
    evaluatorAssessment?.clinicalObservation?.eyeContact >= 3 ? 
    `הפגינ${isFemale ? 'ה' : ''} שיתוף פעולה עם רוב המטלות, אם כי קשר העין היה בינוני` : 
    `גילת${isFemale ? 'ה' : 'ה'} קושי בשמירה על קשר עין והיה צורך בעידוד לשיתוף פעולה`
  }. 

${evaluatorAssessment?.clinicalObservation?.language ? 
  `בתחום הדיבור והשפה: ${evaluatorAssessment.clinicalObservation.language}` : 
  ''}

המצב הרגשי במהלך האבחון היה ${evaluatorAssessment?.clinicalObservation?.affect || 'נורמוטימי באופן כללי'}.
${evaluatorAssessment?.clinicalObservation?.affectNotes ? 
  evaluatorAssessment.clinicalObservation.affectNotes : 
  ''}

ניתוח מקיף של תפקוד קוגניטיבי
הערכת הפרופיל הקוגניטיבי של ${clientInfo.childFirstName} מבוססת על מספר כלי הערכה סטנדרטיים. הציון הכולל (FSIQ) עומד על ${cognitiveScore}, המציב את ${clientInfo.childFirstName} בטווח ${
    getCognitiveRange(cognitiveScore)
  }.

${cognitiveProfile.analysisText}

התפקוד הקוגניטיבי של ${clientInfo.childFirstName} מראה ${
    cognitiveProfile.variability === 'high' ? 
    'פערים משמעותיים בין תחומים שונים, דבר המצביע על פרופיל קוגניטיבי לא אחיד' : 
    cognitiveProfile.variability === 'moderate' ? 
    'מספר הבדלים בין התחומים השונים, אך ללא פערים קיצוניים' : 
    'עקביות טובה יחסית בין תחומים שונים'
  }. 

ניתוח מעמיק של מדדים קוגניטיביים
${cognitiveProfile.detailedAnalysis}

השלכות מעשיות של הפרופיל הקוגניטיבי
${cognitiveProfile.implications}

ניתוח מיומנויות אקדמיות
הערכת המיומנויות האקדמיות של ${clientInfo.childFirstName} מראה ${
    academicProfile.overallStatus
  }.

${academicProfile.detailedAnalysis}

דפוסי למידה וקשיים ספציפיים
${academicProfile.learningPatterns}

פערים בין יכולת קוגניטיבית לביצוע אקדמי
${academicProfile.gaps}

ניתוח תפקודים ניהוליים
תפקודי הניהול הם מיומנויות מנטליות המאפשרות לנו לתכנן, להתמקד, לזכור הוראות ולנהל מספר משימות בהצלחה. 

${analyzeExecutiveFunction(execFunction, isFemale, clientInfo.childFirstName)}

ניתוח תפקוד רגשי-התנהגותי
${analyzeEmotionalBehavioral(emotionalData, clientInfo.childFirstName, isFemale)}

תפקוד אדפטיבי
${analyzeAdaptive(evaluatorAssessment?.adaptive, clientInfo.childFirstName, isFemale)}

סיכום והתכללות הממצאים
ההערכה המקיפה של ${clientInfo.childFirstName} מגלה תמונה מורכבת המשלבת גורמים קוגניטיביים, אקדמיים, רגשיים והתנהגותיים.

${integrateFindings({
    cognitive: cognitiveProfile,
    academic: academicProfile,
    executive: execFunction,
    emotional: emotionalData,
    adaptive: evaluatorAssessment?.adaptive,
    strengths,
    challenges,
    socialSkills,
    name: clientInfo.childFirstName,
    isFemale
  })}

אבחנה
${diagnosisString}

${evaluatorAssessment?.diagnosisNotes ? 
  evaluatorAssessment.diagnosisNotes : 
  diagnosisList.length > 0 ? 
  `האבחנות הנ"ל מבוססות על ניתוח מעמיק של ממצאי האבחון, ומקיימות את הקריטריונים המקצועיים כפי שמופיעים ב-DSM-5.` : 
  `על סמך הממצאים הנוכחיים, לא זוהו אבחנות העומדות בקריטריונים המקצועיים.`
}

סיכום והמלצות
לאור מכלול הממצאים והניתוח לעיל, חשוב לפתח תכנית תמיכה אישית מקיפה שתענה על צרכיו המורכבים של ${clientInfo.childFirstName}. 
`;

  // Default recommendations if none provided
  const defaultRecsSchool = `
המלצות מפורטות לצוות החינוכי:

1. התאמות הוראה ופדגוגיה:
   - יש להשתמש בהוראה מובנית ושיטתית במיומנויות אקדמיות בסיסיות - זאת עקב פרופיל הלמידה המצביע על צורך בבהירות ומבנה.
   - רצוי להציג מידע הן בצורה חזותית והן בצורה שמיעתית כדי לנצל את החוזקות הקיימות בתחום ${cognitiveProfile.strengths.length > 0 ? cognitiveProfile.strengths[0] : 'העיבוד החזותי'}.
   - מומלץ לחלק משימות מורכבות לשלבים קטנים וברורים לאור הקשיים בתפקודים ניהוליים שזוהו.
   - יש לתרגל מיומנויות נלמדות בהקשרים שונים כדי לחזק הכללה.

2. התאמות סביבתיות וניהול כיתה:
   - רצוי לאפשר הפסקות קצרות מדי פעם לתנועה והתרעננות, במיוחד בהתחשב בממצאים המצביעים על ${execFunction.attention > 60 ? 'קשיי קשב' : 'צורך בגיוון'}.
   - מומלץ להושיב את ${clientInfo.childFirstName} קרוב למורה ורחוק מגורמים מסיחים.
   - חשוב לספק משוב מיידי, עקבי וחיובי - זה מחזק את תחושת המסוגלות ומסייע להתמודד עם ${emotionalData.anxiety > 60 ? 'החרדה שזוהתה' : 'אתגרי הלמידה'}.

3. טיפוח תקשורת עם הבית:
   - רצוי לקיים פגישות קבועות עם ההורים לעדכון ומעקב.
   - חשוב לשתף את ההורים בהתקדמות ובאתגרים, תוך הדגשת הצלחות והישגים.
   - יש לפתח מערכת לתיאום בין גישות התמיכה בבית הספר ובבית.

4. צרכים ייחודיים על בסיס הממצאים:
   - יש להתמקד בחיזוק תחום ${academicProfile.weakestArea} באמצעות גישות מותאמות אישית.
   - מומלץ לבנות תכנית לחיזוק מיומנויות ${execFunction.workingMemory > 60 ? 'זיכרון העבודה' : execFunction.planning > 60 ? 'התכנון והארגון' : 'התפקוד הניהולי'} באמצעות תרגול יומיומי במסגרת הכיתה.
   - רצוי לספק הזדמנויות להצלחה בתחומי החוזק: ${strengths}

5. מעקב והערכה:
   - יש לקבוע מדדי התקדמות ברורים ולעקוב אחריהם באופן שיטתי.
   - חשוב לתעד התערבויות שהצליחו במיוחד ולשכפלן.
   - מומלץ לבצע הערכה מחודשת של הצרכים מדי כמה חודשים ולהתאים את התכנית בהתאם.
`;

  const defaultRecsParents = `
המלצות מפורטות להורים:

1. תמיכה בלמידה:
   - יש ליצור סביבת למידה ביתית מוגדרת, שקטה ונטולת הסחות - זאת במיוחד לאור הקשיים שזוהו ב${execFunction.attention > 60 ? 'קשב וריכוז' : 'עיבוד מידע'}.
   - מומלץ לתרגל באופן יומיומי את תחומי הקושי תוך שימוש בחומרים חזותיים וחווייתיים.
   - חשוב לפרק משימות לימודיות לחלקים קטנים וברי-השגה, ולציין את ההצלחה בכל שלב.
   - רצוי לתרגל מיומנויות ${academicProfile.weakestArea} באמצעות משחקים ופעילויות יומיומיות.

2. תמיכה רגשית ובניית מסוגלות:
   - יש להקדיש זמן איכות יומי לשיחה פתוחה ללא שיפוטיות.
   - חשוב לחזק התנהגות חיובית ולהתמקד בהצלחות ולא רק באתגרים.
   - מומלץ לפתח שגרת "דיבור עצמי חיובי" והתמודדות עם ${emotionalData.anxiety > 60 ? 'מחשבות חרדתיות' : emotionalData.depression > 60 ? 'מחשבות שליליות' : 'אתגרים'}.
   - רצוי לעודד עצמאות בתחומים בהם יש יכולת להצליח, תוך מתן תמיכה מדודה בתחומי קושי.

3. שגרה וסביבה ביתית:
   - יש ליצור שגרה יומית קבועה וצפויה עם רמזים חזותיים (לוח זמנים, רשימות).
   - מומלץ להקפיד על הרגלי שינה בריאים - לפחות 9-10 שעות שינה בלילה.
   - חשוב להגביל זמן מסך ולוודא שהתכנים מותאמים ומועילים.
   - רצוי לעודד פעילות גופנית קבועה לשיפור הוויסות הרגשי וההתנהגותי.

4. שיתוף פעולה עם אנשי מקצוע:
   - יש לקיים קשר רציף עם הצוות החינוכי.
   - מומלץ לעקוב אחר ההתקדמות בטיפולים התומכים (אם ישנם).
   - חשוב לשתף את המטפלים במידע רלוונטי מהבית.
   - רצוי לשקול פנייה ל${diagnosisList.includes('ADHD') ? 'ריפוי בעיסוק ממוקד קשב' : diagnosisList.includes('SLD') ? 'הוראה מתקנת' : 'טיפול תומך מתאים'} לאור הממצאים באבחון.

5. טיפול בצרכים הייחודיים:
   - יש לפתח אסטרטגיות ספציפיות להתמודדות עם ${challenges}.
   - מומלץ לשים דגש על טיפוח ${socialSkills ? 'כישורים חברתיים' : 'תחומי העניין והחוזקות'}.
   - חשוב להיעזר בייעוץ מקצועי להמשך מעקב והתאמת התכנית לצרכים המשתנים.
`;

  return {
    reportContent,
    recommendations: {
      school: evalRecsSchool || defaultRecsSchool,
      parents: evalRecsParents || defaultRecsParents
    }
  };
};

// Helper functions for analyzing cognitive profile
function analyzeCognitiveProfile(fsiq: number, indices: any[]) {
  // Determine which ranges are strengths and weaknesses
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  
  // Calculate average and variability
  let sum = 0;
  const validScores = indices.filter(idx => idx.score > 0).map(idx => idx.score);
  
  if (validScores.length > 0) {
    sum = validScores.reduce((acc, score) => acc + score, 0);
    const avg = sum / validScores.length;
    
    // Find strengths and weaknesses
    indices.forEach(idx => {
      if (idx.score >= avg + 10) {
        strengths.push(idx.index);
      } else if (idx.score <= avg - 10) {
        weaknesses.push(idx.index);
      }
    });
  }
  
  // Calculate variability
  let variability = 'low';
  if (validScores.length > 1) {
    const min = Math.min(...validScores);
    const max = Math.max(...validScores);
    if (max - min >= 20) {
      variability = 'high';
    } else if (max - min >= 10) {
      variability = 'moderate';
    }
  }
  
  // Generate analysis text
  let analysisText = '';
  if (strengths.length > 0 || weaknesses.length > 0) {
    analysisText = 'ניתוח מעמיק של הפרופיל הקוגניטיבי מצביע על ';
    
    if (strengths.length > 0) {
      analysisText += `חוזקות יחסיות בתחומי ${strengths.join(', ')}. `;
    }
    
    if (weaknesses.length > 0) {
      analysisText += `במקביל, זוהו קשיים יחסיים בתחומי ${weaknesses.join(', ')}. `;
    }
  } else {
    analysisText = 'הפרופיל הקוגניטיבי מראה רמת תפקוד עקבית ביחס לממוצע הגילאי. ';
  }
  
  // Generate detailed analysis
  const detailedAnalysis = `בבחינה מפורטת יותר, ניתן לראות כי המבנה הקוגניטיבי ${
    variability === 'high' ? 'איננו אחיד ומאופיין בפערים משמעותיים' : 
    variability === 'moderate' ? 'מראה מספר הבדלים בין יכולות שונות' : 
    'מציג תבנית עקבית יחסית'
  }. ${strengths.length > 0 ? 
    `תחומי החוזקה ב${strengths.join(', ')} מהווים נקודת משען משמעותית לבניית תכנית התערבות אפקטיבית.` : ''
  } ${weaknesses.length > 0 ? 
    `תחומי הקושי ב${weaknesses.join(', ')} מצריכים תשומת לב מיוחדת והתאמת שיטות הוראה ולמידה.` : ''
  }`;
  
  // Generate implications
  const implications = `פרופיל קוגניטיבי זה עשוי להשפיע על תהליכי למידה והסתגלות בדרכים הבאות:
  
${strengths.length > 0 ? `- יש לנצל את היכולות החזקות ב${strengths.join(', ')} כאמצעי לפיצוי על תחומי קושי ולחיזוק תחושת המסוגלות.` : ''}
${weaknesses.length > 0 ? `- יש לפתח אסטרטגיות להתמודדות עם האתגרים ב${weaknesses.join(', ')} באמצעות פישוט משימות, הוראה מפורשת ותרגול ממוקד.` : ''}
${variability === 'high' ? 
  '- הפערים הגבוהים בין התחומים השונים עשויים ליצור תסכול ותחושת בלבול בתהליכי למידה, ולכן נדרשת הבנייה ברורה של משימות ומטרות.' : 
  variability === 'moderate' ? 
  '- הפערים המתונים בין התחומים השונים מצביעים על צורך בגמישות בדרכי ההוראה תוך התאמה לנקודות חוזק וחולשה.' : 
  '- העקביות היחסית של הפרופיל הקוגניטיבי מאפשרת בניית תכנית לימודים אחידה יותר.'
}`;

  return {
    strengths,
    weaknesses,
    variability,
    analysisText,
    detailedAnalysis,
    implications
  };
}

// Helper function for analyzing academic profile
function analyzeAcademicProfile(reading: any, writing: any, math: any) {
  const academicScores = [
    { area: 'קריאה-דיוק', score: reading.accuracy || 0 },
    { area: 'קריאה-שטף', score: reading.fluency || 0 },
    { area: 'קריאה-הבנה', score: reading.comprehension || 0 },
    { area: 'כתיבה-איות', score: writing.spelling || 0 },
    { area: 'כתיבה-הבעה', score: writing.expression || 0 },
    { area: 'חשבון-חישוב', score: math.calculation || 0 },
    { area: 'חשבון-פתרון בעיות', score: math.problemSolving || 0 }
  ].filter(item => item.score > 0);
  
  // Find strengths and weaknesses
  let strengths: string[] = [];
  let weaknesses: string[] = [];
  let weakestArea = '';
  let strongestArea = '';
  
  if (academicScores.length > 0) {
    // Calculate average
    const sum = academicScores.reduce((acc, item) => acc + item.score, 0);
    const avg = sum / academicScores.length;
    
    // Find strengths and weaknesses
    academicScores.forEach(item => {
      if (item.score >= avg + 10) {
        strengths.push(item.area);
      } else if (item.score <= avg - 10) {
        weaknesses.push(item.area);
      }
    });
    
    // Find weakest and strongest areas
    const minScore = Math.min(...academicScores.map(item => item.score));
    const maxScore = Math.max(...academicScores.map(item => item.score));
    
    weakestArea = academicScores.find(item => item.score === minScore)?.area || '';
    strongestArea = academicScores.find(item => item.score === maxScore)?.area || '';
  }
  
  // Determine average academic level
  const validScores = academicScores.map(item => item.score);
  const avgScore = validScores.length > 0 ? 
    validScores.reduce((acc, score) => acc + score, 0) / validScores.length : 0;
  
  let overallStatus = '';
  if (avgScore >= 110) {
    overallStatus = 'רמת הישגים גבוהה מהממוצע';
  } else if (avgScore >= 90) {
    overallStatus = 'רמת הישגים ממוצעת';
  } else if (avgScore >= 80) {
    overallStatus = 'רמת הישגים נמוכה מהממוצע';
  } else if (avgScore > 0) {
    overallStatus = 'קשיים משמעותיים בתחום האקדמי';
  } else {
    overallStatus = 'לא ניתן לקבוע רמת הישגים עקב חוסר במידע';
  }
  
  // Generate detailed analysis
  const detailedAnalysis = academicScores.length > 0 ? `
ניתוח מפורט של המיומנויות האקדמיות מצביע על פרופיל מורכב. ${strongestArea ? `ניכרת חוזקה יחסית בתחום ${strongestArea}` : ''}
${weakestArea ? `לעומת זאת, זוהה קושי משמעותי בתחום ${weakestArea}` : ''}
${weaknesses.length > 1 ? `בנוסף, נצפו קשיים בתחומים ${weaknesses.join(', ')}` : ''}
` : 'לא קיים מידע מספק לניתוח מפורט של מיומנויות אקדמיות.';

  // Generate learning patterns
  const readingPattern = (reading.accuracy > 0 || reading.fluency > 0 || reading.comprehension > 0) ?
    `בתחום הקריאה, ${
      reading.accuracy < 85 ? 'קיים קושי משמעותי בדיוק הקריאה. ' : 
      reading.accuracy >= 115 ? 'הדיוק בקריאה הוא חוזקה משמעותית. ' : 'דיוק הקריאה בטווח התקין. '
    }${
      reading.fluency < 85 ? 'שטף הקריאה הוא אתגר משמעותי. ' : 
      reading.fluency >= 115 ? 'שטף הקריאה מפותח היטב. ' : 'שטף הקריאה בטווח התקין. '
    }${
      reading.comprehension < 85 ? 'הבנת הנקרא מהווה תחום קושי משמעותי שדורש התערבות ממוקדת.' : 
      reading.comprehension >= 115 ? 'הבנת הנקרא היא חוזקה בולטת.' : 'הבנת הנקרא בטווח התקין.'
    }` : '';

  const writingPattern = (writing.spelling > 0 || writing.expression > 0) ?
    `בתחום הכתיבה, ${
      writing.spelling < 85 ? 'זוהו קשיים משמעותיים באיות. ' : 
      writing.spelling >= 115 ? 'האיות מהווה חוזקה. ' : 'האיות בטווח התקין. '
    }${
      writing.expression < 85 ? 'ההבעה בכתב היא אתגר משמעותי שדורש תשומת לב.' : 
      writing.expression >= 115 ? 'ההבעה בכתב מפותחת היטב.' : 'ההבעה בכתב בטווח התקין.'
    }` : '';

  const mathPattern = (math.calculation > 0 || math.problemSolving > 0) ?
    `בתחום החשבון, ${
      math.calculation < 85 ? 'קיימים קשיים בביצוע פעולות חשבון בסיסיות. ' : 
      math.calculation >= 115 ? 'ביצוע פעולות חשבון מהווה חוזקה. ' : 'ביצוע פעולות חשבון בטווח התקין. '
    }${
      math.problemSolving < 85 ? 'פתרון בעיות מילוליות מהווה אתגר משמעותי.' : 
      math.problemSolving >= 115 ? 'יכולת פתרון בעיות מתמטיות מפותחת היטב.' : 'פתרון בעיות מתמטיות בטווח התקין.'
    }` : '';

  const learningPatterns = `${readingPattern}\n\n${writingPattern}\n\n${mathPattern}`;
  
  // Analyze gaps
  const gaps = academicScores.length > 0 ? 
    `ניתוח הפערים בין היכולת הקוגניטיבית לביצועים האקדמיים ${
      avgScore < 90 && weakestArea ? `מצביע על פער משמעותי במיוחד בתחום ${weakestArea}. פער זה מעיד על צורך בהתערבות ממוקדת בתחום זה.` : 
      avgScore >= 110 ? 'מצביע על ניצול טוב של הפוטנציאל הקוגניטיבי בתחום האקדמי.' : 
      'מצביע על התאמה סבירה בין היכולת הקוגניטיבית להישגים האקדמיים.'
    }` : 'לא ניתן לבצע ניתוח פערים מלא בשל חוסר במידע.';
  
  return {
    overallStatus,
    strengths,
    weaknesses,
    weakestArea,
    strongestArea,
    detailedAnalysis,
    learningPatterns,
    gaps
  };
}

// Helper function to analyze executive function
function analyzeExecutiveFunction(execFunction: any, isFemale: boolean, name: string) {
  if (!execFunction) return 'לא ניתן לבצע הערכה של תפקודים ניהוליים עקב חוסר במידע.';
  
  // Gender specific text
  const verb_suffix = isFemale ? 'ת' : '';
  
  const challenges = [];
  if (execFunction.attention >= 65) challenges.push('קשב');
  if (execFunction.workingMemory >= 65) challenges.push('זיכרון עבודה');
  if (execFunction.inhibition >= 65) challenges.push('עיכוב תגובה');
  if (execFunction.planning >= 65) challenges.push('תכנון');
  if (execFunction.flexibility >= 65) challenges.push('גמישות קוגניטיבית');
  
  const hasChallenges = challenges.length > 0;
  
  let executiveAnalysis = '';
  
  if (hasChallenges) {
    executiveAnalysis = `הערכת התפקודים הניהוליים מצביעה על קשיים משמעותיים בתחומי ${challenges.join(', ')}. `;
    
    if (challenges.includes('קשב')) {
      executiveAnalysis += `הקושי בקשב מתבטא בקושי להתמקד במשימות לאורך זמן, נטייה להסחת דעת, ומעבר מהיר בין גירויים שונים. `;
    }
    
    if (challenges.includes('זיכרון עבודה')) {
      executiveAnalysis += `חולשה בזיכרון העבודה משפיעה על היכולת לשמור מידע בזיכרון תוך כדי עיבודו, מה שמקשה על ביצוע הוראות מורכבות ומטלות רב-שלביות. `;
    }
    
    if (challenges.includes('עיכוב תגובה')) {
      executiveAnalysis += `קושי בעיכוב תגובה מתבטא בפעולה מהירה ללא שיקול דעת מספק, קושי להמתין לתור, והתפרצות לדברי אחרים. `;
    }
    
    if (challenges.includes('תכנון')) {
      executiveAnalysis += `חולשה ביכולת התכנון גורמת לקושי בהתארגנות, בתכנון מראש, ובסידור משימות לפי סדר הגיוני. `;
    }
    
    if (challenges.includes('גמישות קוגניטיבית')) {
      executiveAnalysis += `קושי בגמישות קוגניטיבית מתבטא בקושי להסתגל לשינויים, לראות בעיות מזוויות שונות, ולשנות אסטרטגיה כאשר נדרש. `;
    }
  } else {
    executiveAnalysis = 'הערכת התפקודים הניהוליים מצביעה על תפקוד תקין יחסית בתחומים שנבדקו. ';
  }
  
  executiveAnalysis += execFunction.notes ? `\n\n${execFunction.notes}` : '';
  
  executiveAnalysis += `\n\nהשפעה על תפקוד יומיומי: ${
    hasChallenges ? 
    `קשיים אלו בתפקודים ניהוליים משפיעים משמעותית על היכולת להתארגן, לתכנן, להתמיד במשימות ולווסת התנהגות ורגשות. הדבר מקשה על תפקוד${verb_suffix} בסביבה הלימודית וחברתית, ומצריך התאמות והתערבות.` :
    `התפקודים הניהוליים התקינים מסייעים ביכולת התכנון, ההתארגנות, ההתמדה במשימות והוויסות הרגשי וההתנהגותי.`
  }`;
  
  return executiveAnalysis;
}

// Helper function to analyze emotional-behavioral functioning
function analyzeEmotionalBehavioral(emotionalData: any, name: string, isFemale: boolean) {
  if (!emotionalData) return `לא התקבל מידע מספק להערכת התפקוד הרגשי-התנהגותי של ${name}.`;
  
  // Gender specific text
  const verb_suffix = isFemale ? 'ה' : '';
  const suffix = isFemale ? 'ה' : '';
  
  const challenges = [];
  if (emotionalData.anxiety >= 65) challenges.push('חרדה');
  if (emotionalData.depression >= 65) challenges.push('דיכאון');
  if (emotionalData.aggression >= 65) challenges.push('תוקפנות');
  if (emotionalData.withdrawal >= 65) challenges.push('נסיגה חברתית');
  
  const hasChallenges = challenges.length > 0;
  
  let emotionalAnalysis = '';
  
  if (hasChallenges) {
    emotionalAnalysis = `הערכת התפקוד הרגשי-התנהגותי של ${name} מצביעה על אתגרים בתחומי ${challenges.join(', ')}. `;
    
    if (challenges.includes('חרדה')) {
      emotionalAnalysis += `רמת החרדה הגבוהה עלולה להתבטא בדאגה מוגזמת, קושי להירגע, ותסמינים פיזיים כמו כאבי בטן או ראש. `;
    }
    
    if (challenges.includes('דיכאון')) {
      emotionalAnalysis += `סימני דיכאון עשויים להתבטא בירידה במצב הרוח, אבדן עניין בפעילויות, עייפות, ותחושת חוסר ערך. `;
    }
    
    if (challenges.includes('תוקפנות')) {
      emotionalAnalysis += `התנהגות תוקפנית מתבטאת בקושי לווסת כעס, עוינות כלפי אחרים, והתפרצויות זעם. `;
    }
    
    if (challenges.includes('נסיגה חברתית')) {
      emotionalAnalysis += `הנסיגה החברתית מתבטאת בהימנעות ממצבים חברתיים, קושי ביצירת קשרים, והעדפה להיות לבד${suffix}. `;
    }
  } else {
    emotionalAnalysis = `הערכת התפקוד הרגשי-התנהגותי של ${name} לא מצביעה על קשיים משמעותיים בתחומים שנבדקו. `;
  }
  
  emotionalAnalysis += emotionalData.summary ? `\n\n${emotionalData.summary}` : '';
  
  emotionalAnalysis += `\n\nהשפעה על תפקוד וקוגניציה: ${
    hasChallenges ? 
    `קשיים רגשיים-התנהגותיים אלו משפיעים על תהליכי למידה, יכולת ריכוז, מוטיבציה ואינטראקציות חברתיות. קשיים אלו עלולים להסוות יכולות קוגניטיביות ולהשפיע לרעה על הביצועים האקדמיים והחברתיים.` :
    `התפקוד הרגשי-התנהגותי התקין מהווה בסיס איתן ללמידה ולהתפתחות חברתית, ומאפשר מיצוי טוב יותר של היכולות הקוגניטיביות.`
  }`;
  
  return emotionalAnalysis;
}

// Helper function to analyze adaptive functioning
function analyzeAdaptive(adaptiveData: any, name: string, isFemale: boolean) {
  if (!adaptiveData) return `לא התקבל מידע מספק להערכת התפקוד האדפטיבי של ${name}.`;
  
  // Gender specific text
  const verb_suffix = isFemale ? 'ת' : '';
  
  const challenges = [];
  if (adaptiveData.communication < 85) challenges.push('תקשורת');
  if (adaptiveData.dailyLiving < 85) challenges.push('כישורי יום-יום');
  if (adaptiveData.socialization < 85) challenges.push('חברתיות');
  if (adaptiveData.motorSkills < 85) challenges.push('מיומנויות מוטוריות');
  
  const hasChallenges = challenges.length > 0;
  
  let adaptiveAnalysis = '';
  
  if (hasChallenges) {
    adaptiveAnalysis = `הערכת התפקוד האדפטיבי של ${name} מצביעה על קשיים בתחומי ${challenges.join(', ')}. `;
    
    if (challenges.includes('תקשורת')) {
      adaptiveAnalysis += `הקושי בתקשורת מתבטא בהבעה מילולית, הבנת הוראות מורכבות, או יכולת לנהל שיחה. `;
    }
    
    if (challenges.includes('כישורי יום-יום')) {
      adaptiveAnalysis += `קשיים בכישורי יום-יום מתבטאים בקושי בהתארגנות אישית, עצמאות בפעולות יומיומיות, או ניהול זמן. `;
    }
    
    if (challenges.includes('חברתיות')) {
      adaptiveAnalysis += `קשיים בתחום החברתי מתבטאים בקושי ביצירת קשרים, הבנת נורמות חברתיות, או שיתוף פעולה עם אחרים. `;
    }
    
    if (challenges.includes('מיומנויות מוטוריות')) {
      adaptiveAnalysis += `קשיים במיומנויות מוטוריות מתבטאים בקואורדינציה, כתיבה, או פעולות הדורשות מוטוריקה עדינה. `;
    }
  } else {
    adaptiveAnalysis = `הערכת התפקוד האדפטיבי של ${name} מצביעה על תפקוד תקין יחסית בתחומים שנבדקו. `;
  }
  
  adaptiveAnalysis += adaptiveData.summary ? `\n\n${adaptiveData.summary}` : '';
  
  adaptiveAnalysis += `\n\nהשפעה על עצמאות ותפקוד: ${
    hasChallenges ? 
    `קשיים בתפקוד האדפטיבי משפיעים על העצמאות, ההסתגלות למצבים חברתיים ולימודיים, והיכולת להתמודד עם דרישות היומיום. קשיים אלו מצריכים התאמות ותמיכה מותאמת בסביבות השונות.` :
    `היכולות האדפטיביות התקינות מהוות בסיס לעצמאות, להסתגלות חברתית ולימודית, ולהתמודדות יעילה עם דרישות היומיום.`
  }`;
  
  return adaptiveAnalysis;
}

// Integrate findings into a comprehensive analysis
function integrateFindings(data: any) {
  const { cognitive, academic, executive, emotional, adaptive, strengths, challenges, socialSkills, name, isFemale } = data;
  
  // Gender specific text
  const verb_suffix = isFemale ? 'ת' : '';
  const he_she = isFemale ? 'היא' : 'הוא';
  
  // Determine the primary challenges
  const primaryChallenges = [];
  
  if (cognitive.weaknesses.length > 0) primaryChallenges.push('קוגניטיביים');
  if (academic.weakestArea) primaryChallenges.push('אקדמיים');
  
  const execChallenges = [];
  if (executive.attention >= 65) execChallenges.push('קשב');
  if (executive.workingMemory >= 65) execChallenges.push('זיכרון עבודה');
  if (executive.inhibition >= 65) execChallenges.push('עיכוב תגובה');
  if (execChallenges.length > 0) primaryChallenges.push('תפקודים ניהוליים');
  
  const emotChallenges = [];
  if (emotional.anxiety >= 65) emotChallenges.push('חרדה');
  if (emotional.depression >= 65) emotChallenges.push('דיכאון');
  if (emotional.aggression >= 65) emotChallenges.push('תוקפנות');
  if (emotional.withdrawal >= 65) emotChallenges.push('נסיגה חברתית');
  if (emotChallenges.length > 0) primaryChallenges.push('רגשיים-התנהגותיים');
  
  // Create an integrated analysis
  let integrated = 'בראייה אינטגרטיבית, ';
  
  if (primaryChallenges.length > 0) {
    integrated += `${name} מתמודד${verb_suffix} עם אתגרים ${primaryChallenges.join(', ')} המשפיעים על תפקוד${verb_suffix} בסביבות שונות. `;
    
    // Add more specific analysis based on the constellation of challenges
    if (primaryChallenges.includes('קוגניטיביים') && primaryChallenges.includes('אקדמיים')) {
      integrated += `הקשיים הקוגניטיביים בתחומי ${cognitive.weaknesses.join(', ')} משפיעים ישירות על ההישגים האקדמיים, במיוחד ב${academic.weakestArea}. `;
    }
    
    if (primaryChallenges.includes('תפקודים ניהוליים')) {
      integrated += `קשיי התפקוד הניהולי ב${execChallenges.join(', ')} פוגעים ביכולת לארגן מידע, להתמיד במשימות ולווסת התנהגות, דבר המשפיע על תפקוד יומיומי בבית ובמסגרת החינוכית. `;
    }
    
    if (primaryChallenges.includes('רגשיים-התנהגותיים')) {
      integrated += `הקשיים הרגשיים-התנהגותיים של ${name}, ובפרט ב${emotChallenges.join(', ')}, משפיעים על המוטיבציה, יכולת הריכוז והפניות הרגשית ללמידה. `;
    }
  } else {
    integrated += `הממצאים מצביעים על פרופיל תפקודי תקין יחסית במרבית התחומים שנבדקו. `;
  }
  
  // Add insights about strengths and how they can be leveraged
  integrated += `\n\nלצד האתגרים, ניכרות חוזקות משמעותיות ב${strengths || 'מספר תחומים'} ${cognitive.strengths.length > 0 ? `ובמיוחד ב${cognitive.strengths.join(', ')}` : ''}. חוזקות אלו מהוות בסיס חשוב להתערבות ולבניית תחושת מסוגלות. `;
  
  // Add clinically meaningful conclusion
  integrated += `\n\nמכלול הממצאים מצביע על פרופיל ${
    primaryChallenges.length >= 3 ? 'מורכב הדורש תכנית התערבות רב-תחומית' : 
    primaryChallenges.length > 0 ? 'עם אתגרים ספציפיים הדורשים התייחסות ממוקדת' : 
    'תקין יחסית עם צורך במעקב והמשך חיזוק תחומי חוזק'
  }. `;
  
  // Add information about prognosis and response to interventions
  integrated += `הפרוגנוזה להתקדמות ${
    primaryChallenges.length >= 3 ? 'מותנית בהתערבות מוקדמת, מקיפה ועקבית במספר תחומים' : 
    primaryChallenges.length > 0 ? 'טובה בהינתן התערבות מותאמת לצרכים הייחודיים' : 
    'טובה, עם המשך תמיכה והעשרה בהתאם לצרכים המשתנים'
  }.`;
  
  integrated += `\n\nהניתוח האינטגרטיבי מדגיש את הצורך ב${
    primaryChallenges.length >= 3 ? 'גישה כוללנית המשלבת התערבויות חינוכיות, רגשיות וקוגניטיביות' : 
    primaryChallenges.length > 0 ? 'התערבות ממוקדת בתחומי הקושי תוך ניצול תחומי החוזק' : 
    'המשך חיזוק וטיפוח היכולות הקיימות לקראת אתגרים עתידיים'
  }.`;
  
  return integrated;
}

// Helper functions
function getCognitiveRange(score: number) {
  if (score >= 130) return 'מחונן/ת (Gifted)';
  if (score >= 120) return 'גבוה מאוד (Very High)';
  if (score >= 110) return 'גבוה מהממוצע (High Average)';
  if (score >= 90) return 'ממוצע (Average)';
  if (score >= 80) return 'נמוך מהממוצע (Low Average)';
  if (score >= 70) return 'גבולי (Borderline)';
  return 'נמוך (Extremely Low)';
}

function calculateAge(dob: string): string {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  const months = (today.getMonth() + 12 - birthDate.getMonth()) % 12;
  
  return `${age} שנים ו-${months} חודשים`;
}