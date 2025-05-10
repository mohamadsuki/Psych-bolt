import React, { useState, useEffect, useCallback } from 'react';
import { getClientById, getParentIntake, getEvaluatorAssessment, getGeneratedReport, saveGeneratedReport } from '../lib/supabase';
import { generateReport } from '../lib/openai';
import { ArrowLeft, FileText, Loader, RefreshCw, Download, File } from 'lucide-react';
import { formatDateToDDMMYYYY } from '../utils/dateUtils';
import { saveAs } from 'file-saver';
import HTMLtoDOCX from 'html-to-docx';

interface ReportGenerationProps {
  onBack: () => void;
  clientId?: string | null;
}

// We'll use React.lazy and Suspense to defer loading of the report content
const LazyReportContent = React.lazy(() => import('./ReportContent'));

const ReportGeneration: React.FC<ReportGenerationProps> = ({ onBack, clientId }) => {
  const [localClientId, setLocalClientId] = useState<string | null>(null);
  const [clientInfo, setClientInfo] = useState<any>(null);
  const [parentIntake, setParentIntake] = useState<any>(null);
  const [evaluatorAssessment, setEvaluatorAssessment] = useState<any>(null);
  const [generatedReport, setGeneratedReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exportingDocx, setExportingDocx] = useState(false);
  const [loadingInitialData, setLoadingInitialData] = useState(true); // Add a specific state for initial loading
  
  // Initialize with client ID from props or URL
  useEffect(() => {
    // First check props
    if (clientId) {
      setLocalClientId(clientId);
      loadClientData(clientId);
    } else {
      // Otherwise check URL
      const urlParams = new URLSearchParams(window.location.search);
      const id = urlParams.get('clientId');
      
      if (id) {
        setLocalClientId(id);
        loadClientData(id);
      } else {
        setLoadingInitialData(false);
      }
    }
  }, [clientId]);

  // Use useCallback to memoize the loadClientData function
  const loadClientData = useCallback(async (id: string) => {
    try {
      setLoadingInitialData(true);
      setLoading(true);
      setError(null);
      
      // Load data in parallel for better performance
      const [client, intake, assessment, report] = await Promise.all([
        getClientById(id),
        getParentIntake(id),
        getEvaluatorAssessment(id),
        getGeneratedReport(id)
      ]);
      
      setClientInfo(client);
      setParentIntake(intake?.form_data || null);
      setEvaluatorAssessment(assessment?.evaluator_data || null);
      setGeneratedReport(report || null);
      
    } catch (err) {
      console.error('Failed to load client data:', err);
      setError('Failed to load client data. Please try again.');
    } finally {
      setLoading(false);
      setLoadingInitialData(false);
    }
  }, []);

  const handleGenerateReport = useCallback(async () => {
    if (!localClientId) {
      setError('לא נבחר מטופל. יש לבחור מטופל מרשימת המטופלים.');
      return;
    }
    
    if (!parentIntake) {
      setError('חסר מידע משאלון ההורים. יש למלא את שאלון ההורים לפני יצירת הדוח.');
      return;
    }
    
    if (!evaluatorAssessment) {
      setError('חסר מידע מהערכת המאבחן. יש למלא את טופס המאבחן לפני יצירת הדוח.');
      return;
    }
    
    try {
      // Always reload the latest data when generating a report
      setGenerating(true);
      setError(null);
      
      // Reload the latest parent intake and evaluator assessment data
      const freshIntake = await getParentIntake(localClientId);
      const freshAssessment = await getEvaluatorAssessment(localClientId);
      
      // Update state with fresh data
      const freshIntakeData = freshIntake?.form_data || null;
      const freshAssessmentData = freshAssessment?.evaluator_data || null;
      
      setParentIntake(freshIntakeData);
      setEvaluatorAssessment(freshAssessmentData);
      
      const clientData = {
        childFirstName: clientInfo.child_first_name,
        childLastName: clientInfo.child_last_name,
        childDob: clientInfo.child_dob,
        parentName: clientInfo.parent_name,
        idNumber: clientInfo.id_number || '',
        gender: freshIntakeData?.child?.gender || 'male' // Include gender for proper text formatting
      };
      
      // Generate the report using OpenAI or mock data
      const result = await generateReport({
        clientInfo: clientData,
        parentIntake: freshIntakeData,
        evaluatorAssessment: freshAssessmentData
      });
      
      // Save the generated report to the database
      const savedReport = await saveGeneratedReport(
        localClientId,
        result.reportContent,
        result.recommendations
      );
      
      // Update the UI with the generated report
      setGeneratedReport(savedReport);
      
    } catch (err) {
      console.error('Error generating report:', err);
      setError('Failed to generate report. Please try again later.');
    } finally {
      setGenerating(false);
    }
  }, [localClientId, parentIntake, evaluatorAssessment, clientInfo]);

  const handlePrint = () => {
    window.print();
  };
  
  const handleExportDocx = useCallback(async () => {
    if (!generatedReport || !clientInfo) return;
    
    try {
      setExportingDocx(true);
      
      // Add RTL attributes to the report container before export
      const reportEl = document.getElementById('reportContent');
      
      if (!reportEl) {
        throw new Error('Report element not found');
      }
      
      // Add enhanced RTL attributes
      reportEl.setAttribute('dir', 'rtl');
      reportEl.style.direction = 'rtl';
      reportEl.style.textAlign = 'right';
      
      // Modify all paragraphs and headings to ensure RTL
      const elements = reportEl.querySelectorAll('p, h1, h2, h3, h4, div, span');
      elements.forEach(el => {
        (el as HTMLElement).style.direction = 'rtl';
        (el as HTMLElement).style.textAlign = 'right';
        (el as HTMLElement).setAttribute('dir', 'rtl');
      });
      
      // Enhanced RTL styles for docx export
      const rtlStyles = `
        @page WordSection1 {
          mso-mirror-margins: yes;
          margin-top: 1in;
          margin-right: 1in;
          margin-bottom: 1in;
          margin-left: 1in;
          mso-header-margin: 0.5in;
          mso-footer-margin: 0.5in;
          mso-paper-source: 0;
        }
        div.WordSection1 { page: WordSection1; }
        body, p, div, h1, h2, h3, h4, h5, h6, span, table, td, th {
          direction: rtl !important;
          text-align: right !important;
          unicode-bidi: embed !important;
          font-family: "David", "Arial", sans-serif !important;
        }
        * {
          direction: rtl !important;
        }
        .recommendation {
          text-align: justify !important;
          direction: rtl !important;
        }
      `;
      
      // Prepare the HTML with enhanced RTL markup
      const reportHtml = `
        <html dir="rtl">
        <head>
          <meta charset="UTF-8">
          <style>
            ${rtlStyles}
          </style>
        </head>
        <body dir="rtl" style="direction: rtl; text-align: right;">
          ${reportEl.outerHTML}
        </body>
        </html>
      `;
      
      // Use html-to-docx to convert HTML to DOCX with enhanced RTL settings
      const blob = await HTMLtoDOCX(reportHtml, null, {
        title: `חוות דעת פסיכודידקטית - ${clientInfo.child_first_name} ${clientInfo.child_last_name}`,
        margin: {
          top: '1in',
          right: '1in',
          bottom: '1in',
          left: '1in',
        },
        orientation: 'portrait',
        language: 'he-IL',
        direction: 'rtl',
        styles: rtlStyles,
        table: { row: { cantSplit: true } },
        displayBid: 'rtl',
        font: 'David'
      });
      
      // Save the docx file
      saveAs(blob, `דוח_${clientInfo.child_first_name}_${clientInfo.child_last_name}.docx`);
    } catch (err) {
      console.error('Error exporting to DOCX:', err);
      setError('שגיאה בייצוא לקובץ Word. נסה שוב מאוחר יותר.');
    } finally {
      setExportingDocx(false);
    }
  }, [generatedReport, clientInfo]);

  if (loadingInitialData) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <Loader className="animate-spin w-10 h-10 mx-auto mb-4 text-teal-600" />
        <p className="text-gray-600">טוען נתוני מטופל...</p>
      </div>
    );
  }

  if (!localClientId || !clientInfo) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="bg-yellow-50 p-6 rounded-lg max-w-md mx-auto">
          <p className="text-yellow-700 mb-4">יש לבחור מטופל כדי ליצור או לצפות בדוח</p>
          <button 
            onClick={onBack}
            className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors flex items-center mx-auto"
          >
            <ArrowLeft size={16} className="ml-2" />
            חזרה לרשימת המטופלים
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center p-2 bg-teal-600 text-white rounded-full mb-3">
          <FileText size={24} />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">יצירת דוח אבחון פסיכולוגי</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          המערכת תנתח את נתוני הערכת ההורים והמאבחן ותייצר דוח מקצועי מקיף באמצעות בינה מלאכותית.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6 max-w-5xl mx-auto">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">פרטי מטופל</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
            <div>
              <p className="text-gray-600">שם המטופל/ת:</p>
              <p className="font-semibold">{clientInfo.child_first_name} {clientInfo.child_last_name}</p>
            </div>
            <div>
              <p className="text-gray-600">תאריך לידה:</p>
              <p className="font-semibold">{formatDateToDDMMYYYY(clientInfo.child_dob)}</p>
            </div>
            <div>
              <p className="text-gray-600">שם ההורה:</p>
              <p className="font-semibold">{clientInfo.parent_name}</p>
            </div>
            <div>
              <p className="text-gray-600">מספר תעודת זהות:</p>
              <p className="font-semibold">{clientInfo.id_number || 'לא צוין'}</p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">סטטוס מידע</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`p-4 rounded-lg ${parentIntake ? 'bg-green-50' : 'bg-yellow-50'}`}>
              <div className="flex items-center mb-2">
                <div className={`w-3 h-3 rounded-full mr-2 ${parentIntake ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                <h3 className="font-medium">שאלון הורים</h3>
              </div>
              <p className="text-sm">
                {parentIntake ? 'מולא' : 'טרם מולא - נדרש למילוי לפני יצירת דוח'}
              </p>
            </div>
            
            <div className={`p-4 rounded-lg ${evaluatorAssessment ? 'bg-green-50' : 'bg-yellow-50'}`}>
              <div className="flex items-center mb-2">
                <div className={`w-3 h-3 rounded-full mr-2 ${evaluatorAssessment ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                <h3 className="font-medium">שאלון מאבחן</h3>
              </div>
              <p className="text-sm">
                {evaluatorAssessment ? 'מולא' : 'טרם מולא - נדרש למילוי לפני יצירת דוח'}
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 p-4 rounded-lg mb-6 text-red-700">
            {error}
          </div>
        )}

        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 md:space-x-reverse mb-8 justify-between">
          <button 
            onClick={onBack}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center justify-center"
          >
            <ArrowLeft size={16} className="ml-2" />
            חזרה לרשימת המטופלים
          </button>
          
          <div className="flex space-x-2 space-x-reverse">
            {generatedReport && (
              <>
                <button 
                  onClick={handlePrint}
                  disabled={!generatedReport}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center disabled:bg-gray-400"
                >
                  <Download size={16} className="ml-2" />
                  שמירה כPDF
                </button>
                <button 
                  onClick={handleExportDocx}
                  disabled={!generatedReport || exportingDocx}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center justify-center disabled:bg-gray-400"
                >
                  {exportingDocx ? (
                    <><Loader size={16} className="ml-2 animate-spin" /> מייצא...</>
                  ) : (
                    <><File size={16} className="ml-2" /> שמירה כ-DOCX</>
                  )}
                </button>
              </>
            )}
          
            <button 
              onClick={handleGenerateReport}
              disabled={!parentIntake || !evaluatorAssessment || generating}
              className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors flex items-center justify-center disabled:bg-gray-400"
            >
              {generating ? (
                <><RefreshCw size={16} className="ml-2 animate-spin" /> מייצר דוח...</>
              ) : generatedReport ? (
                <><RefreshCw size={16} className="ml-2" /> צור דוח מחדש</>
              ) : (
                <><FileText size={16} className="ml-2" /> צור דוח</>
              )}
            </button>
          </div>
        </div>

        {generatedReport && (
          <React.Suspense fallback={
            <div className="bg-white border border-gray-200 p-8 rounded-lg text-center">
              <Loader className="animate-spin w-8 h-8 mx-auto mb-4 text-teal-600" />
              <p className="text-gray-600">טוען את הדוח...</p>
            </div>
          }>
            <LazyReportContent 
              reportContent={generatedReport.report_content}
              recommendations={generatedReport.recommendations_school}
              recommendationsParents={generatedReport.recommendations_parents}
              clientInfo={clientInfo}
              evaluatorAssessment={evaluatorAssessment}
            />
          </React.Suspense>
        )}
      </div>
    </div>
  );
};

export default React.memo(ReportGeneration);