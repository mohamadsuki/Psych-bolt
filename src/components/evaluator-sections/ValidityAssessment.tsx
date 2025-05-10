import React from 'react';
import { useEvaluator } from '../../context/EvaluatorContext';
import FormField from '../ui/FormField';
import TextArea from '../ui/TextArea';

const ValidityAssessment: React.FC = () => {
  const { evaluatorData, updateEvaluatorData } = useEvaluator();
  
  // Ensure validityFactors is always treated as an array
  const validityFactors = Array.isArray(evaluatorData.validityFactors) 
    ? evaluatorData.validityFactors 
    : [];
  
  const validityFactorsOptions = [
    'שיתוף פעולה מלא',
    'שיתוף פעולה חלקי',
    'קושי בהבנת הוראות',
    'השפעת תרופות',
    'עייפות/כאב',
    'שפה אינה שפת אם',
    'קשיים רגשיים במהלך האבחון',
    'מגבלות בכלי האבחון',
    'אחר'
  ];

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    updateEvaluatorData('validityNotes', value);
  };

  const handleFactorChange = (factor: string, isChecked: boolean) => {
    // Use the local validityFactors variable to ensure it's an array
    let updatedFactors = [...validityFactors];
    
    if (isChecked) {
      updatedFactors.push(factor);
    } else {
      updatedFactors = updatedFactors.filter(item => item !== factor);
    }
    
    updateEvaluatorData('validityFactors', updatedFactors);
  };

  return (
    <div className="animate-fadeIn">
      <h2 className="text-xl font-semibold mb-6 text-gray-800 border-b pb-2">הערכת תוקף</h2>
      
      <div className="mb-6">
        <h3 className="font-medium text-gray-700 mb-3">גורמים המשפיעים על תוקף האבחון</h3>
        <div className="space-y-2">
          {validityFactorsOptions.map(factor => (
            <div key={factor} className="flex items-center">
              <input
                type="checkbox"
                id={`validity-${factor}`}
                // Use the local validityFactors variable to ensure includes is called on an array
                checked={validityFactors.includes(factor)}
                onChange={(e) => handleFactorChange(factor, e.target.checked)}
                className="ml-2 h-4 w-4 text-teal-600 rounded focus:ring-teal-500"
              />
              <label htmlFor={`validity-${factor}`} className="text-gray-700">
                {factor}
              </label>
            </div>
          ))}
        </div>
      </div>
      
      <FormField label="הערות והתייחסות לגבי תוקף האבחון">
        <TextArea
          name="validityNotes"
          value={evaluatorData.validityNotes || ''}
          onChange={handleNotesChange}
          placeholder="פרט גורמים שעשויים להשפיע על תוקף הממצאים והמסקנות, מגבלות האבחון, והאם יש צורך באבחון המשך או נוסף"
          rows={5}
        />
      </FormField>
      
      <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
        <h3 className="font-medium text-yellow-800 mb-2">חשיבות הערכת התוקף:</h3>
        <p className="text-yellow-700 text-sm">
          מטרתה של הערכת התוקף היא לציין באופן שקוף גורמים שעשויים להשפיע על דיוק הממצאים ולזהות מצבים בהם יש צורך בהערכה נוספת.
          חשוב לציין גורמים הן מצד הנבדק (מוטיבציה, מצב רגשי, השפעות תרופתיות) והן מצד תהליך האבחון עצמו (מגבלות כלים, תנאי בדיקה, וכד').
          הערכת תוקף איננה פוגמת באמינות האבחון אלא מחזקת אותה באמצעות שקיפות מקצועית.
        </p>
      </div>
    </div>
  );
};

export default ValidityAssessment;