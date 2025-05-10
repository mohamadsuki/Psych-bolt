import React from 'react';
import { useFormContext } from '../../context/FormContext';
import FormField from '../ui/FormField';
import TextInput from '../ui/TextInput';
import TextArea from '../ui/TextArea';
import RadioGroup from '../ui/RadioGroup';
import ConditionalField from '../ui/ConditionalField';

const PregnancyBirth: React.FC = () => {
  const { formData, updateFormData } = useFormContext();
  const pregnancyData = formData.pregnancy;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    updateFormData('pregnancy', { [name]: value });
  };

  const handleBooleanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateFormData('pregnancy', { [name]: value === 'true' });
  };

  return (
    <div className="animate-fadeIn">
      <h2 className="text-xl font-semibold mb-6 text-gray-800 border-b pb-2">הריון ולידה</h2>
      
      <FormField label="האם היו סיבוכים במהלך ההריון?">
        <RadioGroup
          options={[
            { label: 'כן', value: true },
            { label: 'לא', value: false }
          ]}
          name="complications"
          value={pregnancyData.complications}
          onChange={handleBooleanChange}
        />
      </FormField>

      <ConditionalField show={pregnancyData.complications}>
        <FormField label="אנא פרטו את הסיבוכים במהלך ההריון">
          <TextArea
            name="detailsPregnancy"
            value={pregnancyData.detailsPregnancy}
            onChange={handleChange}
            placeholder="כגון: יתר לחץ דם, סוכרת הריון, דימומים, זיהומים וכו׳"
            rows={3}
          />
        </FormField>
      </ConditionalField>

      <FormField label="משקל לידה (גרמים או ק״ג)">
        <TextInput
          name="birthWeight"
          value={pregnancyData.birthWeight}
          onChange={handleChange}
          placeholder="לדוגמה: 3.2 ק״ג או 3200 גרם"
        />
      </FormField>

      <FormField label="האם היו סיבוכים במהלך הלידה?">
        <RadioGroup
          options={[
            { label: 'כן', value: true },
            { label: 'לא', value: false }
          ]}
          name="birthComplications"
          value={pregnancyData.birthComplications}
          onChange={handleBooleanChange}
        />
      </FormField>

      <ConditionalField show={pregnancyData.birthComplications}>
        <FormField label="אנא פרטו את הסיבוכים במהלך הלידה">
          <TextArea
            name="birthComplicationsDetails"
            value={pregnancyData.birthComplicationsDetails}
            onChange={handleChange}
            placeholder="כגון: לידה מוקדמת, חוסר חמצן, מכשירנית, ניתוח קיסרי, וכו׳"
            rows={3}
          />
        </FormField>
      </ConditionalField>

      <FormField label="האם התינוק/ת שהה/תה בפגייה?">
        <RadioGroup
          options={[
            { label: 'כן', value: true },
            { label: 'לא', value: false }
          ]}
          name="nicu"
          value={pregnancyData.nicu}
          onChange={handleBooleanChange}
        />
      </FormField>

      <ConditionalField show={pregnancyData.nicu}>
        <FormField label="אנא פרטו את משך השהות בפגייה והסיבות">
          <TextArea
            name="nicuDetails"
            value={pregnancyData.nicuDetails}
            onChange={handleChange}
            rows={3}
          />
        </FormField>
      </ConditionalField>
    </div>
  );
};

export default PregnancyBirth;