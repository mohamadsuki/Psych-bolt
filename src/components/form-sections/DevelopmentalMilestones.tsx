import React from 'react';
import { useFormContext } from '../../context/FormContext';
import FormField from '../ui/FormField';
import TextInput from '../ui/TextInput';
import TextArea from '../ui/TextArea';
import RadioGroup from '../ui/RadioGroup';
import ConditionalField from '../ui/ConditionalField';

const DevelopmentalMilestones: React.FC = () => {
  const { formData, updateFormData } = useFormContext();
  const milestonesData = formData.developmentalMilestones;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Convert string to number for numeric fields
    if (
      ['sitting', 'crawling', 'walking', 'firstWord', 'twoWordSentences', 'toiletTraining'].includes(name)
    ) {
      updateFormData('developmentalMilestones', { [name]: Number(value) || 0 });
    } else {
      updateFormData('developmentalMilestones', { [name]: value });
    }
  };

  const handleBooleanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateFormData('developmentalMilestones', { [name]: value === 'true' });
  };

  return (
    <div className="animate-fadeIn">
      <h2 className="text-xl font-semibold mb-6 text-gray-800 border-b pb-2">אבני דרך התפתחותיות</h2>
      <p className="text-gray-600 mb-4">
        אנא ציינו את הגיל (בחודשים) שבו ילדכם הגיע לאבני הדרך הבאות. אם אינכם זוכרים את הגיל המדויק, נסו להעריך בקירוב.
      </p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
        <FormField label="ישיבה ללא תמיכה (חודשים)">
          <TextInput
            type="number"
            name="sitting"
            value={milestonesData.sitting}
            onChange={handleChange}
            min={0}
          />
        </FormField>

        <FormField label="זחילה (חודשים)">
          <TextInput
            type="number"
            name="crawling"
            value={milestonesData.crawling}
            onChange={handleChange}
            min={0}
          />
        </FormField>

        <FormField label="הליכה עצמאית (חודשים)">
          <TextInput
            type="number"
            name="walking"
            value={milestonesData.walking}
            onChange={handleChange}
            min={0}
          />
        </FormField>

        <FormField label="מילה ראשונה משמעותית (חודשים)">
          <TextInput
            type="number"
            name="firstWord"
            value={milestonesData.firstWord}
            onChange={handleChange}
            min={0}
          />
        </FormField>

        <FormField label="צירוף מילים/משפטים (חודשים)">
          <TextInput
            type="number"
            name="twoWordSentences"
            value={milestonesData.twoWordSentences}
            onChange={handleChange}
            min={0}
          />
        </FormField>

        <FormField label="גמילה מחיתולים (חודשים)">
          <TextInput
            type="number"
            name="toiletTraining"
            value={milestonesData.toiletTraining}
            onChange={handleChange}
            min={0}
          />
        </FormField>
      </div>

      <div className="mt-6">
        <FormField label="האם היו חששות לגבי ההתפתחות המוטורית?">
          <RadioGroup
            options={[
              { label: 'כן', value: true },
              { label: 'לא', value: false }
            ]}
            name="concernsMotor"
            value={milestonesData.concernsMotor}
            onChange={handleBooleanChange}
          />
        </FormField>

        <ConditionalField show={milestonesData.concernsMotor}>
          <FormField label="אנא פרטו את החששות לגבי ההתפתחות המוטורית">
            <TextArea
              name="concernsMotorDetails"
              value={milestonesData.concernsMotorDetails}
              onChange={handleChange}
              rows={3}
            />
          </FormField>
        </ConditionalField>

        <FormField label="האם היו חששות לגבי התפתחות השפה והדיבור?">
          <RadioGroup
            options={[
              { label: 'כן', value: true },
              { label: 'לא', value: false }
            ]}
            name="concernsSpeech"
            value={milestonesData.concernsSpeech}
            onChange={handleBooleanChange}
          />
        </FormField>

        <ConditionalField show={milestonesData.concernsSpeech}>
          <FormField label="אנא פרטו את החששות לגבי התפתחות השפה והדיבור">
            <TextArea
              name="concernsSpeechDetails"
              value={milestonesData.concernsSpeechDetails}
              onChange={handleChange}
              rows={3}
            />
          </FormField>
        </ConditionalField>
      </div>
    </div>
  );
};

export default DevelopmentalMilestones;