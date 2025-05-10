import React, { useState } from 'react';
import { useFormContext } from '../../context/FormContext';
import { CheckCircle, Loader, ArrowRight } from 'lucide-react';
import { formatDateToDDMMYYYY } from '../../utils/dateUtils';

interface FormSummaryProps {
  onSubmit: () => void;
}

const FormSummary: React.FC<FormSummaryProps> = ({ onSubmit }) => {
  const { formData, setCurrentStep } = useFormContext();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const renderSectionSummary = (title: string, data: Record<string, any>) => {
    const filteredData = Object.entries(data).filter(([key, value]) => {
      // Don't show detail fields when their parent boolean is false
      if (key.endsWith('Details') && !data[key.replace('Details', '')]) {
        return false;
      }
      return value !== '' && value !== false && value !== 0;
    });

    if (filteredData.length === 0) return null;

    return (
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2 text-gray-700">{title}</h3>
        <div className="bg-gray-50 p-3 rounded-md">
          {filteredData.map(([key, value]) => {
            // Skip detail fields as they'll be shown with their parent
            if (key.endsWith('Details')) return null;
            
            // Format the key for display
            const formattedKey = key
              .replace(/([A-Z])/g, ' $1') // Add space before capital letters
              .replace(/^./, str => str.toUpperCase()); // Capitalize first letter
            
            // Format date values
            if (key === 'dob' && typeof value === 'string') {
              value = formatDateToDDMMYYYY(value);
            }
            
            // For boolean values, show the detail field if it exists
            if (typeof value === 'boolean' && value === true) {
              const detailKey = `${key}Details`;
              const detailValue = data[detailKey];
              
              return (
                <div key={key} className="mb-2">
                  <div className="flex items-start">
                    <CheckCircle className="text-teal-500 ml-2 mt-1" size={16} />
                    <div>
                      <span className="font-medium">{formattedKey}</span>
                      {detailValue && (
                        <p className="text-gray-600 text-sm mt-1">{detailValue}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            }
            
            // Handle arrays of objects (like siblingsList)
            if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object') {
              return (
                <div key={key} className="mb-2">
                  <span className="font-medium">{formattedKey}:</span>
                  <div className="ml-4 mt-1">
                    {value.map((item, index) => (
                      <div key={index} className="mb-2 p-2 bg-white rounded border border-gray-100">
                        {Object.entries(item).map(([itemKey, itemValue]) => {
                          // Skip id field
                          if (itemKey === 'id') return null;
                          
                          // Format the item key for display
                          const formattedItemKey = itemKey
                            .replace(/([A-Z])/g, ' $1')
                            .replace(/^./, str => str.toUpperCase());
                          
                          return (
                            <div key={itemKey} className="text-sm">
                              <span className="font-medium">{formattedItemKey}: </span>
                              <span className="text-gray-700">{String(itemValue)}</span>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              );
            }
            
            return (
              <div key={key} className="mb-2">
                <span className="font-medium">{formattedKey}: </span>
                <span className="text-gray-700">{typeof value === 'object' ? JSON.stringify(value) : String(value)}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const handleFormSubmit = () => {
    setIsSubmitting(true);
    onSubmit();
  };

  const handleBack = () => {
    setCurrentStep(9); // Go back to the previous step
  };

  return (
    <div className="animate-fadeIn">
      <h2 className="text-xl font-semibold mb-6 text-gray-800 border-b pb-2">סיכום הטופס</h2>
      
      <p className="text-gray-600 mb-6">
        תודה על מילוי השאלון. אנא סקרו את המידע שהזנתם לפני ההגשה הסופית.
        אם יש צורך בתיקונים, השתמשו בכפתורי הניווט כדי לחזור לסעיפים הרלוונטיים.
      </p>

      {renderSectionSummary('פרטים אישיים', formData.child)}
      {renderSectionSummary('סיבת הפנייה', formData.referral)}
      {renderSectionSummary('הריון ולידה', formData.pregnancy)}
      {renderSectionSummary('אבני דרך התפתחותיות', formData.developmentalMilestones)}
      {renderSectionSummary('היסטוריה רפואית', formData.medicalHistory)}
      {renderSectionSummary('היסטוריה משפחתית', formData.familyHistory)}
      {renderSectionSummary('מסגרת חינוכית', formData.education)}
      {renderSectionSummary('תפקוד נוכחי', formData.currentFunctioning)}
      {renderSectionSummary('שירותים טיפוליים קודמים', formData.previousServices)}
      {renderSectionSummary('מידע נוסף', formData.additionalInfo)}

      <div className="mt-8 flex justify-between">
        <button
          onClick={handleBack}
          className="px-4 py-2 bg-white text-teal-600 border border-teal-600 rounded-md hover:bg-teal-50 transition-colors flex items-center"
        >
          <ArrowRight className="ml-2" size={16} />
          חזרה
        </button>
        
        <button
          onClick={handleFormSubmit}
          disabled={isSubmitting}
          className="px-6 py-3 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors font-medium flex items-center"
        >
          {isSubmitting ? (
            <>
              <Loader className="animate-spin ml-2" size={20} />
              שולח טופס...
            </>
          ) : (
            <>
              <CheckCircle className="ml-2" size={20} />
              הגש את הטופס
            </>
          )}
        </button>
      </div>

      <p className="mt-4 text-center text-sm text-gray-500">
        לאחר הגשת הטופס, תועבר למסך רשימת המטופלים
      </p>
    </div>
  );
};

export default FormSummary;