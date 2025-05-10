import React from 'react';
import { useEvaluator } from '../../context/EvaluatorContext';
import FormField from '../ui/FormField';
import TextArea from '../ui/TextArea';
import RadioGroup from '../ui/RadioGroup';
import ConditionalField from '../ui/ConditionalField';

interface CheckboxItem {
  label: string;
  value: string;
}

const ClinicalObservation: React.FC = () => {
  const { evaluatorData, updateEvaluatorData } = useEvaluator();
  const observationData = evaluatorData.clinicalObservation;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    updateEvaluatorData('clinicalObservation', { [name]: value });
  };

  const handleAffectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateEvaluatorData('clinicalObservation', { affect: e.target.value });
  };

  const handleEyeContactChange = (value: number) => {
    updateEvaluatorData('clinicalObservation', { eyeContact: value });
  };

  const handleBehaviorChange = (item: CheckboxItem, isChecked: boolean) => {
    let updatedBehaviors = [...observationData.behavior];
    
    if (isChecked) {
      updatedBehaviors.push(item.value);
    } else {
      updatedBehaviors = updatedBehaviors.filter(behavior => behavior !== item.value);
    }
    
    updateEvaluatorData('clinicalObservation', { behavior: updatedBehaviors });
  };

  const behaviorItems: CheckboxItem[] = [
    { label: 'שיתוף פעולה', value: 'שיתוף פעולה' },
    { label: 'היפראקטיביות', value: 'היפראקטיביות' },
    { label: 'חרדה', value: 'חרדה' },
    { label: 'תסכול', value: 'תסכול' },
    { label: 'הימנעות', value: 'הימנעות' },
    { label: 'אחר', value: 'אחר' },
  ];

  return (
    <div className="animate-fadeIn">
      <h2 className="text-xl font-semibold mb-6 text-gray-800 border-b pb-2">תצפית קלינית</h2>
      
      <FormField label="מראה כללי">
        <TextArea
          name="generalAppearance"
          value={observationData.generalAppearance}
          onChange={handleChange}
          placeholder="תיאור המראה הכללי, לבוש, היגיינה, וכד׳"
          rows={3}
        />
      </FormField>

      <FormField label="התנהגות במפגש">
        <div className="space-y-2 mt-2 mb-4">
          {behaviorItems.map(item => (
            <div key={item.value} className="flex items-center">
              <input
                type="checkbox"
                id={`behavior-${item.value}`}
                checked={observationData.behavior.includes(item.value)}
                onChange={(e) => handleBehaviorChange(item, e.target.checked)}
                className="ml-2 h-4 w-4 text-teal-600 rounded focus:ring-teal-500"
              />
              <label htmlFor={`behavior-${item.value}`} className="text-gray-700">
                {item.label}
              </label>
            </div>
          ))}
        </div>
      </FormField>

      <ConditionalField show={observationData.behavior.includes('אחר')}>
        <FormField label="פירוט התנהגות אחרת">
          <TextArea
            name="behaviorOther"
            value={observationData.behaviorOther}
            onChange={handleChange}
            rows={2}
          />
        </FormField>
      </ConditionalField>

      <FormField label="מצב רוח ואפקט">
        <RadioGroup
          options={[
            { label: 'נורמוטימי (תקין)', value: 'נורמוטימי' },
            { label: 'ירוד', value: 'ירוד' },
            { label: 'מוגבר', value: 'מוגבר' },
            { label: 'לבילי (לא יציב)', value: 'לבילי' },
            { label: 'שטוח', value: 'שטוח' }
          ]}
          name="affect"
          value={observationData.affect}
          onChange={handleAffectChange}
          direction="vertical"
        />
      </FormField>

      <ConditionalField show={observationData.affect !== 'נורמוטימי'}>
        <FormField label="הערות לגבי מצב הרוח והאפקט">
          <TextArea
            name="affectNotes"
            value={observationData.affectNotes}
            onChange={handleChange}
            rows={2}
          />
        </FormField>
      </ConditionalField>

      <FormField label="דיבור ושפה">
        <TextArea
          name="language"
          value={observationData.language}
          onChange={handleChange}
          placeholder="שטף, קוהרנטיות, אוצר מילים, הגייה, וכד׳"
          rows={3}
        />
      </FormField>

      <FormField label="קשר עין (דרג 1-5)">
        <div className="flex justify-between items-center space-x-4 mt-2">
          <button 
            className={`w-10 h-10 rounded-full ${observationData.eyeContact === 1 ? 'bg-teal-600 text-white' : 'bg-gray-200'}`}
            onClick={() => handleEyeContactChange(1)}
          >
            1
          </button>
          <button 
            className={`w-10 h-10 rounded-full ${observationData.eyeContact === 2 ? 'bg-teal-600 text-white' : 'bg-gray-200'}`}
            onClick={() => handleEyeContactChange(2)}
          >
            2
          </button>
          <button 
            className={`w-10 h-10 rounded-full ${observationData.eyeContact === 3 ? 'bg-teal-600 text-white' : 'bg-gray-200'}`}
            onClick={() => handleEyeContactChange(3)}
          >
            3
          </button>
          <button 
            className={`w-10 h-10 rounded-full ${observationData.eyeContact === 4 ? 'bg-teal-600 text-white' : 'bg-gray-200'}`}
            onClick={() => handleEyeContactChange(4)}
          >
            4
          </button>
          <button 
            className={`w-10 h-10 rounded-full ${observationData.eyeContact === 5 ? 'bg-teal-600 text-white' : 'bg-gray-200'}`}
            onClick={() => handleEyeContactChange(5)}
          >
            5
          </button>
        </div>
        <div className="flex justify-between text-sm text-gray-500 mt-1">
          <span>מועט מאוד</span>
          <span>מצוין</span>
        </div>
      </FormField>
    </div>
  );
};

export default ClinicalObservation;