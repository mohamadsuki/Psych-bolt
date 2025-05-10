import React from 'react';
import { CheckCircle } from 'lucide-react';

const FormSubmitted: React.FC = () => {
  return (
    <div className="text-center py-8 animate-fadeIn">
      <div className="inline-flex items-center justify-center p-2 bg-green-100 text-green-600 rounded-full mb-4">
        <CheckCircle size={40} />
      </div>
      
      <h2 className="text-2xl font-bold mb-4 text-gray-800">השאלון נשלח בהצלחה!</h2>
      
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        תודה על מילוי השאלון. המידע שסיפקתם יסייע לנו להתכונן באופן מיטבי לאבחון.
        נציג מהצוות יצור איתכם קשר בהקדם לתיאום הפגישה.
      </p>
      
      <div className="bg-blue-50 p-4 rounded-lg text-blue-800 max-w-md mx-auto">
        <h3 className="font-medium mb-2">השלבים הבאים</h3>
        <ul className="text-right space-y-2">
          <li className="flex items-start">
            <span className="inline-block ml-2 mt-1">✓</span>
            <span>ממתינים לאישור השאלון על ידי הצוות המקצועי</span>
          </li>
          <li className="flex items-start">
            <span className="inline-block ml-2 mt-1">✓</span>
            <span>קביעת תאריך לפגישת אבחון</span>
          </li>
          <li className="flex items-start">
            <span className="inline-block ml-2 mt-1">✓</span>
            <span>השלמת תהליך האבחון</span>
          </li>
          <li className="flex items-start">
            <span className="inline-block ml-2 mt-1">✓</span>
            <span>קבלת דו״ח ופגישת סיכום</span>
          </li>
        </ul>
      </div>
      
      <p className="mt-8 text-gray-500 text-sm">
        לשאלות או בירורים, צרו קשר בטלפון: 03-1234567
      </p>
    </div>
  );
};

export default FormSubmitted;