import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FormProvider } from '../context/FormContext';
import { getClientByIdNumber, getParentIntake } from '../lib/supabase';
import IntakeForm from './IntakeForm';
import { ClipboardList, AlertCircle, Loader, CheckCircle } from 'lucide-react';

const SharedParentForm: React.FC = () => {
  const { idNumber } = useParams<{ idNumber: string }>();
  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isAlreadyCompleted, setIsAlreadyCompleted] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [loadingClient, setLoadingClient] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (idNumber) {
      loadClientData(idNumber);
    } else {
      setError('מספר זיהוי חסר בקישור. אנא בדוק שהקישור תקין.');
      setLoading(false);
      setLoadingClient(false);
    }
  }, [idNumber, retryCount]);

  const loadClientData = async (id: string) => {
    try {
      setLoading(true);
      setLoadingClient(true);
      setError(null);

      console.log('Attempting to load client data for ID number:', id);

      // Get client data by ID number
      const clientData = await getClientByIdNumber(id);
      
      if (!clientData) {
        console.error('No client found for ID number:', id);
        setError('לא נמצא לקוח עם מספר תעודת זהות זה. אנא בדוק את הקישור ונסה שוב.');
        setLoading(false);
        setLoadingClient(false);
        return;
      }
      
      console.log('Client data loaded successfully:', clientData);
      setClient(clientData);
      setLoadingClient(false);
      
      // Check if the parent intake form was already submitted for this client
      const parentIntake = await getParentIntake(clientData.id);
      
      // A form is considered complete if it has been submitted (has a submitted_at timestamp)
      if (parentIntake && parentIntake.submitted_at) {
        console.log('Form already completed for this client');
        setIsAlreadyCompleted(true);
      }
      
      setLoading(false);
    } catch (err: any) {
      console.error('Error loading client data:', err);
      const errorMessage = err.message || 'אירעה שגיאה בטעינת נתוני הלקוח. אנא נסה שוב מאוחר יותר.';
      setError(errorMessage);
      setLoading(false);
      setLoadingClient(false);
    }
  };

  const handleFormComplete = async () => {
    setFormSubmitted(true);
    setIsAlreadyCompleted(true);
  };
  
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  if (loading && loadingClient) {
    return (
      <div className="min-h-screen bg-slate-50 rtl flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin w-12 h-12 mx-auto mb-4 text-teal-600" />
          <p className="text-gray-600">טוען טופס...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 rtl flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold mb-4 text-gray-800">שגיאה בטעינת הטופס</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={handleRetry}
            className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
          >
            נסה שנית
          </button>
        </div>
      </div>
    );
  }

  if (formSubmitted || isAlreadyCompleted) {
    return (
      <div className="min-h-screen bg-slate-50 rtl flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
          <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
          <h2 className="text-2xl font-bold mb-4 text-gray-800">הטופס נשלח בהצלחה!</h2>
          <p className="text-gray-600 mb-6">
            תודה שמילאת את הטופס. המידע נשמר במערכת ויסייע בתהליך האבחון.
          </p>
          <p className="text-sm text-gray-500">
            הקישור הזה אינו פעיל יותר, מכיוון שהטופס כבר הושלם.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 rtl">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-2 bg-teal-600 text-white rounded-full mb-3">
            <ClipboardList size={24} />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">שאלון הורים</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            טופס זה יסייע לנו להבין טוב יותר את ההיסטוריה ההתפתחותית והצרכים של ילדכם. 
            אנא מלאו את כל השדות במדויק ככל האפשר.
          </p>
          {client && (
            <div className="mt-2 inline-block bg-blue-50 px-3 py-1 rounded text-blue-700">
              ממלא טופס עבור: {client.child_first_name} {client.child_last_name}
            </div>
          )}
        </div>

        <FormProvider>
          <IntakeForm 
            clientId={client?.id} 
            onComplete={handleFormComplete} 
            isSharedForm={true}
          />
        </FormProvider>
      </div>
    </div>
  );
};

export default React.memo(SharedParentForm);