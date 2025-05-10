import React, { useState } from 'react';
import { useEvaluator } from '../../context/EvaluatorContext';
import FormField from '../ui/FormField';
import TextArea from '../ui/TextArea';
import { Plus, X } from 'lucide-react';

const Diagnosis: React.FC = () => {
  const { evaluatorData, updateEvaluatorData } = useEvaluator();
  const [newDiagnosis, setNewDiagnosis] = useState('');

  // Ensure diagnosis is always treated as an array
  const diagnosisList = Array.isArray(evaluatorData.diagnosis) 
    ? evaluatorData.diagnosis 
    : [];

  const addDiagnosis = () => {
    if (newDiagnosis.trim() === '') return;
    
    // Create a new array to ensure state update is triggered
    const updatedDiagnosis = [...diagnosisList, newDiagnosis.trim()];
    updateEvaluatorData('diagnosis', updatedDiagnosis);
    setNewDiagnosis('');
  };

  const removeDiagnosis = (index: number) => {
    const updatedDiagnosis = [...diagnosisList];
    updatedDiagnosis.splice(index, 1);
    updateEvaluatorData('diagnosis', updatedDiagnosis);
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    updateEvaluatorData('diagnosisNotes', value);
  };

  const handleQuickAddDiagnosis = (diagnosis: string) => {
    if (!diagnosisList.includes(diagnosis)) {
      const updatedDiagnosis = [...diagnosisList, diagnosis];
      updateEvaluatorData('diagnosis', updatedDiagnosis);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addDiagnosis();
    }
  };

  const commonDiagnoses = [
    'ADHD-Combined',
    'ADHD-Inattentive',
    'ADHD-Hyperactive',
    'SLD-Reading',
    'SLD-Math',
    'SLD-Written Expression',
    'ASD Level 1',
    'Anxiety Disorder',
    'DCD (Developmental Coordination Disorder)',
    'Language Disorder'
  ];

  return (
    <div className="animate-fadeIn">
      <h2 className="text-xl font-semibold mb-6 text-gray-800 border-b pb-2">מסקנות ואבחנה</h2>
      
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h3 className="font-medium text-gray-700 mb-3">אבחנות DSM-5 (אם רלוונטי)</h3>
        
        <div className="mb-4">
          <p className="text-sm text-gray-500 mb-2">אבחנות נפוצות:</p>
          <div className="flex flex-wrap gap-2">
            {commonDiagnoses.map(diagnosis => (
              <button
                key={diagnosis}
                onClick={() => handleQuickAddDiagnosis(diagnosis)}
                className="px-3 py-1 text-sm rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
              >
                {diagnosis}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex mb-2">
          <input
            type="text"
            value={newDiagnosis}
            onChange={(e) => setNewDiagnosis(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="הזן אבחנה"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-r-none rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
          <button
            onClick={addDiagnosis}
            className="bg-teal-600 text-white px-4 py-2 rounded-l-none rounded-lg hover:bg-teal-700 transition-colors"
          >
            <Plus size={16} />
          </button>
        </div>
        
        {diagnosisList.length > 0 ? (
          <div className="mt-4">
            <h4 className="text-gray-700 mb-2">אבחנות נוכחיות:</h4>
            <div className="flex flex-wrap gap-2">
              {diagnosisList.map((diagnosis, index) => (
                <div key={index} className="flex items-center px-3 py-1 bg-teal-100 text-teal-800 rounded-full">
                  {diagnosis}
                  <button 
                    onClick={() => removeDiagnosis(index)}
                    className="ml-2 text-teal-600 hover:text-teal-800"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-sm italic">
            לא הוזנו אבחנות עדיין. יש להוסיף אבחנות רק אם רלוונטיות ובהתאם לקריטריונים המקצועיים.
          </p>
        )}
      </div>
      
      <FormField label="הערות והסברים לגבי המסקנות והאבחנה">
        <TextArea
          name="diagnosisNotes"
          value={evaluatorData.diagnosisNotes || ''}
          onChange={handleNotesChange}
          placeholder="פרט את הסיבות לאבחנות, תאר את ביטויי הקשיים, דון במידת ההתאמה לקריטריונים המקצועיים"
          rows={6}
        />
      </FormField>
      
      <div className="mt-4 text-sm text-gray-500">
        <p>* יש לשים לב לאבחנות מבדלות ולאבחנות נלוות</p>
        <p>* חשוב להבהיר מדוע הממצאים מתאימים לאבחנה המוצעת</p>
        <p>* במקרה של חוסר בהירות אבחנתית, יש לציין זאת ולהסביר את הסיבות</p>
      </div>
    </div>
  );
};

export default Diagnosis;