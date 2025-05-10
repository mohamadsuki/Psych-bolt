import React from 'react';
import { useFormContext } from '../../context/FormContext';
import FormField from '../ui/FormField';
import TextArea from '../ui/TextArea';

const AdditionalInfo: React.FC = () => {
  const { formData, updateFormData } = useFormContext();
  const additionalData = formData.additionalInfo;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    updateFormData('additionalInfo', { [name]: value });
  };

  return (
    <div className="animate-fadeIn">
      <h2 className="text-xl font-semibold mb-6 text-gray-800 border-b pb-2">מידע נוסף</h2>
      
      <FormField label="האם יש שאלות ספציפיות שברצונכם שיענו במהלך האבחון?">
        <TextArea
          name="questions"
          value={additionalData.questions}
          onChange={handleChange}
          placeholder="שאלות או נושאים מסוימים שחשוב לכם לקבל עליהם מענה"
          rows={4}
        />
      </FormField>

      <FormField label="האם יש חששות או דאגות נוספות שלא הוזכרו בשאלון זה?">
        <TextArea
          name="concerns"
          value={additionalData.concerns}
          onChange={handleChange}
          placeholder="מידע נוסף שלא כוסה בשאלות הקודמות"
          rows={4}
        />
      </FormField>

      <FormField label="מהן המטרות העיקריות שלכם לגבי אבחון זה?">
        <TextArea
          name="goals"
          value={additionalData.goals}
          onChange={handleChange}
          placeholder="מה הייתם רוצים להשיג באמצעות תהליך האבחון"
          rows={4}
        />
      </FormField>
    </div>
  );
};

export default AdditionalInfo;