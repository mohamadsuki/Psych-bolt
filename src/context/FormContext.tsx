import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { saveParentIntake } from '../lib/supabase';

export interface FormData {
  child: {
    firstName: string;
    lastName: string;
    dob: string;
    gender: string;
    address: string;
    parentName: string;
    parentPhone: string;
    parentEmail: string;
    idNumber: string;  // Added ID number field
  };
  referral: {
    chiefConcern: string;
    onsetMonths: number;
    referralSource: string;
    previousEvaluations: boolean;
    previousEvaluationsDetails: string;
  };
  pregnancy: {
    complications: boolean;
    detailsPregnancy: string;
    birthWeight: string;
    birthComplications: boolean;
    birthComplicationsDetails: string;
    nicu: boolean;
    nicuDetails: string;
  };
  developmentalMilestones: {
    sitting: number;
    crawling: number;
    walking: number;
    firstWord: number;
    twoWordSentences: number;
    toiletTraining: number;
    concernsMotor: boolean;
    concernsMotorDetails: string;
    concernsSpeech: boolean;
    concernsSpeechDetails: string;
  };
  medicalHistory: {
    chronicConditions: boolean;
    chronicConditionsDetails: string;
    medications: boolean;
    medicationsDetails: string;
    hospitalizations: boolean;
    hospitalizationsDetails: string;
    allergies: boolean;
    allergiesDetails: string;
    hearing: boolean;
    hearingDetails: string;
    vision: boolean;
    visionDetails: string;
  };
  familyHistory: {
    learningDisabilities: boolean;
    learningDisabilitiesDetails: string;
    adhd: boolean;
    adhdDetails: string;
    autism: boolean;
    autismDetails: string;
    mentalHealth: boolean;
    mentalHealthDetails: string;
    siblings: boolean;
    siblingsDetails: string;
    siblingsList: Array<{
      id: string;
      name: string;
      age: string;
      notes: string;
    }>;
  };
  education: {
    currentSetting: string;
    schoolName: string;
    grade: string;
    teacherName: string;
    academicPerformance: string;
    specialServices: boolean;
    specialServicesDetails: string;
    behavioralConcerns: boolean;
    behavioralConcernsDetails: string;
  };
  currentFunctioning: {
    strengths: string;
    challenges: string;
    socialSkills: string;
    independence: string;
    screenTime: string;
  };
  previousServices: {
    speech: boolean;
    speechDetails: string;
    occupational: boolean;
    occupationalDetails: string;
    physical: boolean;
    physicalDetails: string;
    behavioral: boolean;
    behavioralDetails: string;
    psychological: boolean;
    psychologicalDetails: string;
  };
  additionalInfo: {
    questions: string;
    concerns: string;
    goals: string;
  };
}

interface FormErrors {
  [key: string]: {
    [key: string]: string;
  };
}

interface FormContextType {
  formData: FormData;
  updateFormData: (section: keyof FormData, data: Partial<FormData[keyof FormData]>) => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  totalSteps: number;
  formErrors: FormErrors;
  validateField: (section: string, field: string, value: any, customValidator?: (value: any) => string | null) => boolean;
  validateStep: (step: number) => boolean;
  resetForm: () => void;
  saveCurrentProgress: (clientId: string) => Promise<boolean>;
  isSaving: boolean;
  lastSaved: Date | null;
  saveError: string | null;
}

const defaultFormData: FormData = {
  child: {
    firstName: '',
    lastName: '',
    dob: '',
    gender: '',
    address: '',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    idNumber: '',  // Added ID number field
  },
  referral: {
    chiefConcern: '',
    onsetMonths: 0,
    referralSource: '',
    previousEvaluations: false,
    previousEvaluationsDetails: '',
  },
  pregnancy: {
    complications: false,
    detailsPregnancy: '',
    birthWeight: '',
    birthComplications: false,
    birthComplicationsDetails: '',
    nicu: false,
    nicuDetails: '',
  },
  developmentalMilestones: {
    sitting: 0,
    crawling: 0,
    walking: 0,
    firstWord: 0,
    twoWordSentences: 0,
    toiletTraining: 0,
    concernsMotor: false,
    concernsMotorDetails: '',
    concernsSpeech: false,
    concernsSpeechDetails: '',
  },
  medicalHistory: {
    chronicConditions: false,
    chronicConditionsDetails: '',
    medications: false,
    medicationsDetails: '',
    hospitalizations: false,
    hospitalizationsDetails: '',
    allergies: false,
    allergiesDetails: '',
    hearing: false,
    hearingDetails: '',
    vision: false,
    visionDetails: '',
  },
  familyHistory: {
    learningDisabilities: false,
    learningDisabilitiesDetails: '',
    adhd: false,
    adhdDetails: '',
    autism: false,
    autismDetails: '',
    mentalHealth: false,
    mentalHealthDetails: '',
    siblings: false,
    siblingsDetails: '',
    siblingsList: [],
  },
  education: {
    currentSetting: '',
    schoolName: '',
    grade: '',
    teacherName: '',
    academicPerformance: '',
    specialServices: false,
    specialServicesDetails: '',
    behavioralConcerns: false,
    behavioralConcernsDetails: '',
  },
  currentFunctioning: {
    strengths: '',
    challenges: '',
    socialSkills: '',
    independence: '',
    screenTime: '',
  },
  previousServices: {
    speech: false,
    speechDetails: '',
    occupational: false,
    occupationalDetails: '',
    physical: false,
    physicalDetails: '',
    behavioral: false,
    behavioralDetails: '',
    psychological: false,
    psychologicalDetails: '',
  },
  additionalInfo: {
    questions: '',
    concerns: '',
    goals: '',
  },
};

const FormContext = createContext<FormContextType | undefined>(undefined);

export const FormProvider = ({ children }: { children: ReactNode }) => {
  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = 10; // 0-based index, so 10 means 11 steps
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [currentClientId, setCurrentClientId] = useState<string | null>(null);

  const resetForm = () => {
    setFormData(defaultFormData);
    setCurrentStep(0);
    setFormErrors({});
  };

  const updateFormData = (section: keyof FormData, data: Partial<FormData[keyof FormData]>) => {
    setFormData(prevData => ({
      ...prevData,
      [section]: {
        ...prevData[section],
        ...data,
      },
    }));

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
      case 0: // Child Info
        const childFields = ['firstName', 'lastName', 'dob', 'parentName', 'parentPhone', 'idNumber'];
        childFields.forEach(field => {
          const value = (formData.child as any)[field];
          let error = null;

          if (field === 'idNumber') {
            // Special validation for ID number - 9 digits
            if (!value || !/^\d{9}$/.test(value)) {
              error = 'מספר תעודת זהות חייב להיות 9 ספרות';
              isValid = false;
            }
          } else if (!value) {
            error = 'שדה זה הינו שדה חובה';
            isValid = false;
          }

          tempErrors.child = { ...tempErrors.child, [field]: error };
        });
        break;

      case 1: // Referral Info
        if (!formData.referral.chiefConcern) {
          tempErrors.referral = { ...tempErrors.referral, chiefConcern: 'שדה זה הינו שדה חובה' };
          isValid = false;
        }
        break;

      // Add validation for other steps as needed
    }

    setFormErrors(tempErrors);
    return isValid;
  };

  // Function to save current progress
  const saveCurrentProgress = useCallback(async (clientId: string) => {
    if (!clientId) return false;
    
    setCurrentClientId(clientId);
    setIsSaving(true);
    setSaveError(null);
    
    try {
      await saveParentIntake(clientId, formData);
      setLastSaved(new Date());
      setIsSaving(false);
      return true;
    } catch (error) {
      console.error('Error saving form progress:', error);
      setSaveError('שגיאה בשמירת הטופס. אנא נסה שוב.');
      setIsSaving(false);
      return false;
    }
  }, [formData]);

  // Clean up auto-save timer on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
    };
  }, [autoSaveTimer]);

  return (
    <FormContext.Provider value={{ 
      formData, 
      updateFormData, 
      currentStep, 
      setCurrentStep, 
      totalSteps,
      formErrors,
      validateField,
      validateStep,
      resetForm,
      saveCurrentProgress,
      isSaving,
      lastSaved,
      saveError
    }}>
      {children}
    </FormContext.Provider>
  );
};

export const useFormContext = () => {
  const context = useContext(FormContext);
  if (context === undefined) {
    throw new Error('useFormContext must be used within a FormProvider');
  }
  return context;
};