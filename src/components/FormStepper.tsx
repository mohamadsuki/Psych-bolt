import React from 'react';
import { useFormContext } from '../context/FormContext';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const FormStepper: React.FC = () => {
  const { currentStep, setCurrentStep, totalSteps, validateStep } = useFormContext();

  const handleNext = () => {
    // First validate the current step
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

  return (
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
        <ArrowRight className="ml-2" size={16} />
        חזרה
      </button>
      {/* Only show the Next button if we're not on the summary screen (last step) */}
      {currentStep < totalSteps && (
        <button
          onClick={handleNext}
          className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
        >
          המשך
          <ArrowLeft className="mr-2" size={16} />
        </button>
      )}
    </div>
  );
};

export default FormStepper;