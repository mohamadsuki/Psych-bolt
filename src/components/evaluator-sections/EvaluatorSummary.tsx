import React from 'react';
import { useEvaluator } from '../../context/EvaluatorContext';
import { CheckCircle, FileText } from 'lucide-react';

interface EvaluatorSummaryProps {
  onSubmit: () => void;
}

const EvaluatorSummary: React.FC<EvaluatorSummaryProps> = ({ onSubmit }) => {
  const { evaluatorData, currentStep, setCurrentStep } = useEvaluator();

  // Ensure all arrays are properly handled
  const diagnosisList = Array.isArray(evaluatorData.diagnosis) 
    ? evaluatorData.diagnosis 
    : [];
    
  const testsAdministered = Array.isArray(evaluatorData.testsAdministered)
    ? evaluatorData.testsAdministered
    : [];

  const handleBack = () => {
    setCurrentStep(9); // Go back to the previous step
  };

  return (
    <div className="animate-fadeIn">
      <h2 className="text-xl font-semibold mb-6 text-gray-800 border-b pb-2">סיכום הערכה</h2>
      
      <p className="text-gray-600 mb-6">
        להלן סיכום המידע שהוזן במהלך טופס ההערכה. אנא בדקו את המידע לפני הגשת הטופס הסופית.
      </p>
      
      {/* Evaluator details */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2 text-gray-700">פרטי המאבחן</h3>
        <div className="bg-gray-50 p-3 rounded-md">
          <p><span className="font-medium">שם: </span>{evaluatorData.evaluator.name}</p>
          <p><span className="font-medium">מס' רישיון: </span>{evaluatorData.evaluator.licenseNo}</p>
          <p><span className="font-medium">תאריך אבחון: </span>{evaluatorData.evaluator.examDate}</p>
        </div>
      </div>
      
      {/* Tests administered */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2 text-gray-700">מבחנים שהועברו</h3>
        <div className="bg-gray-50 p-3 rounded-md">
          {testsAdministered.length > 0 ? (
            <ul className="list-disc list-inside">
              {testsAdministered.map((test, index) => (
                <li key={index}>
                  {test.name} {test.version && `(${test.version})`} - {test.domain}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic">לא הוזנו מבחנים</p>
          )}
        </div>
      </div>
      
      {/* Diagnosis */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2 text-gray-700">אבחנות</h3>
        <div className="bg-gray-50 p-3 rounded-md">
          {diagnosisList.length > 0 ? (
            <ul className="list-disc list-inside">
              {diagnosisList.map((diagnosis, index) => (
                <li key={index}>{diagnosis}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic">לא הוזנו אבחנות</p>
          )}
        </div>
      </div>
      
      {/* Recommendations summary */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2 text-gray-700">המלצות</h3>
        <div className="bg-gray-50 p-3 rounded-md">
          <p><span className="font-medium">לצוות חינוכי: </span>
            {evaluatorData.recommendations.school ? 
              evaluatorData.recommendations.school.substring(0, 100) + '...' : 
              <span className="text-gray-500 italic">לא הוזנו המלצות</span>}
          </p>
          <p><span className="font-medium">להורים: </span>
            {evaluatorData.recommendations.parents ? 
              evaluatorData.recommendations.parents.substring(0, 100) + '...' : 
              <span className="text-gray-500 italic">לא הוזנו המלצות</span>}
          </p>
        </div>
      </div>
      
      <div className="mt-8 flex justify-between">
        <button
          onClick={handleBack}
          className="px-4 py-2 bg-white text-teal-600 border border-teal-600 rounded-md hover:bg-teal-50 transition-colors"
        >
          חזרה
        </button>
        
        <button
          onClick={onSubmit}
          className="px-6 py-3 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors font-medium flex items-center justify-center"
        >
          <FileText className="ml-2" size={20} />
          הגש את טופס ההערכה
        </button>
      </div>
    </div>
  );
};

export default EvaluatorSummary;