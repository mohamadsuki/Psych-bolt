import React, { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { FormProvider } from './context/FormContext';
import { EvaluatorProvider } from './context/EvaluatorContext';
import IntakeForm from './components/IntakeForm';
import PsychologistForm from './components/PsychologistForm';
import ClientSelection from './components/ClientSelection';
import ReportGeneration from './components/ReportGeneration';
import HomePage from './components/HomePage';
import SharedParentForm from './components/SharedParentForm';
import NewClientForm from './components/NewClientForm';

function App() {
  const [activeSection, setActiveSection] = useState<'home' | 'parent' | 'evaluator' | 'clients' | 'reports' | 'new-client'>('home');
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  // Check if we're on a shared form route
  const isSharedFormRoute = location.pathname.startsWith('/shared-form');

  if (isSharedFormRoute) {
    return (
      <Routes>
        <Route path="/shared-form/:idNumber" element={
          <FormProvider>
            <SharedParentForm />
          </FormProvider>
        } />
      </Routes>
    );
  }

  const handleSectionChange = (section: 'home' | 'parent' | 'evaluator' | 'clients' | 'reports' | 'new-client', clientId?: string) => {
    setActiveSection(section);
    
    // Update URL params if client ID is provided
    if (clientId) {
      setSelectedClientId(clientId);
      navigate(`?clientId=${clientId}`);
    } else {
      setSelectedClientId(null);
      navigate('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 rtl">
      <div className="container mx-auto py-4 px-4">
        {activeSection !== 'home' && (
          <button
            onClick={() => handleSectionChange('home')}
            className="mb-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors flex items-center"
          >
            חזרה לדף הבית
          </button>
        )}
      </div>

      {activeSection === 'home' && (
        <HomePage 
          onSelectClientsSection={() => handleSectionChange('clients')} 
          onSelectNewClientSection={() => handleSectionChange('new-client')}
        />
      )}

      {activeSection === 'clients' && (
        <ClientSelection 
          onSelectParentForm={(clientId) => handleSectionChange('parent', clientId)}
          onSelectEvaluatorForm={(clientId) => handleSectionChange('evaluator', clientId)}
          onSelectReport={(clientId) => handleSectionChange('reports', clientId)}
          onBack={() => handleSectionChange('home')}
        />
      )}

      {activeSection === 'new-client' && (
        <NewClientForm
          onComplete={(clientId) => handleSectionChange('clients')}
          onBack={() => handleSectionChange('home')}
        />
      )}

      {activeSection === 'parent' && (
        <FormProvider>
          <IntakeForm 
            clientId={selectedClientId}
            onComplete={() => handleSectionChange('clients')} 
          />
        </FormProvider>
      )}

      {activeSection === 'evaluator' && (
        <EvaluatorProvider>
          <PsychologistForm 
            onComplete={() => handleSectionChange('reports', selectedClientId || undefined)} 
          />
        </EvaluatorProvider>
      )}

      {activeSection === 'reports' && (
        <ReportGeneration 
          clientId={selectedClientId}
          onBack={() => handleSectionChange('clients')} 
        />
      )}
    </div>
  );
}

export default App;