import React from 'react';
import { useFormContext } from '../../context/FormContext';
import FormField from '../ui/FormField';
import TextInput from '../ui/TextInput';
import TextArea from '../ui/TextArea';
import RadioGroup from '../ui/RadioGroup';
import ConditionalField from '../ui/ConditionalField';

const Education: React.FC = () => {
  const { formData, updateFormData } = useFormContext();
  const educationData = formData.education;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    updateFormData('education', { [name]: value });
  };

  const handleBooleanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateFormData('education', { [name]: value === 'true' });
  };

  return (
    <div className="animate-fadeIn">
      <h2 className="text-xl font-semibold mb-6 text-gray-800 border-b pb-2">מסגרת חינוכית</h2>
      
      <FormField label="המסגרת החינוכית הנוכחית">
        <TextInput
          name="currentSetting"
          value={educationData.currentSetting}
          onChange={handleChange}
          placeholder="גן, בית ספר רגיל, חינוך מיוחד וכו׳"
        />
      </FormField>

      <FormField label="שם המסגרת החינוכית">
        <TextInput
          name="schoolName"
          value={educationData.schoolName}
          onChange={handleChange}
        />
      </FormField>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="כיתה / שכבה">
          <TextInput
            name="grade"
            value={educationData.grade}
            onChange={handleChange}
          />
        </FormField>

        <FormField label="שם המחנכת / גננת">
          <TextInput
            name="teacherName"
            value={educationData.teacherName}
            onChange={handleChange}
          />
        </FormField>
      </div>

      <FormField label="איך הילד/ה מתפקד/ת מבחינה לימודית?">
        <TextArea
          name="academicPerformance"
          value={educationData.academicPerformance}
          onChange={handleChange}
          placeholder="תארו את רמת הביצועים בתחומים שונים"
          rows={3}
        />
      </FormField>

      <FormField label="האם הילד/ה מקבל/ת שירותים מיוחדים במסגרת החינוכית?">
        <RadioGroup
          options={[
            { label: 'כן', value: true },
            { label: 'לא', value: false }
          ]}
          name="specialServices"
          value={educationData.specialServices}
          onChange={handleBooleanChange}
        />
      </FormField>

      <ConditionalField show={educationData.specialServices}>
        <FormField label="אנא פרטו את השירותים המיוחדים">
          <TextArea
            name="specialServicesDetails"
            value={educationData.specialServicesDetails}
            onChange={handleChange}
            placeholder="למשל: שילוב, סייעת, התאמות וכו׳"
            rows={3}
          />
        </FormField>
      </ConditionalField>

      <FormField label="האם יש קשיים התנהגותיים במסגרת החינוכית?">
        <RadioGroup
          options={[
            { label: 'כן', value: true },
            { label: 'לא', value: false }
          ]}
          name="behavioralConcerns"
          value={educationData.behavioralConcerns}
          onChange={handleBooleanChange}
        />
      </FormField>

      <ConditionalField show={educationData.behavioralConcerns}>
        <FormField label="אנא פרטו את הקשיים ההתנהגותיים">
          <TextArea
            name="behavioralConcernsDetails"
            value={educationData.behavioralConcernsDetails}
            onChange={handleChange}
            rows={3}
          />
        </FormField>
      </ConditionalField>
    </div>
  );
};

export default Education;