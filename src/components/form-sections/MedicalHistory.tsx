import React from 'react';
import { useFormContext } from '../../context/FormContext';
import FormField from '../ui/FormField';
import TextArea from '../ui/TextArea';
import RadioGroup from '../ui/RadioGroup';
import ConditionalField from '../ui/ConditionalField';

const MedicalHistory: React.FC = () => {
  const { formData, updateFormData } = useFormContext();
  const medicalData = formData.medicalHistory;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    updateFormData('medicalHistory', { [name]: value });
  };

  const handleBooleanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateFormData('medicalHistory', { [name]: value === 'true' });
  };

  return (
    <div className="animate-fadeIn">
      <h2 className="text-xl font-semibold mb-6 text-gray-800 border-b pb-2">היסטוריה רפואית</h2>
      
      <FormField label="האם לילדכם יש מצבים רפואיים כרוניים?">
        <RadioGroup
          options={[
            { label: 'כן', value: true },
            { label: 'לא', value: false }
          ]}
          name="chronicConditions"
          value={medicalData.chronicConditions}
          onChange={handleBooleanChange}
        />
      </FormField>

      <ConditionalField show={medicalData.chronicConditions}>
        <FormField label="אנא פרטו את המצבים הרפואיים הכרוניים">
          <TextArea
            name="chronicConditionsDetails"
            value={medicalData.chronicConditionsDetails}
            onChange={handleChange}
            rows={3}
          />
        </FormField>
      </ConditionalField>

      <FormField label="האם ילדכם נוטל תרופות כלשהן?">
        <RadioGroup
          options={[
            { label: 'כן', value: true },
            { label: 'לא', value: false }
          ]}
          name="medications"
          value={medicalData.medications}
          onChange={handleBooleanChange}
        />
      </FormField>

      <ConditionalField show={medicalData.medications}>
        <FormField label="אנא פרטו את התרופות, המינון ותדירות הנטילה">
          <TextArea
            name="medicationsDetails"
            value={medicalData.medicationsDetails}
            onChange={handleChange}
            rows={3}
          />
        </FormField>
      </ConditionalField>

      <FormField label="האם ילדכם היה מאושפז אי פעם?">
        <RadioGroup
          options={[
            { label: 'כן', value: true },
            { label: 'לא', value: false }
          ]}
          name="hospitalizations"
          value={medicalData.hospitalizations}
          onChange={handleBooleanChange}
        />
      </FormField>

      <ConditionalField show={medicalData.hospitalizations}>
        <FormField label="אנא פרטו את סיבות האשפוז, מועדים ומשך האשפוז">
          <TextArea
            name="hospitalizationsDetails"
            value={medicalData.hospitalizationsDetails}
            onChange={handleChange}
            rows={3}
          />
        </FormField>
      </ConditionalField>

      <FormField label="האם ידוע על אלרגיות כלשהן?">
        <RadioGroup
          options={[
            { label: 'כן', value: true },
            { label: 'לא', value: false }
          ]}
          name="allergies"
          value={medicalData.allergies}
          onChange={handleBooleanChange}
        />
      </FormField>

      <ConditionalField show={medicalData.allergies}>
        <FormField label="אנא פרטו את האלרגיות ואת חומרת התגובה">
          <TextArea
            name="allergiesDetails"
            value={medicalData.allergiesDetails}
            onChange={handleChange}
            rows={3}
          />
        </FormField>
      </ConditionalField>

      <FormField label="האם היו בעיות שמיעה או אוזניים?">
        <RadioGroup
          options={[
            { label: 'כן', value: true },
            { label: 'לא', value: false }
          ]}
          name="hearing"
          value={medicalData.hearing}
          onChange={handleBooleanChange}
        />
      </FormField>

      <ConditionalField show={medicalData.hearing}>
        <FormField label="אנא פרטו את בעיות השמיעה וטיפולים שניתנו">
          <TextArea
            name="hearingDetails"
            value={medicalData.hearingDetails}
            onChange={handleChange}
            rows={3}
          />
        </FormField>
      </ConditionalField>

      <FormField label="האם היו בעיות ראייה או עיניים?">
        <RadioGroup
          options={[
            { label: 'כן', value: true },
            { label: 'לא', value: false }
          ]}
          name="vision"
          value={medicalData.vision}
          onChange={handleBooleanChange}
        />
      </FormField>

      <ConditionalField show={medicalData.vision}>
        <FormField label="אנא פרטו את בעיות הראייה וטיפולים שניתנו">
          <TextArea
            name="visionDetails"
            value={medicalData.visionDetails}
            onChange={handleChange}
            rows={3}
          />
        </FormField>
      </ConditionalField>
    </div>
  );
};

export default MedicalHistory;