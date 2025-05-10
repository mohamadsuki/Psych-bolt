import React, { useState } from 'react';
import { updateClientRecord } from '../../lib/supabase';
import { X, Save, Loader } from 'lucide-react';
import FormField from '../ui/FormField';
import TextInput from '../ui/TextInput';
import { formatDateToDDMMYYYY, formatDateForInput } from '../../utils/dateUtils';

interface Client {
  id: string;
  child_first_name: string;
  child_last_name: string;
  child_dob: string;
  parent_name: string;
  parent_phone: string;
  parent_email: string;
  id_number: string;
}

interface EditClientModalProps {
  client: Client;
  onClose: (success: boolean) => void;
}

const EditClientModal: React.FC<EditClientModalProps> = ({ client, onClose }) => {
  const [formData, setFormData] = useState({
    firstName: client.child_first_name,
    lastName: client.child_last_name,
    dob: formatDateForInput(client.child_dob),
    parentName: client.parent_name,
    parentPhone: client.parent_phone || '',
    parentEmail: client.parent_email || '',
    idNumber: client.id_number || '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Required fields
    if (!formData.firstName) newErrors.firstName = 'שדה חובה';
    if (!formData.lastName) newErrors.lastName = 'שדה חובה';
    if (!formData.dob) newErrors.dob = 'שדה חובה';
    if (!formData.parentName) newErrors.parentName = 'שדה חובה';
    if (!formData.parentPhone) newErrors.parentPhone = 'שדה חובה';
    
    // ID number validation - must be 9 digits
    if (!formData.idNumber) {
      newErrors.idNumber = 'שדה חובה';
    } else if (!/^\d{9}$/.test(formData.idNumber)) {
      newErrors.idNumber = 'מספר תעודת זהות חייב להיות 9 ספרות בדיוק';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    setApiError(null);
    
    try {
      await updateClientRecord(client.id, formData);
      onClose(true); // Success
    } catch (error) {
      console.error('Error updating client:', error);
      setApiError(error.message || 'אירעה שגיאה בעדכון פרטי המטופל');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full mx-4 relative">
        <button
          onClick={() => onClose(false)}
          className="absolute left-4 top-4 text-gray-500 hover:text-gray-700"
          aria-label="סגור"
        >
          <X size={24} />
        </button>
        
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">עריכת פרטי מטופל</h2>
          <p className="text-gray-600">
            עדכן את פרטי המטופל ולחץ על "שמור" כדי לשמור את השינויים
          </p>
        </div>
        
        {apiError && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg">
            {apiError}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField 
            label="מספר תעודת זהות" 
            required 
            error={errors.idNumber}
          >
            <TextInput
              name="idNumber"
              value={formData.idNumber}
              onChange={handleChange}
              placeholder="9 ספרות ללא מקף"
              maxLength={9}
              required
            />
          </FormField>
          
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField 
              label="שם פרטי" 
              required 
              error={errors.firstName}
            >
              <TextInput
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </FormField>
            
            <FormField 
              label="שם משפחה" 
              required 
              error={errors.lastName}
            >
              <TextInput
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </FormField>
          </div>
          
          <FormField 
            label="תאריך לידה" 
            required 
            error={errors.dob}
          >
            <TextInput
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              required
            />
            {formData.dob && (
              <p className="text-sm text-gray-500 mt-1">
                תאריך לידה: {formatDateToDDMMYYYY(formData.dob)}
              </p>
            )}
          </FormField>
          
          <FormField 
            label="שם הורה/אפוטרופוס" 
            required 
            error={errors.parentName}
          >
            <TextInput
              name="parentName"
              value={formData.parentName}
              onChange={handleChange}
              required
            />
          </FormField>
          
          <FormField 
            label="טלפון" 
            required 
            error={errors.parentPhone}
          >
            <TextInput
              type="tel"
              name="parentPhone"
              value={formData.parentPhone}
              onChange={handleChange}
              required
            />
          </FormField>
          
          <FormField label="דוא״ל">
            <TextInput
              type="email"
              name="parentEmail"
              value={formData.parentEmail}
              onChange={handleChange}
            />
          </FormField>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => onClose(false)}
            className="px-4 py-2 mr-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            ביטול
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors flex items-center"
          >
            {loading ? (
              <>
                <Loader size={16} className="animate-spin ml-2" />
                שומר...
              </>
            ) : (
              <>
                <Save size={16} className="ml-2" />
                שמור שינויים
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditClientModal;