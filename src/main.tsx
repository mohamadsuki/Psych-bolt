import { lazy, Suspense, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';

// Lazy load the main App component
const App = lazy(() => import('./App.tsx'));

// Polyfill for global required by html-to-docx
window.global = window;

// Loading component
const LoadingApp = () => (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center rtl">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-t-blue-600 border-b-blue-600 border-r-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-600 text-lg">טוען את המערכת...</p>
    </div>
  </div>
);

// Register service worker
const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    // Defer service worker registration to not block initial render
    setTimeout(() => {
      navigator.serviceWorker.register('/serviceWorker.js')
        .then(registration => {
          console.log('ServiceWorker registration successful:', registration.scope);
        })
        .catch(error => {
          console.log('ServiceWorker registration failed:', error);
        });
    }, 2000); // Delay by 2 seconds
  }
};

// Add offline detection
const setupOfflineDetection = () => {
  window.addEventListener('online', () => {
    console.log('Network status: online');
    document.body.classList.remove('offline-mode');
  });
  
  window.addEventListener('offline', () => {
    console.log('Network status: offline');
    document.body.classList.add('offline-mode');
  });
};

// Error handling for unexpected errors during rendering
const renderApp = () => {
  try {
    // Register service worker - deferred
    registerServiceWorker();
    
    // Setup offline detection
    setupOfflineDetection();
    
    // Create and mount the root component
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <BrowserRouter>
          <Suspense fallback={<LoadingApp />}>
            <App />
          </Suspense>
        </BrowserRouter>
      </StrictMode>
    );
  } catch (error) {
    console.error('Error rendering application:', error);
    
    // Show a helpful error message if rendering fails
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="font-family: system-ui, -apple-system, sans-serif; padding: 20px; text-align: center; direction: rtl;">
          <h2 style="color: #e11d48;">שגיאה בטעינת האפליקציה</h2>
          <p style="margin-bottom: 15px;">אירעה שגיאה בלתי צפויה בעת טעינת האפליקציה.</p>
          <button 
            onclick="window.location.reload()" 
            style="background-color: #0284c7; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;"
          >
            נסה שוב
          </button>
          <p style="margin-top: 15px; font-size: 14px; color: #64748b;">
            מידע טכני: ${error instanceof Error ? error.message : 'Unknown error'}
          </p>
        </div>
      `;
    }
  }
};

renderApp();