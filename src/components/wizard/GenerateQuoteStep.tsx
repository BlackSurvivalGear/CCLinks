import { useState, useEffect } from 'react';
import { Quote, BOQItem, QuoteSummary, PaymentScheduleItem } from '../../types';
import { FileText, Building, ListChecks, CreditCard, ChevronRight } from 'lucide-react';

interface GenerateQuoteStepProps {
  projectDetails: Partial<Quote>;
  items: BOQItem[];
  summary: QuoteSummary;
  defaultTerms: string;
  onNext: (quoteData: {
    scopeOfWorks: string;
    termsAndConditions: string;
    paymentSchedule: PaymentScheduleItem[];
  }) => void;
  onBack: () => void;
}

export default function GenerateQuoteStep({
  projectDetails,
  items,
  summary,
  defaultTerms,
  onNext,
  onBack
}: GenerateQuoteStepProps) {
  const [scopeOfWorks, setScopeOfWorks] = useState('');
  const [termsAndConditions, setTermsAndConditions] = useState(defaultTerms);
  const [paymentSchedule, setPaymentSchedule] = useState<PaymentScheduleItem[]>([]);

  // 1. Group items by section to display a beautiful breakdown
  const sections: Record<string, BOQItem[]> = {};
  items.forEach(item => {
    const sec = item.section || 'Uncategorised';
    if (!sections[sec]) sections[sec] = [];
    sections[sec].push(item);
  });

  // 2. Initialize Scope of Works and Payment Schedule on mount
  useEffect(() => {
    // Generate description
    const pName = projectDetails.projectName || 'Construction Project';
    const numItems = items.length;
    const sectNames = Object.keys(sections).join(', ');
    const desc = `This proposal details the measured work scopes for the "${pName}" project. Works comprise a total of ${numItems} measured line items categorized across major construction trades: ${sectNames}. All rates detailed are calculated in strict compliance with the project specifications, using premium grade materials and qualified labor trades. All site operations shall comply with local health & safety regulations and structural design mandates.`;
    setScopeOfWorks(desc);

    // Generate an automatic professional milestone payment schedule
    const milestones = [
      { name: 'Commencement Deposit', pct: 10 },
      { name: 'Substructure & Structural Frame Completion', pct: 40 },
      { name: 'First-Fix & Dry-Lining (Shell Completion)', pct: 30 },
      { name: 'Practical Completion & Handover', pct: 20 },
    ];

    const schedule: PaymentScheduleItem[] = milestones.map((m, idx) => {
      const amount = (summary.grandTotal * m.pct) / 100;
      // Estimate due dates: 30, 60, 90 days out from issue
      const dateOffset = idx * 30;
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + dateOffset);

      return {
        id: `milestone-${idx + 1}`,
        milestone: m.name,
        percentage: m.pct,
        amount: amount,
        dueDate: dueDate.toISOString().split('T')[0]
      };
    });

    setPaymentSchedule(schedule);
  }, [projectDetails, items, summary.grandTotal]);

  const handleMilestoneNameChange = (id: string, name: string) => {
    setPaymentSchedule(prev => prev.map(m => m.id === id ? { ...m, milestone: name } : m));
  };

  const handleMilestonePctChange = (id: string, pctStr: string) => {
    const pct = parseFloat(pctStr) || 0;
    setPaymentSchedule(prev => {
      const updated = prev.map(m => {
        if (m.id === id) {
          const amt = (summary.grandTotal * pct) / 100;
          return { ...m, percentage: pct, amount: amt };
        }
        return m;
      });
      return updated;
    });
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(val);
  };

  const handleNext = () => {
    onNext({
      scopeOfWorks,
      termsAndConditions,
      paymentSchedule
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
          <span className="text-construction-orange">Step 6:</span> Draft Quotation Document
        </h2>
        <p className="text-slate-400 text-xs mt-1">
          Review and customize scope descriptions, payment milestones, and terms prior to printing or saving to database.
        </p>
      </div>

      <div className="space-y-6">

        {/* Scope of Works Card */}
        <div className="glass-card rounded-2xl p-6 border border-white/5 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-800">
            <FileText className="h-4.5 w-4.5 text-construction-orange" /> Executive Scope of Works
          </h3>
          <p className="text-[11px] text-slate-400">
            Provide a high-level executive summary of the project. This will print at the top of your commercial quotation document.
          </p>
          <textarea
            rows={4}
            value={scopeOfWorks}
            onChange={(e) => setScopeOfWorks(e.target.value)}
            className="w-full glass-input rounded-xl px-4 py-3 text-sm"
          />
        </div>

        {/* Trade Section Totals Overview */}
        <div className="glass-card rounded-2xl p-6 border border-white/5 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-800">
            <Building className="h-4.5 w-4.5 text-construction-orange" /> Estimated Trades Cost Breakdown
          </h3>
          <p className="text-[11px] text-slate-400">
            A summarized breakdown by Quantity Surveyor category that will be visible to the client.
          </p>
          <div className="space-y-2">
            {Object.keys(sections).map((secName) => {
              const secItems = sections[secName];
              const secTotal = secItems.reduce((sum, item) => sum + item.total, 0);
              return (
                <div key={secName} className="flex justify-between items-center py-2 px-3 bg-charcoal-900/50 rounded-xl border border-white/5">
                  <div className="flex items-center gap-2 text-xs text-slate-200">
                    <ChevronRight className="h-3.5 w-3.5 text-construction-orange" />
                    <span>{secName}</span>
                    <span className="text-[10px] text-slate-500">({secItems.length} items)</span>
                  </div>
                  <span className="text-xs font-bold font-mono text-slate-100">{formatCurrency(secTotal)}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment Milestones Schedule */}
        <div className="glass-card rounded-2xl p-6 border border-white/5 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-800">
            <CreditCard className="h-4.5 w-4.5 text-construction-orange" /> Milestone Stage Payments Schedule
          </h3>
          <p className="text-[11px] text-slate-400">
            Split the grand client total into progressive stage-claim invoices (total percentages must ideally sum to 100%).
          </p>

          <div className="space-y-3">
            {paymentSchedule.map((milestone) => (
              <div key={milestone.id} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 bg-charcoal-900/50 rounded-xl border border-white/5 items-center">
                <div className="md:col-span-2">
                  <input
                    type="text"
                    value={milestone.milestone}
                    onChange={(e) => handleMilestoneNameChange(milestone.id, e.target.value)}
                    className="w-full bg-transparent hover:bg-charcoal-800/20 focus:bg-charcoal-900 border border-transparent focus:border-construction-orange rounded p-1.5 text-slate-200 font-bold text-xs"
                  />
                </div>
                <div>
                  <div className="relative">
                    <input
                      type="number"
                      value={milestone.percentage}
                      onChange={(e) => handleMilestonePctChange(milestone.id, e.target.value)}
                      className="w-full text-center bg-transparent hover:bg-charcoal-800/20 focus:bg-charcoal-900 border border-transparent focus:border-construction-orange rounded p-1.5 pr-6 text-slate-100 text-xs font-semibold"
                    />
                    <span className="absolute right-3 top-2.5 text-slate-500 text-[10px]">%</span>
                  </div>
                </div>
                <div className="text-right px-4 text-xs font-bold text-slate-200 font-mono">
                  {formatCurrency(milestone.amount)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="glass-card rounded-2xl p-6 border border-white/5 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-800">
            <ListChecks className="h-4.5 w-4.5 text-construction-orange" /> Terms & Standard Conditions
          </h3>
          <textarea
            rows={5}
            value={termsAndConditions}
            onChange={(e) => setTermsAndConditions(e.target.value)}
            className="w-full glass-input rounded-xl px-4 py-3 text-sm"
          />
        </div>
      </div>

      {/* Button Controls */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onBack}
          className="px-5 py-2.5 border border-slate-800 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          className="px-6 py-3 bg-construction-orange text-white font-bold rounded-xl hover:bg-construction-orange-hover hover:scale-102 active:scale-98 transition shadow-lg shadow-construction-orange/15"
        >
          Compile Proposal Draft
        </button>
      </div>
    </div>
  );
}
