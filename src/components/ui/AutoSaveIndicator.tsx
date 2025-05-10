import React from 'react';
import { Save, Check, AlertCircle, Loader } from 'lucide-react';

interface AutoSaveIndicatorProps {
  isSaving: boolean;
  lastSaved: Date | null;
  saveError: string | null;
}

const AutoSaveIndicator: React.FC<AutoSaveIndicatorProps> = ({ isSaving, lastSaved, saveError }) => {
  // Format the last saved time
  const formatLastSaved = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  if (saveError) {
    return (
      <div className="flex items-center text-red-600">
        <AlertCircle size={14} className="ml-1" />
        <span className="text-xs">שגיאה בשמירה</span>
      </div>
    );
  }

  if (isSaving) {
    return (
      <div className="flex items-center text-gray-500">
        <Loader size={14} className="animate-spin ml-1" />
        <span className="text-xs">שומר...</span>
      </div>
    );
  }

  if (lastSaved) {
    return (
      <div className="flex items-center text-green-600">
        <Check size={14} className="ml-1" />
        <span className="text-xs">נשמר בשעה {formatLastSaved(lastSaved)}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center text-gray-400">
      <Save size={14} className="ml-1" />
      <span className="text-xs">שמירה אוטומטית</span>
    </div>
  );
};

export default AutoSaveIndicator;