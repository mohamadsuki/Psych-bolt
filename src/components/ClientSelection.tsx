import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { getClients, deleteClientRecord, getParentIntake, getEvaluatorAssessment, getGeneratedReport } from '../lib/supabase';
import { Users, ClipboardList, FileText, FileOutput, Loader, Edit, Trash2, AlertCircle, Search, Share2, ArrowLeft, X, RefreshCw, Wifi } from 'lucide-react';
import EditClientModal from './modals/EditClientModal';
import ShareLinkModal from './modals/ShareLinkModal';
import { formatDateToDDMMYYYY, calculateAge } from '../utils/dateUtils';
import { getCurrentTherapist } from '../lib/auth';

interface Client {
  id: string;
  child_first_name: string;
  child_last_name: string;
  child_dob: string;
  parent_name: string;
  parent_phone: string;
  parent_email: string;
  id_number: string;
  created_at: string;
  therapist_id: string;
}

interface ClientStatus {
  id: string;
  hasParentIntake: boolean;
  hasParentIntakeInProgress: boolean;
  hasEvaluatorAssessment: boolean;
  hasEvaluatorAssessmentInProgress: boolean;
  hasReport: boolean;
}

interface ClientSelectionProps {
  onSelectParentForm: (clientId: string) => void;
  onSelectEvaluatorForm: (clientId: string) => void;
  onSelectReport: (clientId: string) => void;
  onBack?: () => void;
}

const ClientSelection: React.FC<ClientSelectionProps> = ({ 
  onSelectParentForm, 
  onSelectEvaluatorForm,
  onSelectReport,
  onBack
}) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [clientToShare, setClientToShare] = useState<Client | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [clientsStatus, setClientsStatus] = useState<Map<string, ClientStatus>>(new Map());
  const [retryCount, setRetryCount] = useState(0);
  const [isNetworkError, setIsNetworkError] = useState(false);
  
  // Track loading state for individual client statuses
  const [loadingClientStatuses, setLoadingClientStatuses] = useState<Set<string>>(new Set());
  
  // Track which clients failed to load status
  const [failedClientStatuses, setFailedClientStatuses] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchClients();
  }, [retryCount]);

  // Filter clients whenever search query or clients list changes
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

  // Sequential loading of client statuses with priority for visible ones
  useEffect(() => {
    if (filteredClients.length > 0) {
      // Process first 5 clients immediately (likely visible in viewport)
      loadClientStatuses(filteredClients.slice(0, 5));
      
      // Load remaining clients with a delay to prioritize visible content
      if (filteredClients.length > 5) {
        setTimeout(() => {
          loadClientStatuses(filteredClients.slice(5));
        }, 1000); 
      }
    }
  }, [filteredClients]);

  // Optimized client fetch
  const fetchClients = async () => {
    try {
      setLoading(true);
      setError(null);
      setIsNetworkError(false);
      
      const data = await getClients();
      setClients(data || []);
      setFilteredClients(data || []);
    } catch (err: any) {
      console.error('Error fetching clients:', err);
      
      // Handle network errors specially
      const isNetworkProblem = err.message?.includes('חיבור לאינטרנט') || 
                              err.message?.includes('Failed to fetch') ||
                              err.message?.includes('NetworkError') ||
                              err.message?.includes('Network Error') ||
                              !navigator.onLine;
      
      setIsNetworkError(isNetworkProblem);
      
      if (isNetworkProblem) {
        setError('בעיית חיבור לשרת. אנא בדוק את החיבור לאינטרנט שלך.');
      } else {
        setError(`שגיאה בטעינת רשימת המטופלים: ${err.message || 'אנא נסה שוב.'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Load statuses for a list of clients one at a time with improved error handling
  const loadClientStatuses = async (clientsToLoad: Client[]) => {
    if (clientsToLoad.length === 0) return;
    
    // Process one client at a time to avoid overwhelming the network
    for (const client of clientsToLoad) {
      // Skip if already loading or already has status (and didn't fail)
      if (loadingClientStatuses.has(client.id) || 
          (clientsStatus.has(client.id) && !failedClientStatuses.has(client.id))) {
        continue;
      }
      
      // Mark this client as loading
      setLoadingClientStatuses(prev => {
        const newSet = new Set(prev);
        newSet.add(client.id);
        return newSet;
      });
      
      try {
        // Fetch parent intake status - handle errors within each step
        let parentIntake = null;
        let isParentSubmitted = false;
        let isParentInProgress = false;
        
        try {
          parentIntake = await getParentIntake(client.id);
          isParentSubmitted = parentIntake && parentIntake.submitted_at;
          isParentInProgress = parentIntake && parentIntake.form_data && !isParentSubmitted;
        } catch (err) {
          console.warn(`Error loading parent intake status for client ${client.id}:`, err);
          // Continue with other status checks even if this one fails
        }
        
        // Only fetch evaluator status if needed
        let evaluatorAssessment = null;
        let isEvaluatorSubmitted = false;
        let isEvaluatorInProgress = false;
        
        try {
          evaluatorAssessment = await getEvaluatorAssessment(client.id);
          isEvaluatorSubmitted = evaluatorAssessment && evaluatorAssessment.submitted_at;
          isEvaluatorInProgress = evaluatorAssessment && evaluatorAssessment.evaluator_data && !isEvaluatorSubmitted;
        } catch (err) {
          console.warn(`Error loading evaluator status for client ${client.id}:`, err);
          // Continue with report check even if evaluator assessment fails
        }
        
        // Only fetch report if we've successfully completed the previous steps
        let report = null;
        try {
          report = await getGeneratedReport(client.id);
        } catch (err) {
          console.warn(`Error loading report status for client ${client.id}:`, err);
        }
        
        // Update the client status with whatever data we successfully retrieved
        setClientsStatus(prev => {
          const newMap = new Map(prev);
          newMap.set(client.id, {
            id: client.id,
            hasParentIntake: !!isParentSubmitted,
            hasParentIntakeInProgress: !!isParentInProgress,
            hasEvaluatorAssessment: !!isEvaluatorSubmitted,
            hasEvaluatorAssessmentInProgress: !!isEvaluatorInProgress,
            hasReport: !!report
          });
          return newMap;
        });
        
        // Clear from failed statuses if it was there
        if (failedClientStatuses.has(client.id)) {
          setFailedClientStatuses(prev => {
            const newSet = new Set(prev);
            newSet.delete(client.id);
            return newSet;
          });
        }
      } catch (err) {
        console.error(`Error loading status for client ${client.id}:`, err);
        
        // Mark as failed for retry
        setFailedClientStatuses(prev => {
          const newSet = new Set(prev);
          newSet.add(client.id);
          return newSet;
        });
      } finally {
        // Remove from loading set
        setLoadingClientStatuses(prev => {
          const newSet = new Set(prev);
          newSet.delete(client.id);
          return newSet;
        });
      }
      
      // Add a small delay between client status requests to avoid overwhelming the network
      await new Promise(r => setTimeout(r, 100));
    }
  };

  // Get status for a client
  const getClientStatus = (clientId: string) => {
    return clientsStatus.get(clientId) || {
      hasParentIntake: false,
      hasParentIntakeInProgress: false,
      hasEvaluatorAssessment: false,
      hasEvaluatorAssessmentInProgress: false,
      hasReport: false
    };
  };

  const handleEditClient = (client: Client) => {
    setClientToEdit(client);
    setShowEditModal(true);
  };

  const handleEditComplete = (success: boolean) => {
    setShowEditModal(false);
    setClientToEdit(null);
    if (success) {
      fetchClients(); // Refresh the client list
    }
  };

  const handleDeleteConfirmation = (client: Client) => {
    setClientToDelete(client);
    setShowDeleteConfirmation(true);
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirmation(false);
    setClientToDelete(null);
  };

  const handleDeleteClient = async () => {
    if (!clientToDelete) return;
    
    try {
      setDeleteLoading(true);
      await deleteClientRecord(clientToDelete.id);
      setClients(clients.filter(c => c.id !== clientToDelete.id));
      setFilteredClients(filteredClients.filter(c => c.id !== clientToDelete.id));
      setShowDeleteConfirmation(false);
      setClientToDelete(null);
    } catch (err: any) {
      console.error('Error deleting client:', err);
      setError(`שגיאה במחיקת המטופל: ${err.message || 'אנא נסה שוב.'}`);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleShareForm = (client: Client) => {
    setClientToShare(client);
    setShowShareModal(true);
  };

  const handleShareComplete = () => {
    setShowShareModal(false);
    setClientToShare(null);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    // Also clear failed statuses to retry all client statuses
    setFailedClientStatuses(new Set());
    setClientsStatus(new Map());
  };

  // Handle retry for an individual client status
  const handleRetryClientStatus = (clientId: string) => {
    // Set loading for just this client
    setLoadingClientStatuses(prev => {
      const newSet = new Set(prev);
      newSet.add(clientId);
      return newSet;
    });
    
    // Remove from failed set
    setFailedClientStatuses(prev => {
      const newSet = new Set(prev);
      newSet.delete(clientId);
      return newSet;
    });
    
    // Find the client and load its status
    const client = clients.find(c => c.id === clientId);
    if (client) {
      loadClientStatuses([client]);
    }
  };

  // Get current therapist info
  const therapist = getCurrentTherapist();
  const isTherapistView = therapist && !therapist.is_admin;

  // Check if browser is offline
  const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <Loader className="animate-spin w-10 h-10 mx-auto mb-4 text-teal-600" />
        <p className="text-gray-600">טוען רשימת מטופלים...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        {isNetworkError || isOffline ? (
          <Wifi className="w-10 h-10 mx-auto mb-4 text-red-600" />
        ) : (
          <AlertCircle className="w-10 h-10 mx-auto mb-4 text-red-600" />
        )}
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={handleRetry}
          className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors flex items-center mx-auto"
        >
          <RefreshCw size={16} className="ml-2" />
          נסה שנית
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {isOffline && (
        <div className="bg-red-50 text-red-800 px-4 py-3 rounded-md flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Wifi className="text-red-600 mr-2" size={20} />
            <span className="font-medium">אין חיבור לאינטרנט. המידע המוצג עשוי להיות לא מעודכן.</span>
          </div>
          <button 
            onClick={handleRetry}
            className="bg-red-100 text-red-800 px-3 py-1 rounded-md hover:bg-red-200 flex items-center"
          >
            <RefreshCw size={14} className="ml-1" />
            נסה להתחבר מחדש
          </button>
        </div>
      )}
      
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center p-2 bg-teal-600 text-white rounded-full mb-3">
          <Users size={24} />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">רשימת מטופלים</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          {isTherapistView ? 
            "בחר מטופל מרשימת המטופלים המשויכים אליך" : 
            "בחר מטופל קיים לעריכה או יצירת דוח, או הוסף מטופל חדש"}
        </p>
        {isTherapistView && therapist && (
          <div className="mt-2 inline-block bg-blue-50 px-3 py-1 rounded text-blue-700">
            מציג מטופלים המשויכים ל: {therapist.name}
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6 max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">מטופלים</h2>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="חיפוש לפי שם או ת.ז..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-64 py-2 pr-10 pl-4 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
              {searchQuery && (
                <button 
                  onClick={clearSearch}
                  className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            
            {onBack && (
              <button 
                onClick={onBack}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors flex items-center"
              >
                <ArrowLeft size={16} className="ml-2" />
                חזרה לדף הבית
              </button>
            )}
          </div>
        </div>

        {filteredClients.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            {searchQuery ? (
              <p className="text-gray-500 mb-4">לא נמצאו מטופלים התואמים את החיפוש "{searchQuery}"</p>
            ) : (
              <p className="text-gray-500 mb-4">אין מטופלים במערכת כרגע.</p>
            )}
            {onBack && (
              <button 
                onClick={onBack}
                className="px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
              >
                חזרה לדף הבית
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 border-b text-right">ת.ז</th>
                  <th className="py-2 px-4 border-b text-right">שם המטופל/ת</th>
                  <th className="py-2 px-4 border-b text-right">גיל</th>
                  <th className="py-2 px-4 border-b text-right">תאריך יצירה</th>
                  <th className="py-2 px-4 border-b text-right">סטטוס</th>
                  <th className="py-2 px-4 border-b text-right">פעולות</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client) => {
                  const status = getClientStatus(client.id);
                  const isStatusLoading = loadingClientStatuses.has(client.id);
                  const hasStatusFailed = failedClientStatuses.has(client.id);
                  
                  return (
                    <tr key={client.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 border-b">
                        {client.id_number || 'לא צוין'}
                      </td>
                      <td className="py-3 px-4 border-b">
                        {client.child_first_name} {client.child_last_name}
                      </td>
                      <td className="py-3 px-4 border-b">
                        {calculateAge(client.child_dob)}
                      </td>
                      <td className="py-3 px-4 border-b">{formatDateToDDMMYYYY(client.created_at)}</td>
                      <td className="py-3 px-4 border-b">
                        {isStatusLoading ? (
                          <div className="flex items-center">
                            <Loader className="animate-spin w-4 h-4 text-gray-500 ml-2" />
                            <span className="text-xs text-gray-500">טוען...</span>
                          </div>
                        ) : hasStatusFailed ? (
                          <div className="flex items-center">
                            <button 
                              onClick={() => handleRetryClientStatus(client.id)}
                              className="flex items-center text-xs text-blue-600 hover:text-blue-800"
                            >
                              <RefreshCw size={12} className="ml-1" />
                              <span>רענן סטטוס</span>
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <div className="flex items-center" 
                                title={
                                  status.hasParentIntake ? "שאלון הורים הוגש ונשלח" : 
                                  status.hasParentIntakeInProgress ? "שאלון הורים החל למלא, אך לא הוגש" : 
                                  "שאלון הורים טרם החל למלא"
                                }>
                              <div className={`w-3 h-3 rounded-full ${
                                status.hasParentIntake ? 'bg-green-500' : 
                                status.hasParentIntakeInProgress ? 'bg-blue-500' : 
                                'bg-gray-300'
                              } ml-1`}></div>
                              <span className="text-xs">הורים</span>
                            </div>
                            <div className="flex items-center" 
                                title={
                                  status.hasEvaluatorAssessment ? "שאלון מאבחן הוגש ונשלח" : 
                                  status.hasEvaluatorAssessmentInProgress ? "שאלון מאבחן החל למלא, אך לא הוגש" : 
                                  "שאלון מאבחן טרם החל למלא"
                                }>
                              <div className={`w-3 h-3 rounded-full ${
                                status.hasEvaluatorAssessment ? 'bg-green-500' : 
                                status.hasEvaluatorAssessmentInProgress ? 'bg-blue-500' : 
                                'bg-gray-300'
                              } ml-1`}></div>
                              <span className="text-xs">מאבחן</span>
                            </div>
                            <div className="flex items-center" 
                                title={status.hasReport ? "דוח נוצר" : "דוח טרם נוצר"}>
                              <div className={`w-3 h-3 rounded-full ${status.hasReport ? 'bg-green-500' : 'bg-gray-300'} ml-1`}></div>
                              <span className="text-xs">דוח</span>
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 border-b">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => onSelectParentForm(client.id)}
                            className="p-1 text-blue-600 hover:text-blue-800 ml-2"
                            title="שאלון הורים"
                          >
                            <ClipboardList size={20} />
                          </button>
                          <button
                            onClick={() => onSelectEvaluatorForm(client.id)}
                            className="p-1 text-green-600 hover:text-green-800 ml-2"
                            title="שאלון מאבחן"
                          >
                            <FileText size={20} />
                          </button>
                          <button
                            onClick={() => onSelectReport(client.id)}
                            className="p-1 text-purple-600 hover:text-purple-800 ml-2"
                            title="צור/צפה בדוח"
                          >
                            <FileOutput size={20} />
                          </button>
                          <button
                            onClick={() => handleShareForm(client)}
                            className="p-1 text-indigo-600 hover:text-indigo-800 ml-2"
                            title="שתף טופס הורים"
                          >
                            <Share2 size={18} />
                          </button>
                          <button
                            onClick={() => handleEditClient(client)}
                            className="p-1 text-amber-600 hover:text-amber-800 ml-2"
                            title="ערוך פרטי מטופל"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteConfirmation(client)}
                            className="p-1 text-red-600 hover:text-red-800"
                            title="מחק מטופל"
                          >
                            <Trash2 size={18} />
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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmation && clientToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="mb-4 flex items-center">
              <AlertCircle size={24} className="text-red-500 ml-2" />
              <h2 className="text-xl font-bold text-gray-800">אישור מחיקה</h2>
            </div>
            <p className="mb-6 text-gray-600">
              האם אתה בטוח שברצונך למחוק את המטופל{' '}
              <span className="font-bold">
                {clientToDelete.child_first_name} {clientToDelete.child_last_name}
              </span>
              ? פעולה זו תמחק גם את כל הנתונים המשויכים למטופל ואינה ניתנת לביטול.
            </p>
            <div className="flex justify-end space-x-3 space-x-reverse">
              <button 
                onClick={handleDeleteCancel} 
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                disabled={deleteLoading}
              >
                ביטול
              </button>
              <button 
                onClick={handleDeleteClient} 
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
                disabled={deleteLoading}
              >
                {deleteLoading ? (
                  <>
                    <Loader size={16} className="animate-spin ml-2" />
                    מוחק...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} className="ml-2" />
                    מחק מטופל
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Client Modal */}
      {showEditModal && clientToEdit && (
        <EditClientModal
          client={clientToEdit}
          onClose={(success) => handleEditComplete(success)}
        />
      )}

      {/* Share Form Modal */}
      {showShareModal && clientToShare && (
        <ShareLinkModal
          client={clientToShare}
          onClose={handleShareComplete}
        />
      )}
    </div>
  );
};

export default React.memo(ClientSelection);