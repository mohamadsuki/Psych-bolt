import React, { useState } from 'react';
import { useFormContext } from '../../context/FormContext';
import FormField from '../ui/FormField';
import TextArea from '../ui/TextArea';
import TextInput from '../ui/TextInput';
import RadioGroup from '../ui/RadioGroup';
import ConditionalField from '../ui/ConditionalField';
import { Plus, Trash } from 'lucide-react';

interface Sibling {
  id: string;
  name: string;
  age: string;
  notes: string;
}

const FamilyHistory: React.FC = () => {
  const { formData, updateFormData } = useFormContext();
  const familyData = formData.familyHistory;
  
  // Initialize siblings array if it doesn't exist
  const siblings = Array.isArray(familyData.siblingsList) 
    ? familyData.siblingsList 
    : [];
  
  const [newSibling, setNewSibling] = useState<Sibling>({
    id: '',
    name: '',
    age: '',
    notes: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    updateFormData('familyHistory', { [name]: value });
  };

  const handleBooleanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateFormData('familyHistory', { [name]: value === 'true' });
  };
  
  const handleNewSiblingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewSibling(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const addSibling = () => {
    if (newSibling.name.trim() === '' && newSibling.age.trim() === '') return;
    
    const updatedSiblings = [
      ...siblings,
      {
        ...newSibling,
        id: Date.now().toString() // Generate a unique ID
      }
    ];
    
    updateFormData('familyHistory', { siblingsList: updatedSiblings });
    
    // Reset form
    setNewSibling({
      id: '',
      name: '',
      age: '',
      notes: ''
    });
  };
  
  const removeSibling = (id: string) => {
    const updatedSiblings = siblings.filter(sibling => sibling.id !== id);
    updateFormData('familyHistory', { siblingsList: updatedSiblings });
  };

  return (
    <div className="animate-fadeIn">
      <h2 className="text-xl font-semibold mb-6 text-gray-800 border-b pb-2">היסטוריה משפחתית</h2>
      <p className="text-gray-600 mb-4">
        האם יש היסטוריה משפחתית (הורים, אחים, דודים, סבים וכו׳) של:
      </p>
      
      <FormField label="לקויות למידה">
        <RadioGroup
          options={[
            { label: 'כן', value: true },
            { label: 'לא', value: false }
          ]}
          name="learningDisabilities"
          value={familyData.learningDisabilities}
          onChange={handleBooleanChange}
        />
      </FormField>

      <ConditionalField show={familyData.learningDisabilities}>
        <FormField label="אנא פרטו את לקויות הלמידה והקרבה המשפחתית">
          <TextArea
            name="learningDisabilitiesDetails"
            value={familyData.learningDisabilitiesDetails}
            onChange={handleChange}
            rows={3}
          />
        </FormField>
      </ConditionalField>

      <FormField label="ADHD / הפרעת קשב וריכוז">
        <RadioGroup
          options={[
            { label: 'כן', value: true },
            { label: 'לא', value: false }
          ]}
          name="adhd"
          value={familyData.adhd}
          onChange={handleBooleanChange}
        />
      </FormField>

      <ConditionalField show={familyData.adhd}>
        <FormField label="אנא פרטו לגבי ADHD במשפחה והקרבה המשפחתית">
          <TextArea
            name="adhdDetails"
            value={familyData.adhdDetails}
            onChange={handleChange}
            rows={3}
          />
        </FormField>
      </ConditionalField>

      <FormField label="אוטיזם / ASD">
        <RadioGroup
          options={[
            { label: 'כן', value: true },
            { label: 'לא', value: false }
          ]}
          name="autism"
          value={familyData.autism}
          onChange={handleBooleanChange}
        />
      </FormField>

      <ConditionalField show={familyData.autism}>
        <FormField label="אנא פרטו לגבי אוטיזם במשפחה והקרבה המשפחתית">
          <TextArea
            name="autismDetails"
            value={familyData.autismDetails}
            onChange={handleChange}
            rows={3}
          />
        </FormField>
      </ConditionalField>

      <FormField label="קשיים נפשיים (דיכאון, חרדה וכו׳)">
        <RadioGroup
          options={[
            { label: 'כן', value: true },
            { label: 'לא', value: false }
          ]}
          name="mentalHealth"
          value={familyData.mentalHealth}
          onChange={handleBooleanChange}
        />
      </FormField>

      <ConditionalField show={familyData.mentalHealth}>
        <FormField label="אנא פרטו לגבי קשיים נפשיים במשפחה והקרבה המשפחתית">
          <TextArea
            name="mentalHealthDetails"
            value={familyData.mentalHealthDetails}
            onChange={handleChange}
            rows={3}
          />
        </FormField>
      </ConditionalField>

      <FormField label="האם יש לילד אחים/אחיות?">
        <RadioGroup
          options={[
            { label: 'כן', value: true },
            { label: 'לא', value: false }
          ]}
          name="siblings"
          value={familyData.siblings}
          onChange={handleBooleanChange}
        />
      </FormField>

      <ConditionalField show={familyData.siblings}>
        <FormField label="פרטי אחים/אחיות">
          <div className="mb-4">
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h3 className="font-medium text-gray-700 mb-3">הוסף אח/אחות</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField label="שם">
                  <TextInput
                    name="name"
                    value={newSibling.name}
                    onChange={handleNewSiblingChange}
                  />
                </FormField>
                
                <FormField label="גיל">
                  <TextInput
                    name="age"
                    value={newSibling.age}
                    onChange={handleNewSiblingChange}
                  />
                </FormField>
                
                <FormField label="הערות">
                  <TextInput
                    name="notes"
                    value={newSibling.notes}
                    onChange={handleNewSiblingChange}
                  />
                </FormField>
              </div>
              
              <button
                onClick={addSibling}
                className="mt-2 flex items-center bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 transition-colors"
              >
                <Plus size={16} className="ml-2" />
                הוסף אח/אחות
              </button>
            </div>
            
            {siblings.length > 0 ? (
              <div>
                <h3 className="font-medium text-gray-700 mb-3">רשימת אחים/אחיות</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">שם</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">גיל</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">הערות</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">פעולות</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {siblings.map((sibling, index) => (
                        <tr key={sibling.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">{sibling.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">{sibling.age}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">{sibling.notes}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button 
                              onClick={() => removeSibling(sibling.id)}
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
              <div className="text-center py-4 bg-gray-50 rounded-lg">
                <p className="text-gray-500">לא הוזנו אחים/אחיות עדיין.</p>
              </div>
            )}
          </div>
          <FormField label="מידע נוסף על האחים/אחיות">
            <TextArea
              name="siblingsDetails"
              value={familyData.siblingsDetails}
              onChange={handleChange}
              rows={3}
            />
          </FormField>
        </FormField>
      </ConditionalField>
    </div>
  );
};

export default FamilyHistory;