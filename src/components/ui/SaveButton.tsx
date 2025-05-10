import React from 'react';
import { Save, Check, Loader } from 'lucide-react';

interface SaveButtonProps {
  onSave: () => void;
  isSaving: boolean;
  lastSaved: Date | null;
  saveError: string | null;
}

const SaveButton: React.FC<SaveButtonProps> = ({ onSave, isSaving, lastSaved, saveError }) => {
  // Format the last saved time
  const formatLastSaved = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  return (
    <div className="fixed bottom-4 left-4">
      <div className="flex flex-col items-start">
        {saveError && (
          <div className="mb-1 bg-red-100 text-red-700 text-sm p-1 rounded shadow">
            {saveError}
          </div>
        )}
        <button
          onClick={onSave}
          disabled={isSaving}
          className="bg-white border border-gray-200 shadow-md rounded-lg px-4 py-2 flex items-center space-x-reverse space-x-2 hover:bg-gray-50 transition-colors"
        >
          {isSaving ? (
            <>
              <Loader size={16} className="animate-spin ml-1" />
              <span>שומר...</span>
            </>
          ) : lastSaved ? (
            <>
              <Check size={16} className="text-green-500 ml-1" />
              <span className="text-gray-700">נשמר ב-{formatLastSaved(lastSaved)}</span>
            </>
          ) : (
            <>
              <Save size={16} className="ml-1" />
              <span>שמור התקדמות</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default SaveButton;