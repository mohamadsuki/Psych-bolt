import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { FormProvider } from './context/FormContext';
import { EvaluatorProvider } from './context/EvaluatorContext';
import { getCurrentTherapist, isAdmin } from './lib/auth';
import Navbar from './components/Navbar';

// Import smaller components normally
import SharedParentForm from './components/SharedParentForm';
import LoginPage from './components/LoginPage';

// Lazy-loaded components
const IntakeForm = lazy(() => import('./components/IntakeForm'));
const PsychologistForm = lazy(() => import('./components/PsychologistForm'));
const ClientSelection = lazy(() => import('./components/ClientSelection'));
const ReportGeneration = lazy(() => import('./components/ReportGeneration'));
const HomePage = lazy(() => import('./components/HomePage'));
const NewClientForm = lazy(() => import('./components/NewClientForm'));
const AdminPanel = lazy(() => import('./components/AdminPanel'));

// Loading spinner component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-t-teal-600 border-teal-200 border-solid rounded-full animate-spin"></div>
      <p className="mt-4 text-gray-600">טוען...</p>
    </div>
  </div>
);

function App() {
  const [activeSection, setActiveSection] = useState<'home' | 'parent' | 'evaluator' | 'clients' | 'reports' | 'new-client' | 'admin'>('home');
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  
  useEffect(() => {
    // Check authentication status on mount and path change
    const therapist = getCurrentTherapist();
    setIsLoggedIn(!!therapist);
    setIsInitializing(false);
    
    // Check URL params for client ID
    const searchParams = new URLSearchParams(location.search);
    const clientId = searchParams.get('clientId');
    if (clientId) {
      setSelectedClientId(clientId);
    }
  }, [location]);

  // Handle section changes
  const handleSectionChange = (section: 'home' | 'parent' | 'evaluator' | 'clients' | 'reports' | 'new-client' | 'admin', clientId?: string) => {
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

  // Check if we're on a shared form route
  const isSharedFormRoute = location.pathname.startsWith('/shared-form/');
  const isLoginRoute = location.pathname === '/login';

  // Don't show anything while initializing to prevent flashes of content
  if (isInitializing) {
    return <LoadingSpinner />;
  }

  // Full page routes (login, shared form) - no authentication required
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
  
  if (isLoginRoute) {
    // If already logged in, redirect to home
    if (isLoggedIn) {
      return <Navigate to="/" />;
    }
    return <LoginPage onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  // Protected routes - need authentication
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 rtl">
      <Navbar 
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
      />
      
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

      <Suspense fallback={<LoadingSpinner />}>
        {activeSection === 'home' && (
          <HomePage 
            onSelectClientsSection={() => handleSectionChange('clients')} 
            onSelectNewClientSection={() => handleSectionChange('new-client')}
            onSelectAdminSection={() => handleSectionChange('admin')}
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
        
        {activeSection === 'admin' && isAdmin() && (
          <AdminPanel />
        )}
      </Suspense>
      
      <Routes>
        <Route path="/login" element={<LoginPage onLoginSuccess={() => setIsLoggedIn(true)} />} />
        <Route path="/shared-form/:idNumber" element={
          <FormProvider>
            <SharedParentForm />
          </FormProvider>
        } />
      </Routes>
    </div>
  );
}

export default App;