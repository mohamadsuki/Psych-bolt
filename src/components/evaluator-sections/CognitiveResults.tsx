import React, { useState } from 'react';
import { useEvaluator } from '../../context/EvaluatorContext';
import FormField from '../ui/FormField';
import TextInput from '../ui/TextInput';
import { Plus, Trash } from 'lucide-react';

interface CognitiveIndex {
  index: string;
  score: number;
  percentile: number;
}

const CognitiveResults: React.FC = () => {
  const { evaluatorData, updateEvaluatorData } = useEvaluator();
  const cognitiveData = evaluatorData.cognitiveResults;
  
  const [newIndex, setNewIndex] = useState<CognitiveIndex>({
    index: '',
    score: 0,
    percentile: 0
  });

  const handleFsiqChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    updateEvaluatorData('cognitiveResults', { fsiq: value });
  };

  const handleNewIndexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'score' || name === 'percentile') {
      setNewIndex(prev => ({
        ...prev,
        [name]: parseInt(value) || 0
      }));
    } else {
      setNewIndex(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const addIndex = () => {
    if (newIndex.index.trim() === '') return;
    
    const updatedIndices = [...cognitiveData.indices, { ...newIndex }];
    updateEvaluatorData('cognitiveResults', { indices: updatedIndices });
    
    // Reset form
    setNewIndex({
      index: '',
      score: 0,
      percentile: 0
    });
  };

  const removeIndex = (index: number) => {
    const updatedIndices = [...cognitiveData.indices];
    updatedIndices.splice(index, 1);
    updateEvaluatorData('cognitiveResults', { indices: updatedIndices });
  };

  const commonIndices = [
    { label: 'הבנה מילולית (VCI)', value: 'VCI' },
    { label: 'חזותי-מרחבי (VSI)', value: 'VSI' },
    { label: 'היגיון שוטף (FRI)', value: 'FRI' },
    { label: 'זיכרון עבודה (WMI)', value: 'WMI' },
    { label: 'מהירות עיבוד (PSI)', value: 'PSI' }
  ];

  return (
    <div className="animate-fadeIn">
      <h2 className="text-xl font-semibold mb-6 text-gray-800 border-b pb-2">תוצאות קוגניטיביות</h2>
      
      <FormField label="ציון IQ כללי (FSIQ)">
        <TextInput
          type="number"
          name="fsiq"
          value={cognitiveData.fsiq}
          onChange={handleFsiqChange}
          min={40}
          max={160}
        />
      </FormField>
      
      <div className="bg-gray-50 p-4 rounded-lg mb-6 mt-6">
        <h3 className="font-medium text-gray-700 mb-3">הוסף מדד קוגניטיבי</h3>
        
        <div className="mb-4">
          <FormField label="בחר מדד נפוץ">
            <div className="flex flex-wrap gap-2">
              {commonIndices.map(item => (
                <button
                  key={item.value}
                  onClick={() => setNewIndex(prev => ({ ...prev, index: item.value }))}
                  className={`px-3 py-1 text-sm rounded-full ${
                    newIndex.index === item.value 
                      ? 'bg-teal-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </FormField>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField label="מדד">
            <TextInput
              name="index"
              value={newIndex.index}
              onChange={handleNewIndexChange}
              placeholder="לדוגמה: VCI"
            />
          </FormField>
          
          <FormField label="ציון תקן">
            <TextInput
              type="number"
              name="score"
              value={newIndex.score}
              onChange={handleNewIndexChange}
              min={40}
              max={160}
            />
          </FormField>
          
          <FormField label="אחוזון">
            <TextInput
              type="number"
              name="percentile"
              value={newIndex.percentile}
              onChange={handleNewIndexChange}
              min={0}
              max={99}
            />
          </FormField>
        </div>
        
        <button
          onClick={addIndex}
          className="mt-2 flex items-center bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 transition-colors"
        >
          <Plus size={16} className="ml-2" />
          הוסף מדד
        </button>
      </div>
      
      {cognitiveData.indices.length > 0 ? (
        <div>
          <h3 className="font-medium text-gray-700 mb-3">מדדים קוגניטיביים</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">מדד</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">ציון תקן</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">אחוזון</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">פעולות</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {cognitiveData.indices.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">{item.index}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">{item.score}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">{item.percentile}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => removeIndex(index)}
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
          <p className="text-gray-500">לא הוזנו מדדים קוגניטיביים עדיין.</p>
        </div>
      )}
    </div>
  );
};

export default CognitiveResults;