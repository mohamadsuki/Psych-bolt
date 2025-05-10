import React, { useState, useEffect } from 'react';
import { CheckCircle, FileOutput, AlertTriangle } from 'lucide-react';
import { getClientById, getParentIntake, saveEvaluatorAssessment } from '../../lib/supabase';
import { useEvaluator } from '../../context/EvaluatorContext';

interface EvaluationCompleteProps {
  onViewReport?: () => void;
  clientId?: string;
}

const EvaluationComplete: React.FC<EvaluationCompleteProps> = ({ onViewReport, clientId }) => {
  const [parentFormComplete, setParentFormComplete] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [clientInfo, setClientInfo] = useState<any>(null);
  const { evaluatorData } = useEvaluator();

  useEffect(() => {
    if (clientId) {
      checkParentFormStatus(clientId);
      
      // Save evaluator assessment to the database
      saveAssessmentData(clientId);
    }
  }, [clientId]);

  const saveAssessmentData = async (id: string) => {
    try {
      setLoading(true);
      
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
      
      // Save evaluation data to database with submission flag
      await saveEvaluatorAssessment(id, sanitizedData, true);
      
    } catch (err) {
      console.error('Error saving evaluator assessment:', err);
      setError('לא ניתן לשמור את הערכת המאבחן. נא לנסות שוב.');
    } finally {
      setLoading(false);
    }
  };

  const checkParentFormStatus = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Get client info
      const client = await getClientById(id);
      setClientInfo(client);
      
      // Check if parent intake exists and has been submitted
      const parentIntake = await getParentIntake(id);
      setParentFormComplete(!!(parentIntake && parentIntake.submitted_at));
    } catch (err) {
      console.error('Error checking parent form status:', err);
      setError('לא ניתן לבדוק את סטטוס טופס ההורים. נא לנסות שוב.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-center py-8 animate-fadeIn">
      <div className="inline-flex items-center justify-center p-2 bg-green-100 text-green-600 rounded-full mb-4">
        <CheckCircle size={40} />
      </div>
      
      <h2 className="text-2xl font-bold mb-4 text-gray-800">הערכת המאבחן נשלחה בהצלחה!</h2>
      
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        הערכת המאבחן נשמרה במערכת. ניתן כעת להפיק דו"ח אבחון משולב המבוסס על מידע זה ועל שאלון ההורים.
      </p>
      
      <div className="bg-blue-50 p-4 rounded-lg text-blue-800 max-w-md mx-auto">
        <h3 className="font-medium mb-2">השלבים הבאים</h3>
        <ul className="text-right space-y-2">
          <li className="flex items-start">
            <span className="inline-block ml-2 mt-1">✓</span>
            <span>ניתוח המידע משאלון ההורים והערכת המאבחן</span>
          </li>
          <li className="flex items-start">
            <span className="inline-block ml-2 mt-1">✓</span>
            <span>יצירת דו"ח אבחון משולב</span>
          </li>
          <li className="flex items-start">
            <span className="inline-block ml-2 mt-1">✓</span>
            <span>שיתוף הדו"ח עם הגורמים הרלוונטיים</span>
          </li>
          <li className="flex items-start">
            <span className="inline-block ml-2 mt-1">✓</span>
            <span>פגישת סיכום עם הורי הילד/ה</span>
          </li>
        </ul>
      </div>
      
      {!parentFormComplete && !loading && (
        <div className="mt-6 bg-yellow-50 p-4 rounded-lg max-w-md mx-auto">
          <div className="flex items-center text-yellow-700 mb-2">
            <AlertTriangle size={20} className="ml-2" />
            <span className="font-medium">שימו לב</span>
          </div>
          <p className="text-yellow-700 text-sm">
            טופס ההורים טרם מולא עבור ילד/ה זה. להפקת דו"ח אבחון מלא, נדרש למלא גם את טופס ההורים.
          </p>
        </div>
      )}
      
      <div className="mt-8">
        <button 
          onClick={onViewReport}
          className="px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors flex items-center mx-auto"
        >
          <FileOutput size={20} className="ml-2" />
          הפק דו"ח אבחון
        </button>
      </div>
      
      <p className="mt-8 text-gray-500 text-sm">
        לשאלות או בירורים, צרו קשר עם מנהל המערכת
      </p>
    </div>
  );
};

export default EvaluationComplete;