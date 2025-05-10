import React from 'react';
import { useEvaluator } from '../../context/EvaluatorContext';
import FormField from '../ui/FormField';
import TextInput from '../ui/TextInput';
import TextArea from '../ui/TextArea';

const ExecutiveFunction: React.FC = () => {
  const { evaluatorData, updateEvaluatorData } = useEvaluator();
  const executiveData = evaluatorData.executiveFunction;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseInt(value) || 0;
    
    updateEvaluatorData('executiveFunction', { [name]: numValue });
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateEvaluatorData('executiveFunction', { notes: e.target.value });
  };

  return (
    <div className="animate-fadeIn">
      <h2 className="text-xl font-semibold mb-6 text-gray-800 border-b pb-2">תפקודים ניהוליים</h2>
      
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h3 className="font-medium text-gray-700 mb-3">מדדי תפקוד ניהולי (T-scores)</h3>
        <p className="text-sm text-gray-500 mb-4">
          הזן ערכים מתוך שאלוני BRIEF-2, CPT, או מבחנים אחרים. ציוני T גבוהים יותר מצביעים על קשיים רבים יותר (ממוצע 50, ס.ת. 10).
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="קשב">
            <TextInput
              type="number"
              name="attention"
              value={executiveData.attention}
              onChange={handleChange}
              min={0}
              max={100}
            />
          </FormField>
          
          <FormField label="זיכרון עבודה">
            <TextInput
              type="number"
              name="workingMemory"
              value={executiveData.workingMemory}
              onChange={handleChange}
              min={0}
              max={100}
            />
          </FormField>
          
          <FormField label="עיכוב תגובה">
            <TextInput
              type="number"
              name="inhibition"
              value={executiveData.inhibition}
              onChange={handleChange}
              min={0}
              max={100}
            />
          </FormField>
          
          <FormField label="תכנון">
            <TextInput
              type="number"
              name="planning"
              value={executiveData.planning}
              onChange={handleChange}
              min={0}
              max={100}
            />
          </FormField>
          
          <FormField label="גמישות קוגניטיבית">
            <TextInput
              type="number"
              name="flexibility"
              value={executiveData.flexibility}
              onChange={handleChange}
              min={0}
              max={100}
            />
          </FormField>
        </div>
      </div>
      
      <FormField label="הערות ותובנות נוספות לגבי תפקודים ניהוליים">
        <TextArea
          name="notes"
          value={executiveData.notes}
          onChange={handleNotesChange}
          placeholder="תאר התרשמות קלינית וממצאים איכותניים לגבי תפקודים ניהוליים"
          rows={4}
        />
      </FormField>
      
      <div className="mt-4 text-sm text-gray-500">
        <p>* ציונים גבוהים יותר משקפים רמות גבוהות יותר של קושי</p>
        <p>* יש לכלול בהערות התייחסות להשפעת קשיים בתפקודים ניהוליים על תפקוד יומיומי</p>
      </div>
    </div>
  );
};

export default ExecutiveFunction;