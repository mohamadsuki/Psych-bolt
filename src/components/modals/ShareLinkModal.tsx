import React, { useState } from 'react';
import { Copy, Check, X, Share2 } from 'lucide-react';
import { formatDateToDDMMYYYY } from '../../utils/dateUtils';

interface Client {
  id: string;
  child_first_name: string;
  child_last_name: string;
  child_dob: string;
  parent_name: string;
  parent_phone: string;
  parent_email: string;
  id_number: string;
}

interface ShareLinkModalProps {
  client: Client;
  onClose: () => void;
  isNewClient?: boolean;
}

const ShareLinkModal: React.FC<ShareLinkModalProps> = ({ client, onClose, isNewClient = false }) => {
  const [copied, setCopied] = useState(false);
  
  // Make sure we have an ID number to share
  const hasIdNumber = client.id_number && client.id_number.trim().length > 0;
  
  // Generate direct URL instead of relative path
  const baseUrl = window.location.origin;
  
  // IMPORTANT: Always use ID number in the URL if available, fallback to client.id only if no ID number exists
  const shareLink = `${baseUrl}/shared-form/${hasIdNumber ? client.id_number : client.id}`;
  
  // Copy link to clipboard
  const copyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  // Share via WhatsApp
  const shareViaWhatsApp = () => {
    const text = `שלום ${client.parent_name}, אנא מלא/י את טופס ההורים עבור ${client.child_first_name} בקישור: ${shareLink}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Go directly to the form - improved for mobile
  const goToForm = () => {
    window.location.href = shareLink;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <Share2 size={20} className="ml-2 text-teal-600" />
            שיתוף טופס הורים
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="סגור"
          >
            <X size={24} />
          </button>
        </div>
        
        {isNewClient && (
          <div className="bg-green-50 p-4 rounded-lg mb-4">
            <p className="font-bold text-green-700 mb-2">המטופל נוצר בהצלחה!</p>
            <p className="text-green-600 text-sm">
              המטופל {client.child_first_name} {client.child_last_name} נוצר בהצלחה במערכת.
              כעת תוכל לשלוח קישור להורה למילוי הטופס המלא או למלא את הטופס בעצמך.
            </p>
          </div>
        )}
        
        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <p className="font-medium text-blue-800 mb-2">פרטי המטופל:</p>
          <div className="text-sm text-blue-700">
            <p><span className="font-medium">שם: </span>{client.child_first_name} {client.child_last_name}</p>
            <p><span className="font-medium">תאריך לידה: </span>{formatDateToDDMMYYYY(client.child_dob)}</p>
            <p><span className="font-medium">ת.ז: </span>{client.id_number || 'לא צוין'}</p>
          </div>
        </div>
        
        <p className="mb-4 text-gray-600">
          שתף את הקישור הבא עם {client.parent_name} כדי שימלא את טופס ההורים עבור {client.child_first_name}.
        </p>
        
        <div className="bg-gray-100 p-3 rounded-lg mb-4 flex items-center">
          <input 
            type="text" 
            value={shareLink} 
            readOnly 
            className="bg-transparent flex-1 outline-none text-gray-800 pl-2" 
          />
          <button 
            onClick={copyLink} 
            className="p-2 rounded-full hover:bg-gray-200 transition-colors"
            title={copied ? "הועתק!" : "העתק קישור"}
          >
            {copied ? <Check size={18} className="text-green-600" /> : <Copy size={18} />}
          </button>
        </div>
        
        <div className="grid grid-cols-1 gap-4 mb-4">
          <button
            onClick={shareViaWhatsApp}
            className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
          >
            <span>שתף בוואטסאפ</span>
          </button>
          
          <button
            onClick={goToForm}
            className="bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-teal-700 transition-colors flex items-center justify-center"
          >
            <span>מלא את הטופס עכשיו</span>
          </button>
        </div>
        
        <div className="text-xs text-gray-500 mt-4">
          <p>הערה: הקישור מאפשר גישה לטופס ההורים בלבד ולא לשאר חלקי המערכת.</p>
          <p>הנתונים שימולאו ישמרו אוטומטית בחשבון המטופל.</p>
        </div>
      </div>
    </div>
  );
};

export default ShareLinkModal;