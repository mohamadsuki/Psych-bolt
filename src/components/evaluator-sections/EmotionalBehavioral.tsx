import React from 'react';
import { useEvaluator } from '../../context/EvaluatorContext';
import FormField from '../ui/FormField';
import TextInput from '../ui/TextInput';
import TextArea from '../ui/TextArea';

const EmotionalBehavioral: React.FC = () => {
  const { evaluatorData, updateEvaluatorData } = useEvaluator();
  const emotionalData = evaluatorData.emotionalBehavioral;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseInt(value) || 0;
    
    updateEvaluatorData('emotionalBehavioral', { [name]: numValue });
  };

  const handleSummaryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateEvaluatorData('emotionalBehavioral', { summary: e.target.value });
  };

  return (
    <div className="animate-fadeIn">
      <h2 className="text-xl font-semibold mb-6 text-gray-800 border-b pb-2">תפקוד ריגשי-התנהגותי</h2>
      
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h3 className="font-medium text-gray-700 mb-3">מדדים ריגשיים-התנהגותיים (T-scores)</h3>
        <p className="text-sm text-gray-500 mb-4">
          הזן ערכים מתוך שאלוני BASC-3, CBCL, SDQ או מבחנים אחרים. ציוני T גבוהים יותר מצביעים על קשיים רבים יותר (ממוצע 50, ס.ת. 10).
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="חרדה">
            <TextInput
              type="number"
              name="anxiety"
              value={emotionalData.anxiety}
              onChange={handleChange}
              min={0}
              max={100}
            />
          </FormField>
          
          <FormField label="דיכאון">
            <TextInput
              type="number"
              name="depression"
              value={emotionalData.depression}
              onChange={handleChange}
              min={0}
              max={100}
            />
          </FormField>
          
          <FormField label="תוקפנות">
            <TextInput
              type="number"
              name="aggression"
              value={emotionalData.aggression}
              onChange={handleChange}
              min={0}
              max={100}
            />
          </FormField>
          
          <FormField label="נסיגה חברתית">
            <TextInput
              type="number"
              name="withdrawal"
              value={emotionalData.withdrawal}
              onChange={handleChange}
              min={0}
              max={100}
            />
          </FormField>
        </div>
      </div>
      
      <FormField label="סיכום והתרשמות לגבי תפקוד ריגשי-התנהגותי">
        <TextArea
          name="summary"
          value={emotionalData.summary}
          onChange={handleSummaryChange}
          placeholder="תאר את ההיבטים הרגשיים וההתנהגותיים הבולטים, השפעתם על התפקוד היומיומי והלמידה"
          rows={6}
        />
      </FormField>
      
      <div className="mt-4 text-sm text-gray-500">
        <p>* יש לכלול בסיכום התייחסות לתוצאות משאלונים להורים ולמורים (אם רלוונטי)</p>
        <p>* חשוב לציין אם יש פער משמעותי בין דיווחים שונים (הורים/מורים/דיווח עצמי)</p>
      </div>
    </div>
  );
};

export default EmotionalBehavioral;