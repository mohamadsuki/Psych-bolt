import React from 'react';
import { useFormContext } from '../../context/FormContext';
import FormField from '../ui/FormField';
import TextArea from '../ui/TextArea';
import RadioGroup from '../ui/RadioGroup';
import ConditionalField from '../ui/ConditionalField';

const PreviousServices: React.FC = () => {
  const { formData, updateFormData } = useFormContext();
  const servicesData = formData.previousServices;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    updateFormData('previousServices', { [name]: value });
  };

  const handleBooleanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateFormData('previousServices', { [name]: value === 'true' });
  };

  return (
    <div className="animate-fadeIn">
      <h2 className="text-xl font-semibold mb-6 text-gray-800 border-b pb-2">שירותים טיפוליים קודמים</h2>
      <p className="text-gray-600 mb-4">
        האם ילדכם קיבל בעבר או מקבל כיום את השירותים/טיפולים הבאים?
      </p>
      
      <FormField label="טיפול בדיבור / קלינאות תקשורת">
        <RadioGroup
          options={[
            { label: 'כן', value: true },
            { label: 'לא', value: false }
          ]}
          name="speech"
          value={servicesData.speech}
          onChange={handleBooleanChange}
        />
      </FormField>

      <ConditionalField show={servicesData.speech}>
        <FormField label="אנא פרטו את הטיפול בקלינאות תקשורת (מתי, היכן, תדירות, התקדמות)">
          <TextArea
            name="speechDetails"
            value={servicesData.speechDetails}
            onChange={handleChange}
            rows={3}
          />
        </FormField>
      </ConditionalField>

      <FormField label="ריפוי בעיסוק">
        <RadioGroup
          options={[
            { label: 'כן', value: true },
            { label: 'לא', value: false }
          ]}
          name="occupational"
          value={servicesData.occupational}
          onChange={handleBooleanChange}
        />
      </FormField>

      <ConditionalField show={servicesData.occupational}>
        <FormField label="אנא פרטו את הטיפול בריפוי בעיסוק (מתי, היכן, תדירות, התקדמות)">
          <TextArea
            name="occupationalDetails"
            value={servicesData.occupationalDetails}
            onChange={handleChange}
            rows={3}
          />
        </FormField>
      </ConditionalField>

      <FormField label="פיזיותרפיה">
        <RadioGroup
          options={[
            { label: 'כן', value: true },
            { label: 'לא', value: false }
          ]}
          name="physical"
          value={servicesData.physical}
          onChange={handleBooleanChange}
        />
      </FormField>

      <ConditionalField show={servicesData.physical}>
        <FormField label="אנא פרטו את הטיפול בפיזיותרפיה (מתי, היכן, תדירות, התקדמות)">
          <TextArea
            name="physicalDetails"
            value={servicesData.physicalDetails}
            onChange={handleChange}
            rows={3}
          />
        </FormField>
      </ConditionalField>

      <FormField label="טיפול התנהגותי / ABA">
        <RadioGroup
          options={[
            { label: 'כן', value: true },
            { label: 'לא', value: false }
          ]}
          name="behavioral"
          value={servicesData.behavioral}
          onChange={handleBooleanChange}
        />
      </FormField>

      <ConditionalField show={servicesData.behavioral}>
        <FormField label="אנא פרטו את הטיפול ההתנהגותי (מתי, היכן, תדירות, התקדמות)">
          <TextArea
            name="behavioralDetails"
            value={servicesData.behavioralDetails}
            onChange={handleChange}
            rows={3}
          />
        </FormField>
      </ConditionalField>

      <FormField label="טיפול פסיכולוגי / רגשי">
        <RadioGroup
          options={[
            { label: 'כן', value: true },
            { label: 'לא', value: false }
          ]}
          name="psychological"
          value={servicesData.psychological}
          onChange={handleBooleanChange}
        />
      </FormField>

      <ConditionalField show={servicesData.psychological}>
        <FormField label="אנא פרטו את הטיפול הפסיכולוגי (מתי, היכן, תדירות, התקדמות)">
          <TextArea
            name="psychologicalDetails"
            value={servicesData.psychologicalDetails}
            onChange={handleChange}
            rows={3}
          />
        </FormField>
      </ConditionalField>
    </div>
  );
};

export default PreviousServices;