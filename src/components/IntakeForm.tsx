import React, { useState, useEffect } from 'react';
import { useFormContext } from '../context/FormContext';
import FormStepper from './FormStepper';
import FormProgress from './FormProgress';
import ChildInfo from './form-sections/ChildInfo';
import ReferralInfo from './form-sections/ReferralInfo';
import PregnancyBirth from './form-sections/PregnancyBirth';
import DevelopmentalMilestones from './form-sections/DevelopmentalMilestones';
import MedicalHistory from './form-sections/MedicalHistory';
import FamilyHistory from './form-sections/FamilyHistory';
import Education from './form-sections/Education';
import CurrentFunctioning from './form-sections/CurrentFunctioning';
import PreviousServices from './form-sections/PreviousServices';
import AdditionalInfo from './form-sections/AdditionalInfo';
import FormSummary from './form-sections/FormSummary';
import FormSubmitted from './form-sections/FormSubmitted';
import { ClipboardList, AlertCircle, Loader } from 'lucide-react';
import { createClientRecord, saveParentIntake, getClientById, checkAuthStatus, getClientByIdNumber, getParentIntake } from '../lib/supabase';
import SaveButton from './ui/SaveButton';
import AutoSaveIndicator from './ui/AutoSaveIndicator';

interface IntakeFormProps {
  onComplete?: () => void;
  clientId?: string | null;
  isSharedForm?: boolean;
}

const IntakeForm: React.FC<IntakeFormProps> = ({ onComplete, clientId, isSharedForm = false }) => {
  const { 
    formData, 
    updateFormData, 
    currentStep, 
    totalSteps, 
    validateStep, 
    resetForm, 
    saveCurrentProgress,
    isSaving,
    lastSaved,
    saveError
  } = useFormContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientInfo, setClientInfo] = useState<any>(null);
  const [needsAuthentication, setNeedsAuthentication] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [loadedClientData, setLoadedClientData] = useState(false); // Track if client data has been loaded

  useEffect(() => {
    if (clientId && !loadedClientData) {
      loadClientData(clientId);
    }
  }, [clientId, loadedClientData]);

  // Set up auto-save warning when user tries to navigate away
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        const message = 'יש שינויים שטרם נשמרו. האם אתה בטוח שברצונך לעזוב?';
        e.returnValue = message;
        return message;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  const loadClientData = async (id: string) => {
    try {
      setLoading(true);
      const clientData = await getClientById(id);
      setClientInfo(clientData);
      
      // Populate form with client data
      updateFormData('child', {
        firstName: clientData.child_first_name,
        lastName: clientData.child_last_name,
        dob: clientData.child_dob,
        parentName: clientData.parent_name,
        parentPhone: clientData.parent_phone || '',
        parentEmail: clientData.parent_email || '',
        idNumber: clientData.id_number || '',
        address: clientData.address || '',  // Add address field
        gender: '' // Initialize gender - it will be populated from parent intake if available
      });
      
      // Try to load existing parent intake data if available
      try {
        const parentIntakeData = await getParentIntake(id);
        if (parentIntakeData && parentIntakeData.form_data) {
          // Reset the form first to clear any existing data
          resetForm();
          
          // Load all sections from the parent intake data
          Object.keys(parentIntakeData.form_data).forEach(section => {
            if (section in formData) {
              updateFormData(section as keyof typeof formData, parentIntakeData.form_data[section]);
            }
          });
        }
      } catch (intakeErr) {
        console.error("Could not load parent intake data:", intakeErr);
        // Continue even if no parent intake data is found
      }
      
      setLoadedClientData(true);
      setLoading(false);
    } catch (err) {
      console.error("Error loading client data:", err);
      setError("לא ניתן לטעון את נתוני המטופל. נסה שוב מאוחר יותר.");
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    try {
      setLoading(true);
      // Try to automatically authenticate the user
      const { isAuthenticated, success, error } = await checkAuthStatus(true); 
      
      if (isAuthenticated) {
        setNeedsAuthentication(false);
        setError(null);
        // Automatically retry submission after successful authentication
        handleSubmit();
      } else {
        setError("לא ניתן להתחבר. אנא נסה שוב. " + (error ? error : ""));
      }
      setLoading(false);
    } catch (err) {
      console.error("Error during authentication:", err);
      setError("אירעה שגיאה בתהליך ההתחברות. נסה שוב מאוחר יותר.");
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      // First validate the form
      if (!validateStep(currentStep)) {
        setError("יש למלא את כל שדות החובה לפני הגשת הטופס.");
        return;
      }
      
      setLoading(true);
      setIsSubmitting(true);
      setError(null);
      
      // Verify that the child data is complete
      const childData = formData.child;
      if (!childData.firstName || !childData.lastName || !childData.dob || !childData.parentName || !childData.parentPhone || !childData.idNumber) {
        setError("יש למלא את כל שדות החובה בטופס פרטים אישיים.");
        setLoading(false);
        setIsSubmitting(false);
        return;
      }
      
      // Verify ID number is 9 digits
      if (!/^\d{9}$/.test(childData.idNumber)) {
        setError("מספר תעודת זהות חייב להכיל 9 ספרות בדיוק.");
        setLoading(false);
        setIsSubmitting(false);
        return;
      }
      
      // First, try to auto-authenticate if needed
      let clientRecordId = clientId;
      
      try {
        // Check if client with this ID number already exists
        if (!clientId) {
          try {
            const existingClient = await getClientByIdNumber(childData.idNumber);
            if (existingClient) {
              clientRecordId = existingClient.id;
            }
          } catch (err) {
            // Client doesn't exist, will create a new one
          }
        }
        
        // If no client ID exists, create a new client record
        if (!clientRecordId) {
          const newClient = await createClientRecord(childData);
          clientRecordId = newClient.id;
        }
        
        // Save the parent intake data with the current timestamp as submitted_at
        // This ensures we can track when the form was actually submitted
        await saveParentIntake(clientRecordId as string, formData, true);
        
        // Mark form as submitted
        setFormSubmitted(true);
        setHasUnsavedChanges(false); // Clear unsaved changes flag
        
        // After short delay, redirect to client list
        setTimeout(() => {
          if (onComplete) onComplete();
        }, 3000);
        
      } catch (err) {
        if (err.message && (
            err.message.includes("Authentication required") || 
            err.message.includes("Permission denied") ||
            err.message.includes("violates row-level security policy")
        )) {
          setNeedsAuthentication(true);
          setError("נדרשת התחברות לחשבון כדי לשמור את הטופס. אנא התחבר/י להמשך.");
        } else {
          setError("אירעה שגיאה בשמירת הטופס: " + err.message);
        }
        setIsSubmitting(false);
      }
      
      setLoading(false);
    } catch (err) {
      console.error("Error submitting form:", err);
      setError("אירעה שגיאה בשמירת הטופס. נסה שוב מאוחר יותר.");
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  const handleSaveProgress = async () => {
    if (!clientId) {
      setError("אין מזהה לקוח לשמירת הטופס. אנא נסה מאוחר יותר.");
      return;
    }
    
    const saved = await saveCurrentProgress(clientId);
    if (saved) {
      setHasUnsavedChanges(false);
    }
  };

  const renderFormSection = () => {
    // If the form has been submitted, show the thank you page
    if (formSubmitted) {
      return <FormSubmitted />;
    }
    
    // Otherwise show the appropriate form section
    switch (currentStep) {
      case 0:
        return <ChildInfo readOnly={isSharedForm && !!clientInfo} />;
      case 1:
        return <ReferralInfo />;
      case 2:
        return <PregnancyBirth />;
      case 3:
        return <DevelopmentalMilestones />;
      case 4:
        return <MedicalHistory />;
      case 5:
        return <FamilyHistory />;
      case 6:
        return <Education />;
      case 7:
        return <CurrentFunctioning />;
      case 8:
        return <PreviousServices />;
      case 9:
        return <AdditionalInfo />;
      case 10:
        return <FormSummary onSubmit={handleSubmit} />;
      default:
        return <ChildInfo readOnly={isSharedForm && !!clientInfo} />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {!isSharedForm && (
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-2 bg-teal-600 text-white rounded-full mb-3">
            <ClipboardList size={24} />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">שאלון הורים</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            טופס זה יסייע לנו להבין טוב יותר את ההיסטוריה ההתפתחותית והצרכים של ילדכם. 
            אנא מלאו את כל השדות במדויק ככל האפשר.
          </p>
          {clientInfo && (
            <div className="mt-2 inline-block bg-blue-50 px-3 py-1 rounded text-blue-700">
              ממלא טופס עבור: {clientInfo.child_first_name} {clientInfo.child_last_name} 
              (ת.ז: {clientInfo.id_number || 'לא צוין'})
            </div>
          )}
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-md">
            <div className="animate-spin h-8 w-8 border-4 border-teal-500 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-gray-700">
              {isSubmitting ? 'שולח טופס...' : 'מעבד נתונים...'}
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg max-w-3xl mx-auto mb-6">
          <div className="flex items-center gap-2">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
          {needsAuthentication && (
            <button 
              onClick={handleSignIn}
              className="mt-3 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors"
            >
              התחבר/י עכשיו
            </button>
          )}
        </div>
      )}

      {!formSubmitted && (
        <div className="max-w-3xl mx-auto">
          <div className="mb-2 flex justify-between items-center">
            <FormProgress currentStep={currentStep} totalSteps={totalSteps} />
            {clientId && <AutoSaveIndicator isSaving={isSaving} lastSaved={lastSaved} saveError={saveError} />}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6 mb-6 max-w-3xl mx-auto transition-all duration-300 ease-in-out">
        {renderFormSection()}
      </div>

      {currentStep < totalSteps && !formSubmitted && (
        <FormStepper />
      )}

      {/* Save button */}
      {clientId && !formSubmitted && (
        <SaveButton 
          onSave={handleSaveProgress}
          isSaving={isSaving}
          lastSaved={lastSaved}
          saveError={saveError}
        />
      )}
    </div>
  );
};

export default IntakeForm;