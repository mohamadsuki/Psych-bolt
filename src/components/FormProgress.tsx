import React from 'react';

interface FormProgressProps {
  currentStep: number;
  totalSteps: number;
}

const FormProgress: React.FC<FormProgressProps> = ({ currentStep, totalSteps }) => {
  const percentage = Math.round((currentStep / totalSteps) * 100);

  const getSectionName = (step: number): string => {
    switch (step) {
      case 0: return 'פרטים אישיים';
      case 1: return 'סיבת הפנייה';
      case 2: return 'הריון ולידה';
      case 3: return 'אבני דרך התפתחותיות';
      case 4: return 'היסטוריה רפואית';
      case 5: return 'היסטוריה משפחתית';
      case 6: return 'מסגרת חינוכית';
      case 7: return 'תפקוד נוכחי';
      case 8: return 'שירותים קודמים';
      case 9: return 'מידע נוסף';
      case 10: return 'סיכום';
      default: return '';
    }
  };

  return (
    <div className="max-w-3xl mx-auto mb-8">
      <div className="mb-2 flex justify-between items-center">
        <span className="text-sm font-medium text-teal-700">
          {getSectionName(currentStep)}
        </span>
        <span className="text-sm font-medium text-teal-700">
          {currentStep + 1} מתוך {totalSteps + 1}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className="bg-teal-600 h-2.5 rounded-full transition-all duration-300 ease-in-out" 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default FormProgress;