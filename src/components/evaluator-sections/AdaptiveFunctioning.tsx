import React from 'react';
import { useEvaluator } from '../../context/EvaluatorContext';
import FormField from '../ui/FormField';
import TextInput from '../ui/TextInput';
import TextArea from '../ui/TextArea';

const AdaptiveFunctioning: React.FC = () => {
  const { evaluatorData, updateEvaluatorData } = useEvaluator();
  const adaptiveData = evaluatorData.adaptive;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseInt(value) || 0;
    
    updateEvaluatorData('adaptive', { [name]: numValue });
  };

  const handleSummaryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateEvaluatorData('adaptive', { summary: e.target.value });
  };

  return (
    <div className="animate-fadeIn">
      <h2 className="text-xl font-semibold mb-6 text-gray-800 border-b pb-2">תפקוד אדפטיבי</h2>
      
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h3 className="font-medium text-gray-700 mb-3">מדדי תפקוד אדפטיבי (ציוני תקן)</h3>
        <p className="text-sm text-gray-500 mb-4">
          הזן ערכים מתוך שאלון Vineland-3 או כלים דומים. ציונים נמוכים יותר מצביעים על קשיים רבים יותר (ממוצע 100, ס.ת. 15).
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="תקשורת">
            <TextInput
              type="number"
              name="communication"
              value={adaptiveData.communication}
              onChange={handleChange}
              min={40}
              max={160}
            />
          </FormField>
          
          <FormField label="כישורי יום-יום">
            <TextInput
              type="number"
              name="dailyLiving"
              value={adaptiveData.dailyLiving}
              onChange={handleChange}
              min={40}
              max={160}
            />
          </FormField>
          
          <FormField label="חברתיות">
            <TextInput
              type="number"
              name="socialization"
              value={adaptiveData.socialization}
              onChange={handleChange}
              min={40}
              max={160}
            />
          </FormField>
          
          <FormField label="מיומנויות מוטוריות">
            <TextInput
              type="number"
              name="motorSkills"
              value={adaptiveData.motorSkills}
              onChange={handleChange}
              min={40}
              max={160}
            />
          </FormField>
        </div>
      </div>
      
      <FormField label="סיכום והתרשמות לגבי תפקוד אדפטיבי">
        <TextArea
          name="summary"
          value={adaptiveData.summary}
          onChange={handleSummaryChange}
          placeholder="תאר את מידת העצמאות בתפקוד היומיומי, חוזקות וקשיים בתפקוד אדפטיבי, השוואה לקבוצת הגיל"
          rows={4}
        />
      </FormField>
      
      <div className="mt-4 text-sm text-gray-500">
        <p>* יש לכלול התייחסות לתפקוד אדפטיבי גם בסביבת הבית וגם בסביבת בית הספר/גן</p>
        <p>* חשוב לציין פערים משמעותיים בין תחומי תפקוד שונים (אם קיימים)</p>
      </div>
    </div>
  );
};

export default AdaptiveFunctioning;