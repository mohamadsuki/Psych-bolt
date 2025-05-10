import React from 'react';
import { useEvaluator } from '../../context/EvaluatorContext';
import FormField from '../ui/FormField';
import TextArea from '../ui/TextArea';

const Recommendations: React.FC = () => {
  const { evaluatorData, updateEvaluatorData, formErrors, validateField } = useEvaluator();
  const recommendationsData = evaluatorData.recommendations;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    updateEvaluatorData('recommendations', { [name]: value });
    
    // Validate required fields
    validateField('recommendations', name, value);
  };

  return (
    <div className="animate-fadeIn">
      <h2 className="text-xl font-semibold mb-6 text-gray-800 border-b pb-2">המלצות</h2>
      
      <div className="space-y-6">
        <FormField 
          label="המלצות לצוות החינוכי" 
          required
          error={formErrors.recommendations?.school}
        >
          <TextArea
            name="school"
            value={recommendationsData.school}
            onChange={handleChange}
            onBlur={(e) => validateField('recommendations', 'school', e.target.value)}
            placeholder="פרט המלצות מעשיות וברורות שניתן ליישם בסביבה החינוכית"
            rows={6}
            required
          />
          <p className="mt-2 text-sm text-gray-500">
            כלול התייחסות להתאמות בדרכי למידה והוראה, סביבת למידה, תמיכות נדרשות, התאמות בדרכי היבחנות (אם רלוונטי) וכד'.
          </p>
        </FormField>
        
        <FormField 
          label="המלצות להורים" 
          required
          error={formErrors.recommendations?.parents}
        >
          <TextArea
            name="parents"
            value={recommendationsData.parents}
            onChange={handleChange}
            onBlur={(e) => validateField('recommendations', 'parents', e.target.value)}
            placeholder="פרט המלצות מעשיות וברורות שניתן ליישם בבית ובסביבת המשפחה"
            rows={6}
            required
          />
          <p className="mt-2 text-sm text-gray-500">
            כלול התייחסות לתמיכה בתהליכי למידה, התמודדות עם קשיים, חיזוק תחומי חוזק, המלצות להמשך מעקב/טיפול וכד'.
          </p>
        </FormField>
      </div>
      
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-medium text-blue-800 mb-2">טיפים לכתיבת המלצות אפקטיביות:</h3>
        <ul className="list-disc list-inside space-y-1 text-blue-700 text-sm">
          <li>יש לנסח המלצות ספציפיות, ברורות וישימות</li>
          <li>יש להתאים את רמת הפירוט לצרכי הנמען (הורים/צוות חינוכי)</li>
          <li>יש לתעדף את ההמלצות לפי חשיבותן ודחיפותן</li>
          <li>יש להתבסס על הממצאים והמסקנות מהאבחון</li>
          <li>יש להציע גורמי טיפול והתערבות מתאימים (לפי הצורך)</li>
        </ul>
      </div>
    </div>
  );
};

export default Recommendations;