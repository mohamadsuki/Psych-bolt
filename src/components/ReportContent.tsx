import React, { useMemo } from 'react';
import { formatDateToDDMMYYYY } from '../utils/dateUtils';

interface ReportContentProps {
  reportContent: string;
  recommendations: string;
  recommendationsParents: string;
  clientInfo: any;
  evaluatorAssessment: any;
}

const ReportContent: React.FC<ReportContentProps> = ({ 
  reportContent, 
  recommendations, 
  recommendationsParents, 
  clientInfo, 
  evaluatorAssessment 
}) => {
  // Format background info with each item on its own separate line
  const formatBackgroundInfo = (content: string) => {
    if (!content) return '';
    
    // Find the "רקע ומידע כללי" section
    const bgSectionMatch = content.match(/רקע ומידע כללי([\s\S]*?)(?=היסטוריה התפתחותית|$)/);
    
    if (!bgSectionMatch || !bgSectionMatch[1]) return content;
    
    let bgSection = bgSectionMatch[1];
    
    // Format each field to be on its own separate line with <p> tags to ensure proper HTML rendering
    bgSection = bgSection.replace(/שם הילד\/ה:(.*?)(?=תעודת זהות:|$)/s, "<p>שם הילד/ה:$1</p>");
    bgSection = bgSection.replace(/תעודת זהות:(.*?)(?=תאריך לידה:|$)/s, "<p>תעודת זהות:$1</p>");
    bgSection = bgSection.replace(/תאריך לידה:(.*?)(?=גיל בעת האבחון:|$)/s, "<p>תאריך לידה:$1</p>");
    bgSection = bgSection.replace(/גיל בעת האבחון:(.*?)(?=הורה\/אפוטרופוס:|$)/s, "<p>גיל בעת האבחון:$1</p>");
    bgSection = bgSection.replace(/הורה\/אפוטרופוס:(.*?)(?=\n\n|\n|$)/s, "<p>הורה/אפוטרופוס:$1</p><br>");
    
    // Replace the original background section with the formatted version
    return content.replace(bgSectionMatch[0], `רקע ומידע כללי${bgSection}`);
  };

  // Format diagnosis section with diagnosis on first line and explanation in smaller font below
  const formatDiagnosis = (content: string) => {
    if (!content) return '';
    
    // Find the "אבחנה" section
    const diagnosisSectionMatch = content.match(/אבחנה([\s\S]*?)(?=סיכום והמלצות|$)/);
    
    if (!diagnosisSectionMatch || !diagnosisSectionMatch[1]) return content;
    
    let diagnosisSection = diagnosisSectionMatch[1].trim();
    
    // Split the diagnosis text into the diagnosis itself and any following explanation
    const diagnosisLines = diagnosisSection.split(/\n/);
    let diagnosis = diagnosisLines[0]; // First line is the diagnosis
    const explanationText = diagnosisLines.slice(1).join(' ').trim();
    
    // Format with diagnosis on first line and explanation in smaller font
    const formattedDiagnosis = `\n${diagnosis}\n<p style="font-size: 10pt;">${explanationText}</p>\n\n`;
    
    // Replace the original diagnosis section with the formatted version
    return content.replace(diagnosisSectionMatch[0], `אבחנה${formattedDiagnosis}`);
  };

  // Format recommendations sections with proper line breaks and no extra spacing
  const formatRecommendations = (content: string) => {
    if (!content) return '';
    
    // Remove "המלצות מפורטות לצוות החינוכי:" and similar headers
    content = content.replace(/המלצות מפורטות לצוות החינוכי:/g, '');
    content = content.replace(/המלצות מפורטות להורים:/g, '');
    
    // Get numbered items - first split by numbered heading
    let lines = content.split(/(\d+\.\s+)/);
    
    let result = '';
    if (lines.length > 1) {
      // First item will be empty or some text before the first number
      if (lines[0].trim()) {
        result += lines[0].trim() + "\n";
      }
      
      // Process each numbered item
      for (let i = 1; i < lines.length; i += 2) {
        if (i === 1) {
          // First numbered item - no extra spacing
          result += lines[i] + lines[i+1].trim().replace(/\n\s*-\s+/g, "\n   - ");
        } else {
          // Other numbered items - add a newline before 
          result += "\n" + lines[i] + lines[i+1].trim().replace(/\n\s*-\s+/g, "\n   - ");
        }
      }
    } else {
      // If no numbered items, return as is
      return content.trim();
    }
    
    return result.trim();
  };

  // Use useMemo to avoid reprocessing the content on every render
  const processedReportContent = useMemo(() => {
    return processHeadings(reportContent);
  }, [reportContent]);
  
  // Use useMemo for recommendations
  const formattedSchoolRecommendations = useMemo(() => {
    return formatRecommendations(recommendations);
  }, [recommendations]);
  
  const formattedParentRecommendations = useMemo(() => {
    return formatRecommendations(recommendationsParents);
  }, [recommendationsParents]);

  function processHeadings(content: string) {
    if (!content) return '';
    
    // Format the background info section for proper line breaks
    content = formatBackgroundInfo(content);
    
    // Format diagnosis section
    content = formatDiagnosis(content);
    
    // These functions replace the heading patterns with actual HTML that gets rendered
    const processedContent = content
      .replace(/\*/g, '')
      .replace(/רקע ומידע כללי/g, `<h2 style="font-weight:bold;margin-top:1.5em;margin-bottom:0.5em;">רקע ומידע כללי</h2>`)
      .replace(/היסטוריה התפתחותית/g, `<h2 style="font-weight:bold;margin-top:1.5em;margin-bottom:0.5em;">היסטוריה התפתחותית</h2>`)
      .replace(/תצפיות התנהגותיות/g, `<h2 style="font-weight:bold;margin-top:1.5em;margin-bottom:0.5em;">תצפיות התנהגותיות</h2>`)
      .replace(/ניתוח מקיף של תפקוד קוגניטיבי/g, `<h2 style="font-weight:bold;margin-top:1.5em;margin-bottom:0.5em;">ניתוח מקיף של תפקוד קוגניטיבי</h2>`)
      .replace(/ניתוח מיומנויות אקדמיות/g, `<h2 style="font-weight:bold;margin-top:1.5em;margin-bottom:0.5em;">ניתוח מיומנויות אקדמיות</h2>`)
      .replace(/ניתוח תפקודים ניהוליים/g, `<h2 style="font-weight:bold;margin-top:1.5em;margin-bottom:0.5em;">ניתוח תפקודים ניהוליים</h2>`)
      .replace(/ניתוח תפקוד רגשי-התנהגותי/g, `<h2 style="font-weight:bold;margin-top:1.5em;margin-bottom:0.5em;">ניתוח תפקוד רגשי-התנהגותי</h2>`)
      .replace(/תפקוד אדפטיבי/g, `<h2 style="font-weight:bold;margin-top:1.5em;margin-bottom:0.5em;">תפקוד אדפטיבי</h2>`)
      .replace(/סיכום והתכללות הממצאים/g, `<h2 style="font-weight:bold;margin-top:1.5em;margin-bottom:0.5em;">סיכום והתכללות הממצאים</h2>`)
      .replace(/אבחנה/g, `<h2 style="font-weight:bold;margin-top:1.5em;margin-bottom:0.5em;">אבחנה</h2>`)
      .replace(/סיכום והמלצות/g, `<h2 style="font-weight:bold;margin-top:1.5em;margin-bottom:0.5em;">סיכום והמלצות</h2>`)
      .replace(/### ניתוח מעמיק של מדדים קוגניטיביים/g, `<h3 style="font-weight:bold;margin-top:1em;margin-bottom:0.25em;">ניתוח מעמיק של מדדים קוגניטיביים</h3>`)
      .replace(/### השלכות מעשיות של הפרופיל הקוגניטיבי/g, `<h3 style="font-weight:bold;margin-top:1em;margin-bottom:0.25em;">השלכות מעשיות של הפרופיל הקוגניטיבי</h3>`)
      .replace(/### דפוסי למידה וקשיים ספציפיים/g, `<h3 style="font-weight:bold;margin-top:1em;margin-bottom:0.25em;">דפוסי למידה וקשיים ספציפיים</h3>`)
      .replace(/### פערים בין יכולת קוגניטיבית לביצוע אקדמי/g, `<h3 style="font-weight:bold;margin-top:1em;margin-bottom:0.25em;">פערים בין יכולת קוגניטיבית לביצוע אקדמי</h3>`)
      .replace(/דוח הערכה פסיכולוגית/g, 'חוות דעת פסיכודידקטית');
      
    return processedContent;
  }

  return (
    <div id="reportContent" className="bg-white border border-gray-200 p-8 rounded-lg rtl print:shadow-none" dir="rtl" style={{fontFamily: 'David, Arial, sans-serif', fontSize: '12pt', lineHeight: '1.5', textAlign: 'justify', direction: 'rtl'}}>
      <div className="mb-8 text-center border-b pb-6">
        <div className="h-24 mb-4">
          {/* Space for logo */}
        </div>
        <h1 className="text-center font-bold mb-2" style={{fontSize: '20pt'}}>חוות דעת פסיכודידקטית</h1>
        <p>עבור: {clientInfo.child_first_name} {clientInfo.child_last_name}</p>
        <p>תעודת זהות: {clientInfo.id_number || 'לא צוין'}</p>
        <p>תאריך: {formatDateToDDMMYYYY(new Date().toISOString())}</p>
      </div>
      
      {/* Using dangerouslySetInnerHTML to properly render formatted headings */}
      <div 
        className="text-justify" 
        style={{ lineHeight: '1.5', direction: 'rtl', textAlign: 'right' }}
        dangerouslySetInnerHTML={{ 
          __html: processedReportContent
        }}
        dir="rtl"
      />
      
      <div className="mt-12">
        <h2 style={{fontWeight: 'bold', marginTop: '1.5em', marginBottom: '0.5em'}} className="text-teal-800">המלצות מפורטות</h2>
        
        <div className="mb-8">
          <h3 style={{fontWeight: 'bold', marginTop: '1em', marginBottom: '0.25em'}} className="text-gray-800">המלצות לצוות החינוכי</h3>
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 text-justify recommendation" style={{ lineHeight: '1.5', whiteSpace: 'pre-line', direction: 'rtl', textAlign: 'justify' }} dir="rtl">
            {formattedSchoolRecommendations}
          </div>
        </div>
        
        <div className="mb-8">
          <h3 style={{fontWeight: 'bold', marginTop: '1em', marginBottom: '0.25em'}} className="text-gray-800">המלצות להורים</h3>
          <div className="p-4 bg-green-50 rounded-lg border border-green-100 text-justify recommendation" style={{ lineHeight: '1.5', whiteSpace: 'pre-line', direction: 'rtl', textAlign: 'justify' }} dir="rtl">
            {formattedParentRecommendations}
          </div>
        </div>
        
        <div className="mb-8">
          <h3 style={{fontWeight: 'bold', marginTop: '1em', marginBottom: '0.25em'}} className="text-gray-800">המלצות לדרכי היבחנות</h3>
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-100 text-justify recommendation" style={{ lineHeight: '1.5', whiteSpace: 'pre-line', direction: 'rtl', textAlign: 'justify' }} dir="rtl">
            {formatRecommendations(`1. התאמות בתנאי היבחנות:
   - הארכת זמן של 25% בבחינות
   - מתן אפשרות להיבחן בחדר שקט עם מיעוט מסיחים
   - אפשרות לקבלת הפסקות קצרות במהלך הבחינה

2. התאמות בדרכי היבחנות:
   - אפשרות להגשת תשובות מודפסות במקום כתובות ביד
   - פישוט לשוני של שאלות מורכבות
   - מתן אפשרות לשימוש בדף נוסחאות מורחב במקצועות רלוונטיים

3. התאמות טכנולוגיות:
   - שימוש במחשב בבחינות הכוללות כתיבת חיבורים או תשובות ארוכות
   - שימוש בתוכנות הקראה במקרה הצורך

4. התאמות בהערכה:
   - התחשבות בשגיאות כתיב ותחביר שאינן פוגמות בהבנת התוכן
   - מתן משקל להבנת המושגים והעקרונות ופחות לשגיאות טכניות

5. מעקב והתאמה:
   - בחינה תקופתית של יעילות ההתאמות
   - עדכון ההתאמות בהתאם לצרכים המשתנים`)}
          </div>
        </div>
        
        <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-100 text-justify recommendation" style={{ lineHeight: '1.5', direction: 'rtl', textAlign: 'justify' }} dir="rtl">
          <h3 style={{fontWeight: 'bold', marginBottom: '0.5em'}} className="text-gray-700">סיכום והמלצות להמשך</h3>
          <p className="mb-3">
            המלצות אלו נבנו בהתאם לממצאי האבחון וצרכיו הייחודיים של {clientInfo.child_first_name}. 
            חשוב ליישם את ההמלצות באופן עקבי ומותאם, תוך ניטור ההתקדמות ועדכון הגישה בהתאם לצורך.
          </p>
          <p className="mb-3">
            שיתוף פעולה בין הצוות החינוכי וההורים הוא מרכיב קריטי להצלחת התכנית. מומלץ לקיים פגישות מעקב 
            תקופתיות (אחת לחודשיים-שלושה) לבחינת ההתקדמות והתאמת ההתערבות בהתאם.
          </p>
          <p>
            במידה ויש שאלות נוספות או צורך בהבהרות, אנא צרו קשר עם הגורם המקצועי המלווה.
          </p>
        </div>
      </div>
      
      <div className="mt-12 pt-8 border-t text-right text-sm text-gray-500">
        <p className="mb-3">בהצלחה ל{clientInfo.child_first_name}!</p>
        <br />
        <br />
        <br />
        <p className="font-bold">{evaluatorAssessment?.evaluator?.name || 'שם המאבחן/ת'}</p>
        <p>פסיכולוג/ית מומחה/ית</p>
        <p>רישיון מס׳ {evaluatorAssessment?.evaluator?.licenseNo || '______'}</p>
        <br />
        <br />
        <br />
        <p>חתימה וחותמת:</p>
      </div>
    </div>
  );
};

export default ReportContent;