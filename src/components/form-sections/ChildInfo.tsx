import React, { useEffect } from 'react';
import { useFormContext } from '../../context/FormContext';
import FormField from '../ui/FormField';
import TextInput from '../ui/TextInput';
import TextArea from '../ui/TextArea';
import RadioGroup from '../ui/RadioGroup';
import { formatDateToDDMMYYYY, formatDateForInput } from '../../utils/dateUtils';

interface ChildInfoProps {
  readOnly?: boolean;
}

const ChildInfo: React.FC<ChildInfoProps> = ({ readOnly = false }) => {
  const { formData, updateFormData, formErrors, validateField } = useFormContext();
  const childData = formData.child;

  useEffect(() => {
    // Set default gender to male if it's not yet set
    if (!childData.gender) {
      updateFormData('child', { gender: 'male' });
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (readOnly) return;
    
    const { name, value } = e.target;
    updateFormData('child', { [name]: value });
    
    // Validate the field if it's required
    if (['firstName', 'lastName', 'dob', 'parentName', 'parentPhone', 'idNumber'].includes(name)) {
      validateField('child', name, value);
    }
  };

  const handleGenderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (readOnly) return;
    updateFormData('child', { gender: e.target.value });
  };

  const validateIdNumber = (value: string) => {
    // Check if it's a 9-digit number
    return /^\d{9}$/.test(value) ? null : 'מספר תעודת זהות חייב להיות 9 ספרות';
  };

  return (
    <div className="animate-fadeIn">
      <h2 className="text-xl font-semibold mb-6 text-gray-800 border-b pb-2">פרטים אישיים</h2>
      
      <FormField 
        label="מספר תעודת זהות של הילד/ה" 
        required
        error={formErrors.child?.idNumber}
      >
        <TextInput
          name="idNumber"
          value={childData.idNumber || ''}
          onChange={handleChange}
          onBlur={(e) => validateField('child', 'idNumber', e.target.value, validateIdNumber)}
          placeholder="9 ספרות ללא מקף"
          maxLength={9}
          required
          readOnly={readOnly}
        />
        <p className="text-xs text-gray-500 mt-1">מספר תעודת זהות ישמש כמספר הייחודי של הלקוח במערכת</p>
      </FormField>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField 
          label="שם פרטי" 
          required
          error={formErrors.child?.firstName}
        >
          <TextInput
            name="firstName"
            value={childData.firstName}
            onChange={handleChange}
            onBlur={(e) => validateField('child', 'firstName', e.target.value)}
            required
            readOnly={readOnly}
          />
        </FormField>

        <FormField 
          label="שם משפחה" 
          required
          error={formErrors.child?.lastName}
        >
          <TextInput
            name="lastName"
            value={childData.lastName}
            onChange={handleChange}
            onBlur={(e) => validateField('child', 'lastName', e.target.value)}
            required
            readOnly={readOnly}
          />
        </FormField>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField 
          label="תאריך לידה" 
          required
          error={formErrors.child?.dob}
        >
          <TextInput
            type="date"
            name="dob"
            value={formatDateForInput(childData.dob)}
            onChange={handleChange}
            onBlur={(e) => validateField('child', 'dob', e.target.value)}
            required
            readOnly={readOnly}
          />
          {childData.dob && (
            <p className="text-sm text-gray-500 mt-1">
              {formatDateToDDMMYYYY(childData.dob)}
            </p>
          )}
        </FormField>

        <FormField label="מגדר">
          <RadioGroup
            options={[
              { label: 'זכר', value: 'male' },
              { label: 'נקבה', value: 'female' }
            ]}
            name="gender"
            value={childData.gender}
            onChange={handleGenderChange}
            disabled={readOnly}
          />
        </FormField>
      </div>

      <FormField label="כתובת מגורים">
        <TextArea
          name="address"
          value={childData.address}
          onChange={handleChange}
          placeholder="רחוב, מספר, עיר, מיקוד"
          rows={2}
          readOnly={readOnly}
        />
      </FormField>

      <div className="mt-8">
        <h3 className="text-lg font-medium mb-4 text-gray-700">פרטי הורה/אפוטרופוס</h3>
        
        <FormField 
          label="שם מלא" 
          required
          error={formErrors.child?.parentName}
        >
          <TextInput
            name="parentName"
            value={childData.parentName}
            onChange={handleChange}
            onBlur={(e) => validateField('child', 'parentName', e.target.value)}
            required
            readOnly={readOnly}
          />
        </FormField>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField 
            label="טלפון" 
            required
            error={formErrors.child?.parentPhone}
          >
            <TextInput
              type="tel"
              name="parentPhone"
              value={childData.parentPhone}
              onChange={handleChange}
              onBlur={(e) => validateField('child', 'parentPhone', e.target.value)}
              required
              readOnly={readOnly}
            />
          </FormField>

          <FormField label="דוא״ל">
            <TextInput
              type="email"
              name="parentEmail"
              value={childData.parentEmail}
              onChange={handleChange}
              readOnly={readOnly}
            />
          </FormField>
        </div>
      </div>
    </div>
  );
};

export default ChildInfo;