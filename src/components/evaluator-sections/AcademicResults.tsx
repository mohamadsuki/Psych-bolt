import React from 'react';
import { useEvaluator } from '../../context/EvaluatorContext';
import FormField from '../ui/FormField';
import TextInput from '../ui/TextInput';

const AcademicResults: React.FC = () => {
  const { evaluatorData, updateEvaluatorData } = useEvaluator();
  const academicData = evaluatorData.academicResults;

  const handleReadingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseInt(value) || 0;
    
    updateEvaluatorData('academicResults', { 
      reading: { 
        ...academicData.reading, 
        [name]: numValue 
      } 
    });
  };

  const handleWritingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseInt(value) || 0;
    
    updateEvaluatorData('academicResults', { 
      writing: { 
        ...academicData.writing, 
        [name]: numValue 
      } 
    });
  };

  const handleMathChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseInt(value) || 0;
    
    updateEvaluatorData('academicResults', { 
      math: { 
        ...academicData.math, 
        [name]: numValue 
      } 
    });
  };

  return (
    <div className="animate-fadeIn">
      <h2 className="text-xl font-semibold mb-6 text-gray-800 border-b pb-2">מיומנויות אקדמיות</h2>

      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h3 className="font-medium text-gray-700 mb-3">קריאה</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField label="דיוק">
            <TextInput
              type="number"
              name="accuracy"
              value={academicData.reading.accuracy}
              onChange={handleReadingChange}
              min={40}
              max={160}
            />
          </FormField>
          
          <FormField label="שטף">
            <TextInput
              type="number"
              name="fluency"
              value={academicData.reading.fluency}
              onChange={handleReadingChange}
              min={40}
              max={160}
            />
          </FormField>
          
          <FormField label="הבנה">
            <TextInput
              type="number"
              name="comprehension"
              value={academicData.reading.comprehension}
              onChange={handleReadingChange}
              min={40}
              max={160}
            />
          </FormField>
        </div>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h3 className="font-medium text-gray-700 mb-3">כתיבה</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="איות">
            <TextInput
              type="number"
              name="spelling"
              value={academicData.writing.spelling}
              onChange={handleWritingChange}
              min={40}
              max={160}
            />
          </FormField>
          
          <FormField label="הבעה בכתב">
            <TextInput
              type="number"
              name="expression"
              value={academicData.writing.expression}
              onChange={handleWritingChange}
              min={40}
              max={160}
            />
          </FormField>
        </div>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-medium text-gray-700 mb-3">חשבון</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="חישוב">
            <TextInput
              type="number"
              name="calculation"
              value={academicData.math.calculation}
              onChange={handleMathChange}
              min={40}
              max={160}
            />
          </FormField>
          
          <FormField label="פתרון בעיות">
            <TextInput
              type="number"
              name="problemSolving"
              value={academicData.math.problemSolving}
              onChange={handleMathChange}
              min={40}
              max={160}
            />
          </FormField>
        </div>
      </div>
      
      <div className="mt-4 text-sm text-gray-500">
        <p>* ציונים הם בסולם תקן (ממוצע 100, סטיית תקן 15)</p>
        <p>* ניתן להזין תוצאות ממבחנים כמו WRAT-5, Woodcock-Johnson וכד'</p>
      </div>
    </div>
  );
};

export default AcademicResults;