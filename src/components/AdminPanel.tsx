import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { getTherapists, getClients, updateClientTherapist, createTherapist, deleteTherapist } from '../lib/supabase';
import { Users, UserPlus, Trash2, Edit, AlertCircle, Loader, RefreshCw, Save, X, Share2, Copy, Check } from 'lucide-react';
import { Therapist } from '../lib/auth';
import { formatDateToDDMMYYYY } from '../utils/dateUtils';

interface Client {
  id: string;
  child_first_name: string;
  child_last_name: string;
  child_dob: string;
  therapist_id: string;
  id_number?: string;
  created_at: string;
}

const AdminPanel: React.FC = () => {
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // New therapist form
  const [showNewTherapistForm, setShowNewTherapistForm] = useState(false);
  const [newTherapist, setNewTherapist] = useState({
    name: '',
    code: ''
  });
  const [savingTherapist, setSavingTherapist] = useState(false);
  const [therapistError, setTherapistError] = useState<string | null>(null);
  const [editingTherapist, setEditingTherapist] = useState<Therapist | null>(null);
  const [updatingClient, setUpdatingClient] = useState<string | null>(null);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [codeCopied, setCodeCopied] = useState(false);

  const generateRandomCode = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setGeneratedCode(code);
    setCodeCopied(false);
  };

  const copyCode = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    }
  };

  const shareViaWhatsApp = () => {
    if (generatedCode) {
      const text = `קוד הגישה שלך למערכת האבחון הוא: ${generatedCode}`;
      const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredClients(clients);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = clients.filter(client => 
        client.child_first_name.toLowerCase().includes(query) ||
        client.child_last_name.toLowerCase().includes(query) ||
        (client.id_number && client.id_number.includes(query))
      );
      setFilteredClients(filtered);
    }
  }, [searchQuery, clients]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch both therapists and clients in parallel
      const [therapistsData, clientsData] = await Promise.all([
        getTherapists(),
        getClients()
      ]);
      
      setTherapists(therapistsData || []);
      setClients(clientsData || []);
      setFilteredClients(clientsData || []);
      
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.message || 'שגיאה בטעינת נתונים. אנא נסה שוב.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTherapist = async () => {
    try {
      setTherapistError(null);
      setSavingTherapist(true);
      
      // Validate inputs
      if (!newTherapist.name.trim()) {
        setTherapistError('שם המטפל הוא שדה חובה');
        return;
      }
      
      const codeToUse = generatedCode || newTherapist.code;
      if (!codeToUse.trim()) {
        setTherapistError('קוד גישה הוא שדה חובה');
        return;
      }
      
      // Prevent using admin code
      if (codeToUse === 'admin123') {
        setTherapistError('קוד זה שמור למנהל המערכת');
        return;
      }
      
      // Check for duplicate code
      if (therapists.some(t => t.code === codeToUse && (!editingTherapist || t.id !== editingTherapist.id))) {
        setTherapistError('קוד גישה זה כבר קיים במערכת');
        return;
      }
      
      // Ensure we have a valid session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        throw new Error('Authentication session invalid');
      }
      
      if (!session) {
        throw new Error('No authenticated session found');
      }
      
      if (editingTherapist) {
        // Update existing therapist
        await createTherapist({
          ...newTherapist,
          code: codeToUse,
          id: editingTherapist.id
        });
      } else {
        // Create new therapist
        await createTherapist({
          ...newTherapist,
          code: codeToUse
        });
      }
      
      // Reset form and refresh data
      setNewTherapist({
        name: '',
        code: ''
      });
      setGeneratedCode(null);
      setShowNewTherapistForm(false);
      setEditingTherapist(null);
      await fetchData();
      
    } catch (err: any) {
      console.error('Error creating therapist:', err);
      setTherapistError(err.message || 'שגיאה בשמירת המטפל. אנא נסה שוב.');
    } finally {
      setSavingTherapist(false);
    }
  };
  
  const handleDeleteTherapist = async (id: string) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק מטפל זה? מטופלים המשויכים למטפל זה לא יימחקו.')) {
      return;
    }
    
    try {
      setLoading(true);
      await deleteTherapist(id);
      await fetchData();
    } catch (err: any) {
      console.error('Error deleting therapist:', err);
      setError(err.message || 'שגיאה במחיקת המטפל. אנא נסה שוב.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleEditTherapist = (therapist: Therapist) => {
    setNewTherapist({
      name: therapist.name,
      code: therapist.code
    });
    setEditingTherapist(therapist);
    setShowNewTherapistForm(true);
  };
  
  const handleCancelEdit = () => {
    setNewTherapist({
      name: '',
      code: ''
    });
    setEditingTherapist(null);
    setShowNewTherapistForm(false);
    setTherapistError(null);
  };
  
  const handleAssignClient = async (clientId: string, therapistId: string) => {
    try {
      setUpdatingClient(clientId);
      await updateClientTherapist(clientId, therapistId);
      
      // Update local state to avoid refetching all data
      setClients(prevClients => 
        prevClients.map(client => 
          client.id === clientId ? { ...client, therapist_id: therapistId } : client
        )
      );
    } catch (err: any) {
      console.error('Error assigning client:', err);
      setError(err.message || 'שגיאה בשיוך המטופל. אנא נסה שוב.');
    } finally {
      setUpdatingClient(null);
    }
  };

  const getTherapistName = (therapistId: string | null | undefined): string => {
    if (!therapistId) return 'לא משויך';
    const therapist = therapists.find(t => t.id === therapistId);
    return therapist ? therapist.name : 'לא ידוע';
  };
  
  const isAdminTherapist = (code: string): boolean => {
    return code === 'admin123';
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <Loader className="animate-spin w-10 h-10 mx-auto mb-4 text-blue-600" />
        <p className="text-gray-600">טוען נתונים...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center p-2 bg-blue-600 text-white rounded-full mb-3">
          <Users size={24} />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">ניהול מטפלים ושיוך מטופלים</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          ניהול רשימת המטפלים במערכת ושיוך מטופלים למטפלים
        </p>
      </div>
      
      {error && (
        <div className="bg-red-50 p-4 rounded-lg mb-6 max-w-4xl mx-auto">
          <div className="flex items-start">
            <AlertCircle className="text-red-500 ml-2 mt-1" size={20} />
            <div>
              <p className="text-red-700">{error}</p>
              <button
                onClick={fetchData}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors mt-2 flex items-center"
              >
                <RefreshCw size={16} className="ml-2" />
                נסה שוב
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Therapists Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">רשימת מטפלים</h2>
          
          <button
            onClick={() => setShowNewTherapistForm(!showNewTherapistForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
          >
            <UserPlus size={18} className="ml-2" />
            {showNewTherapistForm ? 'סגור טופס' : 'הוסף מטפל חדש'}
          </button>
        </div>
        
        {showNewTherapistForm && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="text-lg font-medium mb-4">
              {editingTherapist ? 'עריכת מטפל' : 'הוספת מטפל חדש'}
              {!editingTherapist && (
                <button
                  onClick={generateRandomCode}
                  className="mr-4 px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                >
                  צור קוד רנדומלי
                </button>
              )}
            </h3>
            
            {generatedCode && !editingTherapist && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="font-mono text-blue-800 text-lg">{generatedCode}</span>
                    <button
                      onClick={copyCode}
                      className="ml-2 p-1 text-blue-600 hover:text-blue-800"
                      title={codeCopied ? "הועתק!" : "העתק קוד"}
                    >
                      {codeCopied ? (
                        <div className="text-green-600">
                          <Check size={16} />
                        </div>
                      ) : (
                        <Copy size={16} />
                      )}
                    </button>
                  </div>
                  <button
                    onClick={shareViaWhatsApp}
                    className="flex items-center px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    <Share2 size={14} className="ml-1" />
                    שתף בוואטסאפ
                  </button>
                </div>
              </div>
            )}
            
            {therapistError && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg flex items-start">
                <AlertCircle className="ml-2 mt-0.5 flex-shrink-0" size={18} />
                <span>{therapistError}</span>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  שם המטפל
                </label>
                <input
                  type="text"
                  value={newTherapist.name}
                  onChange={(e) => setNewTherapist({...newTherapist, name: e.target.value})}
                  onPaste={(e) => {
                    const pasteText = e.clipboardData.getData('text');
                    setNewTherapist({...newTherapist, name: pasteText});
                    e.preventDefault();
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="הכנס שם מלא של המטפל"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  קוד גישה
                </label>
                <input
                  type="text"
                  value={generatedCode || newTherapist.code}
                  onChange={(e) => {
                    setNewTherapist({...newTherapist, code: e.target.value});
                    setGeneratedCode(null);
                  }}
                  onPaste={(e) => {
                    const pasteText = e.clipboardData.getData('text');
                    setNewTherapist({...newTherapist, code: pasteText});
                    setGeneratedCode(null);
                    e.preventDefault();
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="קוד גישה ייחודי למטפל"
                />
              </div>
            </div>
            
            <div className="flex space-x-4 space-x-reverse">
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
              >
                ביטול
              </button>
              
              <button
                onClick={handleCreateTherapist}
                disabled={savingTherapist}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
              >
                {savingTherapist ? (
                  <>
                    <Loader size={16} className="animate-spin ml-2" />
                    שומר...
                  </>
                ) : (
                  <>
                    <Save size={16} className="ml-2" />
                    {editingTherapist ? 'עדכן מטפל' : 'הוסף מטפל'}
                  </>
                )}
              </button>
            </div>
          </div>
        )}
        
        {therapists.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500 mb-4">אין מטפלים רשומים במערכת</p>
            <button
              onClick={() => setShowNewTherapistForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors inline-flex items-center"
            >
              <UserPlus size={16} className="ml-2" />
              הוסף מטפל ראשון
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 border-b text-right">שם מטפל</th>
                  <th className="py-2 px-4 border-b text-right">קוד גישה</th>
                  <th className="py-2 px-4 border-b text-right">הרשאות</th>
                  <th className="py-2 px-4 border-b text-right">מספר מטופלים</th>
                  <th className="py-2 px-4 border-b text-right">פעולות</th>
                </tr>
              </thead>
              <tbody>
                {therapists.map((therapist) => {
                  const clientCount = clients.filter(c => c.therapist_id === therapist.id).length;
                  const isAdmin = isAdminTherapist(therapist.code);
                  
                  return (
                    <tr key={therapist.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 border-b">{therapist.name}</td>
                      <td className="py-3 px-4 border-b font-mono">{therapist.code}</td>
                      <td className="py-3 px-4 border-b">
                        <span className={`px-2 py-1 rounded-full text-xs ${isAdmin ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                          {isAdmin ? 'מנהל מערכת' : 'מטפל'}
                        </span>
                      </td>
                      <td className="py-3 px-4 border-b">{clientCount}</td>
                      <td className="py-3 px-4 border-b">
                        <div className="flex space-x-2">
                          <button
                            style={{ display: isAdmin ? 'none' : 'block' }}
                            onClick={() => handleEditTherapist(therapist)}
                            className="p-1 text-amber-600 hover:text-amber-800"
                            title="ערוך מטפל"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            style={{ display: isAdmin ? 'none' : 'block' }}
                            onClick={() => handleDeleteTherapist(therapist.id)}
                            className="p-1 text-red-600 hover:text-red-800"
                            title="מחק מטפל"
                            disabled={clients.filter(c => c.therapist_id === therapist.id).length > 0}
                          >
                            <Trash2 size={18} className={clients.filter(c => c.therapist_id === therapist.id).length > 0 ? 'opacity-50' : ''} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Client Assignment Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6 max-w-4xl mx-auto">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">שיוך מטופלים למטפלים</h2>
        
        <div className="mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onPaste={(e) => {
              e.preventDefault();
              const pasteText = e.clipboardData.getData('text');
              setSearchQuery(pasteText);
            }}
            placeholder="חיפוש לפי שם או ת.ז של המטופל..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        {filteredClients.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">לא נמצאו מטופלים</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 border-b text-right">שם המטופל/ת</th>
                  <th className="py-2 px-4 border-b text-right">ת.ז</th>
                  <th className="py-2 px-4 border-b text-right">תאריך יצירה</th>
                  <th className="py-2 px-4 border-b text-right">מטפל נוכחי</th>
                  <th className="py-2 px-4 border-b text-right">שיוך למטפל</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 border-b">
                      {client.child_first_name} {client.child_last_name}
                    </td>
                    <td className="py-3 px-4 border-b">{client.id_number || 'לא צוין'}</td>
                    <td className="py-3 px-4 border-b">{formatDateToDDMMYYYY(client.created_at)}</td>
                    <td className="py-3 px-4 border-b">{getTherapistName(client.therapist_id)}</td>
                    <td className="py-3 px-4 border-b">
                      {updatingClient === client.id ? (
                        <div className="flex items-center">
                          <Loader size={18} className="animate-spin ml-2" />
                          <span className="text-sm text-gray-500">מעדכן...</span>
                        </div>
                      ) : (
                        <select
                          value={client.therapist_id || ''}
                          onChange={(e) => handleAssignClient(client.id, e.target.value)}
                          className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">בחר מטפל...</option>
                          {therapists.map(therapist => (
                            <option key={therapist.id} value={therapist.id}>
                              {therapist.name} {isAdminTherapist(therapist.code) ? '(מנהל מערכת)' : ''}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;