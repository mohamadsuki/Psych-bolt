import React, { useState } from 'react';
import { Users, ArrowLeft, Share2, AlertCircle, Loader } from 'lucide-react';
import { createClientRecord, getClientByIdNumber } from '../lib/supabase';
import ShareLinkModal from './modals/ShareLinkModal';
import { formatDateToDDMMYYYY, formatDateForInput } from '../utils/dateUtils';

interface NewClientFormProps {
  onComplete: (clientId?: string) => void;
  onBack: () => void;
}

const NewClientForm: React.FC<NewClientFormProps> = ({ onComplete, onBack }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    gender: 'male', // Default to male
    address: '', // Added address field
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    idNumber: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [newClient, setNewClient] = useState<any>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Clear API error when user modifies the form
    if (apiError) {
      setApiError(null);
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
      // First, check if a client with this ID number already exists
      const existingClient = await getClientByIdNumber(formData.idNumber);
      
      if (existingClient) {
        setApiError('מספר תעודת זהות כבר קיים במערכת. אנא השתמש במספר אחר או עדכן את הלקוח הקיים.');
        setLoading(false);
        return;
      }
      
      // If no existing client with this ID, proceed with creation
      const client = await createClientRecord(formData);
      setNewClient(client);
      setShowShareModal(true);
    } catch (error: any) {
      console.error('Error creating client:', error);
      setApiError(error.message || 'אירעה שגיאה ביצירת המטופל');
      setLoading(false);
    }
  };

  const handleShareComplete = () => {
    setShowShareModal(false);
    onComplete(newClient?.id);
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setApiError(null);
    handleSubmit();
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const { name } = e.currentTarget;
    const pasteText = e.clipboardData.getData('text');
    setFormData(prev => ({ ...prev, [name]: pasteText }));
    e.preventDefault(); // Prevent default paste behavior
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center p-2 bg-blue-600 text-white rounded-full mb-3">
          <Users size={24} />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">יצירת מטופל חדש</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          צור רשומת מטופל חדשה ואפשר הזמנת ההורים למילוי טופס מקוון
        </p>
      </div>

      {apiError && (
        <div className="bg-red-50 p-4 rounded-lg mb-6 max-w-2xl mx-auto">
          <div className="flex items-start">
            <AlertCircle className="text-red-500 ml-2 mt-1" size={20} />
            <div>
              <p className="text-red-700">{apiError}</p>
              {(apiError.includes('Failed to fetch') || 
                apiError.includes('NetworkError') || 
                apiError.includes('Network Error') || 
                apiError.includes('שגיאת תקשורת') || 
                apiError.includes('חיבור לאינטרנט')) && (
                <div className="mt-2">
                  <button
                    onClick={handleRetry}
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors mr-2"
                  >
                    נסה שוב
                  </button>
                  <div className="mt-3 text-sm text-red-600">
                    <p className="font-medium">עצות לפתרון בעיות חיבור:</p>
                    <ul className="list-disc pr-5 mt-1">
                      <li>בדוק את חיבור האינטרנט שלך</li>
                      <li>נסה להשתמש בדפדפן אחר</li>
                      <li>ודא שאין חסימות אש או הגבלות רשת</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6 mb-6 max-w-2xl mx-auto">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">פרטי מטופל בסיסיים</h2>
          <p className="text-sm text-gray-600 mb-4">
            הזן את הפרטים הבסיסיים של המטופל החדש. לאחר יצירת המטופל, תוכל לשלוח קישור להורה למילוי טופס מפורט.
          </p>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">
            מספר תעודת זהות של הילד/ה
            <span className="text-red-500 mr-1">*</span>
          </label>
          <input
            type="text"
            name="idNumber"
            value={formData.idNumber}
            onChange={handleChange}
            onPaste={handlePaste}
            placeholder="9 ספרות ללא מקף"
            maxLength={9}
            className={`w-full px-3 py-2 border ${errors.idNumber ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
          />
          {errors.idNumber && <p className="mt-1 text-sm text-red-600">{errors.idNumber}</p>}
          <p className="text-xs text-gray-500 mt-1">מספר תעודת זהות ישמש כמספר הייחודי של המטופל במערכת</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              שם פרטי
              <span className="text-red-500 mr-1">*</span>
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              onPaste={handlePaste}
              className={`w-full px-3 py-2 border ${errors.firstName ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            />
            {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              שם משפחה
              <span className="text-red-500 mr-1">*</span>
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              onPaste={handlePaste}
              className={`w-full px-3 py-2 border ${errors.lastName ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            />
            {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              תאריך לידה
              <span className="text-red-500 mr-1">*</span>
            </label>
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              onPaste={handlePaste}
              className={`w-full px-3 py-2 border ${errors.dob ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            />
            {errors.dob && <p className="mt-1 text-sm text-red-600">{errors.dob}</p>}
            {formData.dob && (
              <p className="text-sm text-gray-500 mt-1">
                תאריך לידה: {formatDateToDDMMYYYY(formData.dob)}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              מגדר
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="male">זכר</option>
              <option value="female">נקבה</option>
            </select>
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">
            כתובת מגורים
          </label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={2}
            placeholder="רחוב, מספר, עיר, מיקוד"
          ></textarea>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">פרטי הורה/אפוטרופוס</h2>
          
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              שם מלא
              <span className="text-red-500 mr-1">*</span>
            </label>
            <input
              type="text"
              name="parentName"
              value={formData.parentName}
              onChange={handleChange}
              onPaste={handlePaste}
              className={`w-full px-3 py-2 border ${errors.parentName ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            />
            {errors.parentName && <p className="mt-1 text-sm text-red-600">{errors.parentName}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">
                טלפון
                <span className="text-red-500 mr-1">*</span>
              </label>
              <input
                type="tel"
                name="parentPhone"
                value={formData.parentPhone}
                onChange={handleChange}
                onPaste={handlePaste}
                className={`w-full px-3 py-2 border ${errors.parentPhone ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
              {errors.parentPhone && <p className="mt-1 text-sm text-red-600">{errors.parentPhone}</p>}
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">
                דוא״ל
              </label>
              <input
                type="email"
                name="parentEmail"
                value={formData.parentEmail}
                onChange={handleChange}
                onPaste={handlePaste}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="אופציונלי"
              />
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row justify-between">
          <button
            onClick={onBack}
            className="mb-3 sm:mb-0 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors flex items-center justify-center"
          >
            <ArrowLeft size={16} className="ml-2" />
            חזרה לדף הבית
          </button>
          
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader size={18} className="animate-spin ml-2" />
                יוצר מטופל חדש...
              </>
            ) : (
              <>
                <Share2 size={18} className="ml-2" />
                צור מטופל ושלח טופס להורים
              </>
            )}
          </button>
        </div>
      </div>

      {showShareModal && newClient && (
        <ShareLinkModal
          client={newClient}
          onClose={handleShareComplete}
          isNewClient={true}
        />
      )}
    </div>
  );
};

export default NewClientForm;