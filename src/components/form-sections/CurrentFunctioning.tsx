import React from 'react';
import { useFormContext } from '../../context/FormContext';
import FormField from '../ui/FormField';
import TextArea from '../ui/TextArea';

const CurrentFunctioning: React.FC = () => {
  const { formData, updateFormData } = useFormContext();
  const functioningData = formData.currentFunctioning;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    updateFormData('currentFunctioning', { [name]: value });
  };

  return (
    <div className="animate-fadeIn">
      <h2 className="text-xl font-semibold mb-6 text-gray-800 border-b pb-2">תפקוד נוכחי</h2>
      
      <FormField label="מהן החוזקות העיקריות של ילדכם?">
        <TextArea
          name="strengths"
          value={functioningData.strengths}
          onChange={handleChange}
          placeholder="תחומי עניין, כישרונות מיוחדים, תכונות חיוביות וכו׳"
          rows={3}
        />
      </FormField>

      <FormField label="מהם האתגרים העיקריים איתם ילדכם מתמודד כעת?">
        <TextArea
          name="challenges"
          value={functioningData.challenges}
          onChange={handleChange}
          placeholder="קשיים, מצבים מאתגרים, מגבלות וכו׳"
          rows={3}
        />
      </FormField>

      <FormField label="איך ילדכם מתפקד מבחינה חברתית?">
        <TextArea
          name="socialSkills"
          value={functioningData.socialSkills}
          onChange={handleChange}
          placeholder="יחסים עם חברים, התנהגות בקבוצה, אמפתיה וכו׳"
          rows={3}
        />
      </FormField>

      <FormField label="איך ילדכם מתפקד במטלות של עצמאות יומיומית?">
        <TextArea
          name="independence"
          value={functioningData.independence}
          onChange={handleChange}
          placeholder="לבוש, היגיינה, אכילה, סדר יום וכו׳"
          rows={3}
        />
      </FormField>

      <FormField label="כמה זמן מסך (טלוויזיה, מחשב, טאבלט, טלפון) ילדכם צורך ביום?">
        <TextArea
          name="screenTime"
          value={functioningData.screenTime}
          onChange={handleChange}
          placeholder="משך זמן, סוגי תוכן, השפעה על התנהגות וכו׳"
          rows={3}
        />
      </FormField>
    </div>
  );
};

export default CurrentFunctioning;