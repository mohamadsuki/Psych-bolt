import { lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';

// Lazy load the main App component
const App = lazy(() => import('./App.tsx'));

// Loading component
const LoadingApp = () => (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center rtl">
    <div className="text-center">
      <div className="w-10 h-10 border-3 border-t-blue-600 border-blue-200 rounded-full animate-spin mx-auto mb-3"></div>
      <p className="text-gray-600 text-lg">טוען את המערכת...</p>
    </div>
  </div>
);
