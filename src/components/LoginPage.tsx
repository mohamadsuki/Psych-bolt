import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkAuthCode } from '../lib/auth';
import { FileText, Users, Shield, AlertCircle, Loader, WifiOff } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess?: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [code, setCode] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [logoAnimationComplete, setLogoAnimationComplete] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const therapist = localStorage.getItem('therapist');
    if (therapist) {
      navigate('/');
      if (onLoginSuccess) onLoginSuccess();
    }

    // Simulate logo animation completion
    const timer = setTimeout(() => {
      setLogoAnimationComplete(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, [navigate, onLoginSuccess]);

  // Auto-retry on network status change
  useEffect(() => {
    const handleOnline = () => {
      if (error && code) {
        handleSubmit(null, true);
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [error, code]);

  const handleSubmit = async (e: React.FormEvent | null, isRetry = false) => {
    if (e) e.preventDefault();
    
    // Clear any previous errors
    setError(null);
    
    if (!code.trim()) {
      setError('נא להזין קוד גישה');
      return;
    }

    // Don't proceed if we're offline
    if (!navigator.onLine) {
      setError(
        <div className="flex items-center">
          <WifiOff size={18} className="ml-2 flex-shrink-0" />
          <span>אין חיבור לאינטרנט. נא לבדוק את החיבור ולנסות שוב.</span>
        </div>
      );
      return;
    }

    try {
      setLoading(true);
      
      const therapist = await checkAuthCode(code);
      
      if (therapist) {
        // Reset retry count on success
        setRetryCount(0);
        // Successfully authenticated - therapist data is already stored in localStorage
        if (onLoginSuccess) onLoginSuccess();
        navigate('/');
      } else {
        setError('קוד גישה שגוי, נא לנסות שוב');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      
      const isNetworkError = err.message?.includes('בעיית תקשורת');
      
      if (isNetworkError && retryCount < 3 && !isRetry) {
        // Increment retry count
        setRetryCount(prev => prev + 1);
        
        // Auto-retry with exponential backoff
        const delay = Math.min(1000 * Math.pow(2, retryCount), 5000);
        setTimeout(() => handleSubmit(null, true), delay);
      }
      
      setError(
        <div className="flex items-center">
          {isNetworkError && <WifiOff size={18} className="ml-2 flex-shrink-0" />}
          <span className="whitespace-pre-line">{err.message || 'שגיאה בהתחברות. נא לנסות שוב מאוחר יותר.'}</span>
        </div>
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteText = e.clipboardData.getData('text');
    setCode(pasteText);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white rtl p-4">
      <div className={`text-center mb-8 transition-opacity duration-500 ${logoAnimationComplete ? 'opacity-100' : 'opacity-0'}`}>
        <div className="inline-flex items-center justify-center p-3 bg-blue-600 text-white rounded-full mb-4">
          <FileText size={32} />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
          מערכת דיגיטלית לאבחון פסיכודידקטי
        </h1>
        <p className="text-gray-600 max-w-md mx-auto">
          פתרון פשוט ויעיל לאיסוף נתונים, הערכה ויצירת דוחות סטנדרטיים
        </p>
      </div>

      <div className={`bg-white p-8 rounded-lg shadow-lg w-full max-w-md transition-all duration-500 ${logoAnimationComplete ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4">
            <Shield size={24} />
          </div>
        </div>
        
        <h2 className="text-xl font-bold text-center mb-6">התחברות למערכת</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg flex items-start">
            {typeof error === 'string' ? (
              <>
                <AlertCircle className="ml-2 mt-0.5 flex-shrink-0" size={18} />
                <span>{error}</span>
              </>
            ) : (
              error
            )}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
              קוד גישה
            </label>
            <input
              type="text"
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onPaste={handlePaste}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="הזן את הקוד האישי שלך"
              disabled={loading}
              autoComplete="off"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader size={20} className="animate-spin ml-2" />
                {retryCount > 0 ? `מנסה להתחבר... (ניסיון ${retryCount}/3)` : 'מתחבר...'}
              </>
            ) : (
              'התחבר'
            )}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            קיבלת קוד גישה ממנהל המערכת?
          </p>
          <p className="text-xs text-gray-400 mt-1">
            אם אין ברשותך קוד גישה, פנה למנהל המערכת
          </p>
        </div>
      </div>
      
      <div className={`mt-8 text-center text-gray-500 text-sm transition-opacity duration-500 ${logoAnimationComplete ? 'opacity-100' : 'opacity-0'}`}>
        <p>© 2025 מערכת אבחון פסיכודידקטי. כל הזכויות שמורות.</p>
      </div>
    </div>
  );
};

export default LoginPage;