import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { saveEvaluatorAssessment } from '../lib/supabase';

// Define the data structure for tests administered
interface Test {
  name: string;
  version: string;
  date: string;
  domain: string;
}

// Define cognitive index score structure
interface CognitiveIndex {
  index: string;
  score: number;
  percentile: number;
}

// Define the shape of the evaluator data
export interface EvaluatorData {
  // Administrative details
  evaluator: {
    name: string;
    licenseNo: string;
    examDate: string;
    location: string;
    referralReason: string;
  };
  
  // Clinical observation
  clinicalObservation: {
    generalAppearance: string;
    behavior: string[];
    behaviorOther: string;
    affect: string;
    affectNotes: string;
    language: string;
    eyeContact: number;
  };
  
  // Tests administered
  testsAdministered: Test[];
  
  // Cognitive results
  cognitiveResults: {
    fsiq: number;
    indices: CognitiveIndex[];
  };
  
  // Academic skills
  academicResults: {
    reading: {
      accuracy: number;
      fluency: number;
      comprehension: number;
    };
    writing: {
      spelling: number;
      expression: number;
    };
    math: {
      calculation: number;
      problemSolving: number;
    };
  };
  
  // Executive functions
  executiveFunction: {
    attention: number;
    workingMemory: number;
    inhibition: number;
    planning: number;
    flexibility: number;
    notes: string;
  };
  
  // Emotional-behavioral
  emotionalBehavioral: {
    anxiety: number;
    depression: number;
    aggression: number;
    withdrawal: number;
    summary: string;
  };
  
  // Adaptive functioning
  adaptive: {
    communication: number;
    dailyLiving: number;
    socialization: number;
    motorSkills: number;
    summary: string;
  };
  
  // Conclusions and diagnosis
  diagnosis: string[];
  diagnosisNotes: string;
  
  // Recommendations
  recommendations: {
    school: string;
    parents: string;
  };
  
  // Validity assessment
  validityNotes: string;
  validityFactors: string[];
  
  // Digital signature
  signature: string;
}

// Interface for form errors
interface FormErrors {
  [key: string]: {
    [key: string]: string;
  };
}

// Initial empty state
const initialEvaluatorData: EvaluatorData = {
  evaluator: {
    name: '',
    licenseNo: '',
    examDate: '',
    location: '',
    referralReason: ''
  },
  clinicalObservation: {
    generalAppearance: '',
    behavior: [],
    behaviorOther: '',
    affect: 'נורמוטימי', // Default value
    affectNotes: '',
    language: '',
    eyeContact: 3 // Default middle value on 1-5 scale
  },
  testsAdministered: [],
  cognitiveResults: {
    fsiq: 0,
    indices: []
  },
  academicResults: {
    reading: {
      accuracy: 0,
      fluency: 0,
      comprehension: 0
    },
    writing: {
      spelling: 0,
      expression: 0
    },
    math: {
      calculation: 0,
      problemSolving: 0
    }
  },
  executiveFunction: {
    attention: 0,
    workingMemory: 0,
    inhibition: 0,
    planning: 0,
    flexibility: 0,
    notes: ''
  },
  emotionalBehavioral: {
    anxiety: 0,
    depression: 0,
    aggression: 0,
    withdrawal: 0,
    summary: ''
  },
  adaptive: {
    communication: 0,
    dailyLiving: 0,
    socialization: 0,
    motorSkills: 0,
    summary: ''
  },
  diagnosis: [],
  diagnosisNotes: '',
  recommendations: {
    school: '',
    parents: ''
  },
  validityNotes: '',
  validityFactors: [],
  signature: ''
};

// Create context with initial empty state
interface EvaluatorContextType {
  evaluatorData: EvaluatorData;
  updateEvaluatorData: <K extends keyof EvaluatorData>(
    section: K,
    data: Partial<EvaluatorData[K]> | EvaluatorData[K]
  ) => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  totalSteps: number;
  isSubmitted: boolean;
  submitForm: () => void;
  formErrors: FormErrors;
  validateField: (section: string, field: string, value: any, customValidator?: (value: any) => string | null) => boolean;
  validateStep: (step: number) => boolean;
  saveCurrentProgress: (clientId: string) => Promise<boolean>;
  isSaving: boolean;
  lastSaved: Date | null;
  saveError: string | null;
}

export const EvaluatorContext = createContext<EvaluatorContextType | undefined>(undefined);

// Provider component
export const EvaluatorProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [evaluatorData, setEvaluatorData] = useState<EvaluatorData>(initialEvaluatorData);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [currentClientId, setCurrentClientId] = useState<string | null>(null);

  const totalSteps = 10;

  const updateEvaluatorData = <K extends keyof EvaluatorData>(
    section: K,
    data: Partial<EvaluatorData[K]> | EvaluatorData[K]
  ) => {
    setEvaluatorData(prev => {
      // Handle specific scalar values directly
      if (section === 'diagnosisNotes') {
        return {
          ...prev,
          diagnosisNotes: data as string
        };
      }
      
      if (section === 'validityNotes') {
        return {
          ...prev,
          validityNotes: data as string
        };
      }
      
      // Special handling for array fields
      if (section === 'diagnosis') {
        return {
          ...prev,
          diagnosis: data as string[]
        };
      }
      
      if (section === 'validityFactors') {
        return {
          ...prev,
          validityFactors: data as string[]
        };
      }
      
      if (section === 'testsAdministered') {
        return {
          ...prev,
          testsAdministered: data as Test[]
        };
      }
      
      // For regular objects, merge them
      return {
        ...prev,
        [section]: {
          ...prev[section],
          ...data
        }
      };
    });

    // Reset auto-save timer when data changes
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
    }

    // Set new auto-save timer (save after 3 seconds of inactivity)
    if (currentClientId) {
      const timer = setTimeout(() => {
        saveCurrentProgress(currentClientId);
      }, 3000);
      setAutoSaveTimer(timer);
    }
  };

  // Validate a single field
  const validateField = (section: string, field: string, value: any, customValidator?: (value: any) => string | null): boolean => {
    let error = null;

    // Use custom validator if provided
    if (customValidator) {
      error = customValidator(value);
    } else {
      // Default validation - required fields
      if (value === '' || value === null || value === undefined) {
        error = 'שדה זה הינו שדה חובה';
      }
    }

    // Update errors state
    setFormErrors(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: error
      }
    }));

    return error === null;
  };

  // Validate all required fields in a given step
  const validateStep = (step: number): boolean => {
    let isValid = true;
    const tempErrors: FormErrors = { ...formErrors };

    // Define which fields to validate for each step
    switch (step) {
      case 0: // Administrative Details
        const adminFields = ['name', 'licenseNo', 'examDate', 'referralReason'];
        adminFields.forEach(field => {
          const value = (evaluatorData.evaluator as any)[field];
          if (!value) {
            tempErrors.evaluator = { ...tempErrors.evaluator, [field]: 'שדה זה הינו שדה חובה' };
            isValid = false;
          }
        });
        break;

      case 9: // Recommendations
        if (!evaluatorData.recommendations.school) {
          tempErrors.recommendations = { ...tempErrors.recommendations, school: 'שדה זה הינו שדה חובה' };
          isValid = false;
        }
        if (!evaluatorData.recommendations.parents) {
          tempErrors.recommendations = { ...tempErrors.recommendations, parents: 'שדה זה הינו שדה חובה' };
          isValid = false;
        }
        break;

      // No specific validation for the ValidityAssessment step (9)
      // This allows navigation to continue to the next step
      
      // Add validation for other steps as needed
    }

    setFormErrors(tempErrors);
    return isValid;
  };

  const submitForm = () => {
    // Mark as submitted
    setIsSubmitted(true);
    
    // In a real app, you would save to the database here
    console.log('Form submitted with data:', evaluatorData);
  };

  // Function to save current progress
  const saveCurrentProgress = useCallback(async (clientId: string) => {
    if (!clientId) return false;
    
    setCurrentClientId(clientId);
    setIsSaving(true);
    setSaveError(null);
    
    try {
      // Ensure arrays are properly formatted
      const sanitizedData = { ...evaluatorData };
      
      // Make sure diagnosis is an array
      if (!Array.isArray(sanitizedData.diagnosis)) {
        sanitizedData.diagnosis = [];
      }
      
      // Make sure validityFactors is an array
      if (!Array.isArray(sanitizedData.validityFactors)) {
        sanitizedData.validityFactors = [];
      }
      
      // Make sure testsAdministered is an array
      if (!Array.isArray(sanitizedData.testsAdministered)) {
        sanitizedData.testsAdministered = [];
      }
      
      await saveEvaluatorAssessment(clientId, sanitizedData);
      setLastSaved(new Date());
      setIsSaving(false);
      return true;
    } catch (error) {
      console.error('Error saving evaluator assessment:', error);
      setSaveError('שגיאה בשמירת הטופס. אנא נסה שוב.');
      setIsSaving(false);
      return false;
    }
  }, [evaluatorData]);

  // Clean up auto-save timer on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
    };
  }, [autoSaveTimer]);

  return (
    <EvaluatorContext.Provider value={{
      evaluatorData,
      updateEvaluatorData,
      currentStep,
      setCurrentStep,
      totalSteps,
      isSubmitted,
      submitForm,
      formErrors,
      validateField,
      validateStep,
      saveCurrentProgress,
      isSaving,
      lastSaved,
      saveError
    }}>
      {children}
    </EvaluatorContext.Provider>
  );
};

// Custom hook to use the context
export const useEvaluator = () => {
  const context = useContext(EvaluatorContext);
  if (context === undefined) {
    throw new Error('useEvaluator must be used within an EvaluatorProvider');
  }
  return context;
};