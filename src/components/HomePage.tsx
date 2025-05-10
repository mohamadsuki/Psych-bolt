import React, { memo } from 'react';
import { FileText, Users, Search, Clock, List, Shield } from 'lucide-react';
import { isAdmin } from '../lib/auth';

interface HomePageProps {
  onSelectClientsSection: () => void;
  onSelectNewClientSection: () => void;
  onSelectAdminSection?: () => void;
}

// Memoize the HomePage component to prevent re-renders
const HomePage: React.FC<HomePageProps> = memo(({ 
  onSelectClientsSection, 
  onSelectNewClientSection,
  onSelectAdminSection
}) => {
  const userIsAdmin = isAdmin();

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold text-blue-600 mb-6">מערכת דיגיטלית לאבחון פסיכודידקטי</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          מערכת פשוטה ויעילה לאיסוף נתונים, הערכה ויצירת דוחות סטנדרטיים למאבחנים ופסיכולוגים
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 mb-16">
        <div className="bg-white rounded-lg shadow-md p-8 flex-1">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-6">איתור וניהול אבחונים</h2>
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                <Users size={32} />
              </div>
            </div>
            <p className="mb-6 text-gray-600">
              חיפוש מתופעל וניהול אבחונים קיימים
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center bg-gray-50 p-3 rounded-lg">
                <Search className="text-blue-500 ml-4" size={24} />
                <div className="text-right">
                  <h3 className="font-bold">חיפוש לפי תעודת זהות</h3>
                  <p className="text-sm text-gray-600">מצא אבחונים קיימים של מטופל ספציפי</p>
                </div>
              </div>
              
              <div className="flex items-center bg-gray-50 p-3 rounded-lg">
                <Clock className="text-blue-500 ml-4" size={24} />
                <div className="text-right">
                  <h3 className="font-bold">ניהול אבחונים קודמים</h3>
                  <p className="text-sm text-gray-600">צפה ועדכן אבחונים שמורים במערכת</p>
                </div>
              </div>
              
              <div className="flex items-center bg-gray-50 p-3 rounded-lg">
                <List className="text-blue-500 ml-4" size={24} />
                <div className="text-right">
                  <h3 className="font-bold">הצג רשימת מטופלים</h3>
                  <p className="text-sm text-gray-600">הצג את המטופלים המשויכים אליך</p>
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <button
                onClick={onSelectClientsSection}
                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors w-full"
              >
                הצג רשימת מטופלים
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 flex-1">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-6">טופס אבחון פסיכולוגי</h2>
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                <FileText size={32} />
              </div>
            </div>
            <p className="mb-6 text-gray-600">
              השלם תהליך אבחון פסיכודידקטי מלא
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center bg-gray-50 p-3 rounded-lg">
                <div className="text-blue-500 ml-4 font-bold">1</div>
                <div className="text-right">
                  <h3 className="font-bold">תצפית קלינית מובנית</h3>
                  <p className="text-sm text-gray-600">תיעוד ממצאי התצפית בפורמט מאורגן</p>
                </div>
              </div>
              
              <div className="flex items-center bg-gray-50 p-3 rounded-lg">
                <div className="text-blue-500 ml-4 font-bold">2</div>
                <div className="text-right">
                  <h3 className="font-bold">קידוד תוצאות מבחנים</h3>
                  <p className="text-sm text-gray-600">WISC, WPPSI, WRAT, ושאלונים נוספים</p>
                </div>
              </div>
              
              <div className="flex items-center bg-gray-50 p-3 rounded-lg">
                <div className="text-blue-500 ml-4 font-bold">3</div>
                <div className="text-right">
                  <h3 className="font-bold">אבחנה והמלצות</h3>
                  <p className="text-sm text-gray-600">הגדרת ממצאים בפורמט אחיד עם חתימה דיגיטלית</p>
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <button
                onClick={onSelectNewClientSection}
                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex justify-center items-center w-full"
              >
                <FileText size={18} className="ml-2" />
                התחל אבחון חדש
              </button>
            </div>
          </div>
        </div>
      </div>

      {userIsAdmin && onSelectAdminSection && (
        <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl mx-auto mb-16">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-6">ניהול מערכת</h2>
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                <Shield size={32} />
              </div>
            </div>
            <p className="mb-6 text-gray-600">
              הגדרות מתקדמות למנהלי המערכת
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center bg-gray-50 p-3 rounded-lg">
                <div className="ml-4 flex-shrink-0 text-purple-500">
                  <Users size={24} />
                </div>
                <div className="text-right">
                  <h3 className="font-bold">ניהול מטפלים</h3>
                  <p className="text-sm text-gray-600">הוספה, עריכה ומחיקה של מטפלים</p>
                </div>
              </div>
              
              <div className="flex items-center bg-gray-50 p-3 rounded-lg">
                <div className="ml-4 flex-shrink-0 text-purple-500">
                  <List size={24} />
                </div>
                <div className="text-right">
                  <h3 className="font-bold">שיוך מטופלים</h3>
                  <p className="text-sm text-gray-600">ניהול שיוך מטופלים למטפלים שונים</p>
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <button
                onClick={onSelectAdminSection}
                className="px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors w-full"
              >
                ניהול מטפלים ושיוכים
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-blue-50 p-8 rounded-lg">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">יתרונות המערכת</h2>
          <p className="text-gray-600 mb-8">
            פתרון מקיף לניהול תהליכי אבחון פסיכודידקטיים ודיווח
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-bold text-lg mb-2">חיסכון בזמן</h3>
              <p className="text-gray-600">קיצור זמן כתיבת דוחות ב-70% באמצעות תבניות ואוטומציה</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-bold text-lg mb-2">נגישות מלאה</h3>
              <p className="text-gray-600">גישה מכל מכשיר ומקום, שיתוף קל עם הורים וצוות חינוכי</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-bold text-lg mb-2">דוחות איכותיים</h3>
              <p className="text-gray-600">פורמט אחיד ומקצועי עם המלצות מפורטות המותאמות אישית</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default HomePage;