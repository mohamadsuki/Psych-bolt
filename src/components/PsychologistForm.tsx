import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useEvaluator } from '../context/EvaluatorContext';
import { FileText, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import AdministrativeDetails from './evaluator-sections/AdministrativeDetails';
import ClinicalObservation from './evaluator-sections/ClinicalObservation';
import TestsAdministered from './evaluator-sections/TestsAdministered';
import CognitiveResults from './evaluator-sections/CognitiveResults';
import AcademicResults from './evaluator-sections/AcademicResults';
import ExecutiveFunction from './evaluator-sections/ExecutiveFunction';
import EmotionalBehavioral from './evaluator-sections/EmotionalBehavioral';
import AdaptiveFunctioning from './evaluator-sections/AdaptiveFunctioning';
import Diagnosis from './evaluator-sections/Diagnosis';
import ValidityAssessment from './evaluator-sections/ValidityAssessment';
import EvaluatorSummary from './evaluator-sections/EvaluatorSummary';
import EvaluationComplete from './evaluator-sections/EvaluationComplete';
import { getClientById, getEvaluatorAssessment, saveEvaluatorAssessment } from '../lib/supabase';
import SaveButton from './ui/SaveButton';
import AutoSaveIndicator from './ui/AutoSaveIndicator';

interface PsychologistFormProps {
  onComplete?: () => void;
}

const PsychologistForm: React.FC<PsychologistFormProps> = ({ onComplete }) => {
  const { 
    evaluatorData, 
    updateEvaluatorData,
    currentStep, 
    setCurrentStep, 
    totalSteps,
    isSubmitted,
    submitForm,
    validateStep,
    saveCurrentProgress,
    isSaving,
    lastSaved,
    saveError
  } = useEvaluator();
  
  const [clientId, setClientId] = useState<string | null>(null);
  const [clientInfo, setClientInfo] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [loadedClientData, setLoadedClientData] = useState(false);

  useEffect(() => {
    // Extract client ID from URL if present
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('clientId');
    
    if (id && !loadedClientData) {
      setClientId(id);
      loadClientInfo(id);
      loadEvaluatorAssessment(id);
      setLoadedClientData(true);
    }
  }, [loadedClientData]);

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

  const loadClientInfo = async (id: string) => {
    try {
      const client = await getClientById(id);
      setClientInfo(client);
    } catch (err) {
      console.error('Error loading client info:', err);
      setError('לא ניתן לטעון את נתוני המטופל. נסה שוב מאוחר יותר.');
    }
  };

  const loadEvaluatorAssessment = async (id: string) => {
    try {
      setLoading(true);
      const assessmentData = await getEvaluatorAssessment(id);
      
      if (assessmentData?.evaluator_data) {
        // Populate evaluator data from existing assessment
        Object.keys(assessmentData.evaluator_data).forEach((key) => {
          if (key in evaluatorData) {
            updateEvaluatorData(key as any, assessmentData.evaluator_data[key]);
          }
        });
      }
      setLoading(false);
    } catch (err) {
      console.error('Error loading evaluator assessment:', err);
      setLoading(false);
    }
  };

  const handleNext = () => {
    // For the ValidityAssessment step (9), skip validation and just proceed to the next step
    if (currentStep === 9) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
      return;
    }
    
    // For other steps, validate before proceeding
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
        window.scrollTo(0, 0);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleSubmitEvaluation = async () => {
    if (!clientId) {
      setError('לא נבחר מטופל. אנא חזור לרשימת המטופלים ובחר מטופל.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Save evaluator assessment to database with isSubmitted=true
      await saveEvaluatorAssessment(clientId, evaluatorData, true);
      
      // Mark form as submitted and clear unsaved changes flag
      submitForm();
      setHasUnsavedChanges(false);
      
    } catch (err) {
      console.error('Error submitting evaluation:', err);
      setError('אירעה שגיאה בשמירת הערכת המאבחן. נסה שוב מאוחר יותר.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = () => {
    // Navigate to the reports section passing the client ID
    if (onComplete) {
      onComplete();
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

  // Memoize the rendered section to prevent unnecessary re-renders
  const renderedSection = useMemo(() => {
    if (isSubmitted) {
      return <EvaluationComplete onViewReport={handleGenerateReport} clientId={clientId || undefined} />;
    }
    
    switch (currentStep) {
      case 0:
        return <AdministrativeDetails />;
      case 1:
        return <ClinicalObservation />;
      case 2:
        return <TestsAdministered />;
      case 3:
        return <CognitiveResults />;
      case 4:
        return <AcademicResults />;
      case 5:
        return <ExecutiveFunction />;
      case 6:
        return <EmotionalBehavioral />;
      case 7:
        return <AdaptiveFunctioning />;
      case 8:
        return <Diagnosis />;
      case 9:
        return <ValidityAssessment />;
      case 10:
        return <EvaluatorSummary onSubmit={handleSubmitEvaluation} />;
      default:
        return <AdministrativeDetails />;
    }
  }, [currentStep, isSubmitted, clientId, handleSubmitEvaluation, handleGenerateReport]);

  // Calculate progress percentage
  const progressPercentage = Math.round(((currentStep) / (totalSteps + 1)) * 100);

  const getSectionName = () => {
    switch (currentStep) {
      case 0: return 'פרטים מנהליים';
      case 1: return 'תצפית קלינית';
      case 2: return 'מבחנים שהועברו';
      case 3: return 'תוצאות קוגניטיביות';
      case 4: return 'מיומנויות אקדמיות';
      case 5: return 'תפקודים ניהוליים';
      case 6: return 'תפקוד ריגשי-התנהגותי';
      case 7: return 'תפקוד אדפטיבי';
      case 8: return 'אבחנה';
      case 9: return 'הערכת תוקף';
      case 10: return 'סיכום';
      default: return '';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center p-2 bg-teal-600 text-white rounded-full mb-3">
          <FileText size={24} />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">שאלון מאבחן</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          טופס זה מיועד למילוי על-ידי הפסיכולוג/ית המאבחן/ת לאחר הערכת הילד/ה.
          המידע ישמש ליצירת דו"ח אבחון מקיף.
        </p>
        {clientInfo && (
          <div className="mt-2 inline-block bg-blue-50 px-3 py-1 rounded text-blue-700">
            מבצע הערכה עבור: {clientInfo.child_first_name} {clientInfo.child_last_name}
          </div>
        )}
      </div>

      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-md">
            <div className="animate-spin h-8 w-8 border-4 border-teal-500 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-gray-700">מעבד נתונים...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg max-w-3xl mx-auto mb-6">
          <div className="flex items-center gap-2">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        </div>
      )}

      {!isSubmitted && (
        <div className="max-w-3xl mx-auto">
          <div className="mb-2 flex justify-between items-center">
            <span className="text-sm font-medium text-teal-700">
              {getSectionName()}
            </span>
            <div className="flex items-center">
              <span className="text-sm font-medium text-teal-700 ml-4">
                {currentStep + 1} מתוך {totalSteps + 1}
              </span>
              {clientId && <AutoSaveIndicator isSaving={isSaving} lastSaved={lastSaved} saveError={saveError} />}
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-teal-600 h-2.5 rounded-full transition-all duration-300 ease-in-out" 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6 mb-6 max-w-3xl mx-auto transition-all duration-300 ease-in-out">
        {renderedSection}
      </div>

      {!isSubmitted && currentStep <= totalSteps && (
        <div className="flex justify-between max-w-3xl mx-auto">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className={`flex items-center px-4 py-2 rounded-md transition-colors ${
              currentStep === 0
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-white text-teal-600 hover:bg-teal-50 border border-teal-600'
            }`}
          >
            <ChevronRight className="ml-2" size={16} />
            חזרה
          </button>
          {currentStep < totalSteps && (
            <button
              onClick={handleNext}
              className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
            >
              {currentStep === totalSteps - 1 ? 'סיכום' : 'המשך'}
              <ChevronLeft className="mr-2" size={16} />
            </button>
          )}
        </div>
      )}

      {/* Save button */}
      {clientId && !isSubmitted && (
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

export default React.memo(PsychologistForm);