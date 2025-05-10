import React from 'react';
import { useEvaluator } from '../../context/EvaluatorContext';
import FormField from '../ui/FormField';
import TextInput from '../ui/TextInput';
import TextArea from '../ui/TextArea';

const AdministrativeDetails: React.FC = () => {
  const { evaluatorData, updateEvaluatorData, formErrors, validateField } = useEvaluator();
  const adminData = evaluatorData.evaluator;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    updateEvaluatorData('evaluator', { [name]: value });
    
    // Validate required fields
    if (['name', 'licenseNo', 'examDate', 'referralReason'].includes(name)) {
      validateField('evaluator', name, value);
    }
  };

  return (
    <div className="animate-fadeIn">
      <h2 className="text-xl font-semibold mb-6 text-gray-800 border-b pb-2">פרטים מנהליים</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField 
          label="שם המאבחן/ת" 
          required
          error={formErrors.evaluator?.name}
        >
          <TextInput
            name="name"
            value={adminData.name}
            onChange={handleChange}
            onBlur={(e) => validateField('evaluator', 'name', e.target.value)}
            placeholder="השם המלא של המאבחן/ת"
            required
          />
        </FormField>

        <FormField 
          label="מספר רישיון" 
          required
          error={formErrors.evaluator?.licenseNo}
        >
          <TextInput
            name="licenseNo"
            value={adminData.licenseNo}
            onChange={handleChange}
            onBlur={(e) => validateField('evaluator', 'licenseNo', e.target.value)}
            placeholder="מספר רישיון משרד הבריאות"
            required
          />
        </FormField>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField 
          label="תאריך האבחון" 
          required
          error={formErrors.evaluator?.examDate}
        >
          <TextInput
            type="date"
            name="examDate"
            value={adminData.examDate}
            onChange={handleChange}
            onBlur={(e) => validateField('evaluator', 'examDate', e.target.value)}
            required
          />
        </FormField>

        <FormField label="מקום האבחון">
          <TextInput
            name="location"
            value={adminData.location}
            onChange={handleChange}
            placeholder="מכון, בי״ס, בית, אחר"
          />
        </FormField>
      </div>

      <FormField 
        label="סיבת ההפניה (כפי שהגיעה מהמוסד / ההורה)" 
        required
        error={formErrors.evaluator?.referralReason}
      >
        <TextArea
          name="referralReason"
          value={adminData.referralReason}
          onChange={handleChange}
          onBlur={(e) => validateField('evaluator', 'referralReason', e.target.value)}
          placeholder="תיאור מדויק של סיבת ההפניה והגורם המפנה"
          rows={4}
          required
        />
      </FormField>
    </div>
  );
};

export default AdministrativeDetails;