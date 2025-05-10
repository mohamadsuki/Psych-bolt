import React from 'react';
import { useFormContext } from '../../context/FormContext';
import FormField from '../ui/FormField';
import TextInput from '../ui/TextInput';
import TextArea from '../ui/TextArea';
import RadioGroup from '../ui/RadioGroup';
import ConditionalField from '../ui/ConditionalField';

const ReferralInfo: React.FC = () => {
  const { formData, updateFormData, formErrors, validateField } = useFormContext();
  const referralData = formData.referral;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    updateFormData('referral', { [name]: value });
    
    // Validate if it's a required field
    if (name === 'chiefConcern') {
      validateField('referral', name, value);
    }
  };

  const handleBooleanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateFormData('referral', { [name]: value === 'true' });
  };

  return (
    <div className="animate-fadeIn">
      <h2 className="text-xl font-semibold mb-6 text-gray-800 border-b pb-2">סיבת הפנייה</h2>
      
      <FormField 
        label="מהי הסיבה העיקרית לפנייה לאבחון?" 
        required
        error={formErrors.referral?.chiefConcern}
      >
        <TextArea
          name="chiefConcern"
          value={referralData.chiefConcern}
          onChange={handleChange}
          onBlur={(e) => validateField('referral', 'chiefConcern', e.target.value)}
          placeholder="אנא תארו את הקשיים או האתגרים העיקריים"
          required
          rows={3}
        />
      </FormField>

      <FormField label="מתי הבחנתם לראשונה בקשיים? (גיל בחודשים)">
        <TextInput
          type="number"
          name="onsetMonths"
          value={referralData.onsetMonths}
          onChange={handleChange}
          min={0}
        />
      </FormField>

      <FormField label="מי הפנה אתכם לאבחון?">
        <TextInput
          name="referralSource"
          value={referralData.referralSource}
          onChange={handleChange}
          placeholder="רופא, גננת, יועצת, הורים וכו׳"
        />
      </FormField>

      <FormField label="האם ילדכם עבר אבחונים קודמים?">
        <RadioGroup
          options={[
            { label: 'כן', value: true },
            { label: 'לא', value: false }
          ]}
          name="previousEvaluations"
          value={referralData.previousEvaluations}
          onChange={handleBooleanChange}
        />
      </FormField>

      <ConditionalField show={referralData.previousEvaluations}>
        <FormField label="אנא פרטו אילו אבחונים נערכו, מתי ומה היו התוצאות">
          <TextArea
            name="previousEvaluationsDetails"
            value={referralData.previousEvaluationsDetails}
            onChange={handleChange}
            rows={3}
          />
        </FormField>
      </ConditionalField>
    </div>
  );
};

export default ReferralInfo;