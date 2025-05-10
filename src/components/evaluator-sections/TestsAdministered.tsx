import React, { useState } from 'react';
import { useEvaluator } from '../../context/EvaluatorContext';
import FormField from '../ui/FormField';
import TextInput from '../ui/TextInput';
import { Plus, Trash } from 'lucide-react';

interface Test {
  name: string;
  version: string;
  date: string;
  domain: string;
}

const TestsAdministered: React.FC = () => {
  const { evaluatorData, updateEvaluatorData } = useEvaluator();
  const tests = Array.isArray(evaluatorData.testsAdministered) 
    ? evaluatorData.testsAdministered 
    : [];
  
  const [newTest, setNewTest] = useState<Test>({
    name: '',
    version: '',
    date: '',
    domain: ''
  });

  const handleNewTestChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewTest(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addTest = () => {
    if (newTest.name.trim() === '') return;
    
    // Ensure tests is an array before attempting to spread it
    const currentTests = Array.isArray(evaluatorData.testsAdministered) 
      ? evaluatorData.testsAdministered 
      : [];
    
    const updatedTests = [...currentTests, { ...newTest }];
    updateEvaluatorData('testsAdministered', updatedTests);
    
    // Reset form
    setNewTest({
      name: '',
      version: '',
      date: '',
      domain: ''
    });
  };

  const removeTest = (index: number) => {
    if (!Array.isArray(tests)) return;
    
    const updatedTests = [...tests];
    updatedTests.splice(index, 1);
    updateEvaluatorData('testsAdministered', updatedTests);
  };

  return (
    <div className="animate-fadeIn">
      <h2 className="text-xl font-semibold mb-6 text-gray-800 border-b pb-2">מבחנים שהועברו</h2>
      
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h3 className="font-medium text-gray-700 mb-3">הוסף מבחן חדש</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="שם המבחן">
            <TextInput
              name="name"
              value={newTest.name}
              onChange={handleNewTestChange}
              placeholder="לדוגמה: WISC-V"
            />
          </FormField>
          
          <FormField label="גרסה">
            <TextInput
              name="version"
              value={newTest.version}
              onChange={handleNewTestChange}
              placeholder="לדוגמה: HE"
            />
          </FormField>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="תאריך העברה">
            <TextInput
              type="date"
              name="date"
              value={newTest.date}
              onChange={handleNewTestChange}
            />
          </FormField>
          
          <FormField label="תחום / סיבה">
            <TextInput
              name="domain"
              value={newTest.domain}
              onChange={handleNewTestChange}
              placeholder="לדוגמה: קוגניציה, אקדמי, רגשי"
            />
          </FormField>
        </div>
        
        <button
          onClick={addTest}
          className="mt-2 flex items-center bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 transition-colors"
        >
          <Plus size={16} className="ml-2" />
          הוסף מבחן
        </button>
      </div>
      
      {Array.isArray(tests) && tests.length > 0 ? (
        <div>
          <h3 className="font-medium text-gray-700 mb-3">רשימת המבחנים שהועברו</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">שם המבחן</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">גרסה</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">תאריך</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">תחום</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">פעולות</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tests.map((test, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">{test.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">{test.version}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">{test.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">{test.domain}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => removeTest(index)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-6 bg-gray-50 rounded-lg">
          <p className="text-gray-500">לא הוזנו מבחנים עדיין. הוסף מבחן באמצעות הטופס שלמעלה.</p>
        </div>
      )}
    </div>
  );
};

export default TestsAdministered;