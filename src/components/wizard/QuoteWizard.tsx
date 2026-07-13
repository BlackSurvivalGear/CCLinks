import { useState } from 'react';
import { Quote, BOQItem, QuoteSummary, AppSettings, PaymentScheduleItem } from '../../types';
import ProjectDetailsStep from './ProjectDetailsStep';
import BoqUploadStep from './BoqUploadStep';
import BoqAnalysisStep from './BoqAnalysisStep';
import CostEditorStep from './CostEditorStep';
import CostSummaryStep from './CostSummaryStep';
import GenerateQuoteStep from './GenerateQuoteStep';
import ExportStep from './ExportStep';
import { ChevronRight, ArrowLeft } from 'lucide-react';

interface QuoteWizardProps {
  settings: AppSettings;
  onSaveQuote: (quote: Quote) => Promise<void>;
  onClose: () => void;
  editQuoteData?: Quote | null;
}

const WIZARD_STEPS_LABELS = [
  'Project details',
  'Upload BOQ',
  'AI Parsing',
  'Cost editor',
  'Markup summary',
  'Draft proposal',
  'Export & Save'
];

export default function QuoteWizard({ settings, onSaveQuote, onClose, editQuoteData }: QuoteWizardProps) {
  // If editing an existing quote, start at the Cost Editor (Step 4) or Project Details
  const [step, setStep] = useState<number>(editQuoteData ? 4 : 1);

  // Wizard-wide state
  const [projectDetails, setProjectDetails] = useState<Partial<Quote>>(
    editQuoteData
      ? {
          projectName: editQuoteData.projectName,
          clientName: editQuoteData.clientName,
          companyName: editQuoteData.companyName,
          siteAddress: editQuoteData.siteAddress,
          reference: editQuoteData.reference,
          date: editQuoteData.date,
        }
      : {}
  );

  const [pdfData, setPdfData] = useState<{ fileName: string; dataUrl: string } | null>(
    editQuoteData ? { fileName: editQuoteData.pdfFileName || 'Extracted_BOQ.pdf', dataUrl: editQuoteData.pdfDataUrl || '' } : null
  );

  const [boqItems, setBoqItems] = useState<BOQItem[]>(editQuoteData ? editQuoteData.items : []);
  const [summary, setSummary] = useState<QuoteSummary>(
    editQuoteData
      ? editQuoteData.summary
      : {
          materialTotal: 0,
          labourTotal: 0,
          subtotal: 0,
          overheadPercent: settings.defaultOverheadPercent,
          overheadTotal: 0,
          profitPercent: settings.defaultProfitPercent,
          profitTotal: 0,
          vatPercent: settings.defaultVatPercent,
          vatTotal: 0,
          grandTotal: 0
        }
  );

  const [finalDoc, setFinalDoc] = useState<{
    scopeOfWorks: string;
    termsAndConditions: string;
    paymentSchedule: PaymentScheduleItem[];
  } | null>(
    editQuoteData
      ? {
          scopeOfWorks: editQuoteData.scopeOfWorks,
          termsAndConditions: editQuoteData.termsAndConditions,
          paymentSchedule: editQuoteData.paymentSchedule,
        }
      : null
  );

  // Handlers for step submissions
  const handleStep1Submit = (details: Partial<Quote>) => {
    setProjectDetails(details);
    setStep(2);
  };

  const handleStep2Submit = (fileMeta: { fileName: string; dataUrl: string }) => {
    setPdfData(fileMeta);
    setStep(3);
  };

  const handleStep3Submit = (items: BOQItem[]) => {
    setBoqItems(items);
    setStep(4);
  };

  const handleStep4Submit = () => {
    setStep(5);
  };

  const handleStep5Submit = (summaryData: QuoteSummary) => {
    setSummary(summaryData);
    setStep(6);
  };

  const handleStep6Submit = (docData: {
    scopeOfWorks: string;
    termsAndConditions: string;
    paymentSchedule: PaymentScheduleItem[];
  }) => {
    setFinalDoc(docData);
    setStep(7);
  };

  const handleSaveToDatabase = async () => {
    if (!finalDoc) return;
    const completedQuote: Quote = {
      id: editQuoteData ? editQuoteData.id : `quote-${Date.now()}`,
      reference: projectDetails.reference || 'REF-UNSET',
      date: projectDetails.date || new Date().toISOString().split('T')[0],
      projectName: projectDetails.projectName || 'Project Name',
      clientName: projectDetails.clientName || 'Client Name',
      companyName: projectDetails.companyName || settings.companyName,
      siteAddress: projectDetails.siteAddress || 'Site Address',
      status: editQuoteData ? editQuoteData.status : 'Pending',
      items: boqItems,
      summary: summary,
      scopeOfWorks: finalDoc.scopeOfWorks,
      paymentSchedule: finalDoc.paymentSchedule,
      termsAndConditions: finalDoc.termsAndConditions,
      createdAt: editQuoteData ? editQuoteData.createdAt : new Date().toISOString(),
      pdfFileName: pdfData?.fileName,
      pdfDataUrl: pdfData?.dataUrl,
    };
    await onSaveQuote(completedQuote);
  };

  // Compile final quote object for preview in Step 7
  const getCompiledQuote = (): Quote => {
    return {
      id: editQuoteData ? editQuoteData.id : 'quote-preview',
      reference: projectDetails.reference || 'REF-UNSET',
      date: projectDetails.date || '',
      projectName: projectDetails.projectName || '',
      clientName: projectDetails.clientName || '',
      companyName: projectDetails.companyName || settings.companyName,
      siteAddress: projectDetails.siteAddress || '',
      status: editQuoteData ? editQuoteData.status : 'Pending',
      items: boqItems,
      summary: summary,
      scopeOfWorks: finalDoc?.scopeOfWorks || '',
      paymentSchedule: finalDoc?.paymentSchedule || [],
      termsAndConditions: finalDoc?.termsAndConditions || '',
      createdAt: editQuoteData ? editQuoteData.createdAt : new Date().toISOString(),
      pdfFileName: pdfData?.fileName,
      pdfDataUrl: pdfData?.dataUrl,
    };
  };

  return (
    <div className="min-h-screen flex flex-col bg-charcoal-900 pb-16">

      {/* Wizard Header Progress Bar - hidden on print */}
      <header className="no-print glass-panel sticky top-0 z-50 border-b border-white/5 py-4 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition group self-start"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition" /> Back to Dashboard
          </button>

          {/* Stepper controls */}
          <div className="flex flex-wrap items-center gap-1.5 md:gap-3 text-[11px] font-semibold text-slate-500">
            {WIZARD_STEPS_LABELS.map((label, idx) => {
              const currentStepNum = idx + 1;
              const isActive = step === currentStepNum;
              const isPast = step > currentStepNum;

              return (
                <div key={label} className="flex items-center gap-1.5 md:gap-3">
                  <span className={`inline-flex items-center justify-center h-5 w-5 rounded-full text-[10px] font-bold ${
                    isActive
                      ? 'bg-construction-orange text-white'
                      : isPast
                      ? 'bg-construction-orange/15 text-construction-orange border border-construction-orange/20'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}>
                    {currentStepNum}
                  </span>
                  <span className={`${isActive ? 'text-white font-bold' : isPast ? 'text-slate-300' : 'text-slate-500'}`}>
                    {label}
                  </span>
                  {idx < WIZARD_STEPS_LABELS.length - 1 && (
                    <ChevronRight className="h-3 w-3 text-slate-700" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main wizard step renders */}
      <main className="flex-grow pt-8 px-4 sm:px-6 lg:px-8">
        {step === 1 && (
          <ProjectDetailsStep
            initialQuote={projectDetails}
            onNext={handleStep1Submit}
            defaultCompanyName={settings.companyName}
          />
        )}
        {step === 2 && (
          <BoqUploadStep
            onNext={handleStep2Submit}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && (
          <BoqAnalysisStep
            projectName={projectDetails.projectName || ''}
            onAnalysisComplete={handleStep3Submit}
          />
        )}
        {step === 4 && (
          <CostEditorStep
            items={boqItems}
            onChange={setBoqItems}
            onNext={handleStep4Submit}
            onBack={() => setStep(editQuoteData ? 4 : 2)}
          />
        )}
        {step === 5 && (
          <CostSummaryStep
            items={boqItems}
            initialSummary={summary}
            onNext={handleStep5Submit}
            onBack={() => setStep(4)}
            defaultOverhead={settings.defaultOverheadPercent}
            defaultProfit={settings.defaultProfitPercent}
            defaultVat={settings.defaultVatPercent}
          />
        )}
        {step === 6 && (
          <GenerateQuoteStep
            projectDetails={projectDetails}
            items={boqItems}
            summary={summary}
            defaultTerms={settings.defaultTermsAndConditions}
            onNext={handleStep6Submit}
            onBack={() => setStep(5)}
          />
        )}
        {step === 7 && (
          <ExportStep
            quote={getCompiledQuote()}
            settings={settings}
            onSaveToDatabase={handleSaveToDatabase}
            onClose={onClose}
          />
        )}
      </main>
    </div>
  );
}
