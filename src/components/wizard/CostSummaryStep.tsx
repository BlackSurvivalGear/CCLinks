import { useState, useEffect } from 'react';
import { BOQItem, QuoteSummary } from '../../types';
import { Scale, Percent, Wallet, Info } from 'lucide-react';

interface CostSummaryStepProps {
  items: BOQItem[];
  initialSummary: Partial<QuoteSummary>;
  onNext: (summary: QuoteSummary) => void;
  onBack: () => void;
  defaultOverhead: number;
  defaultProfit: number;
  defaultVat: number;
}

export default function CostSummaryStep({
  items,
  initialSummary,
  onNext,
  onBack,
  defaultOverhead,
  defaultProfit,
  defaultVat
}: CostSummaryStepProps) {
  // Markup percentage states
  const [overheadPercent, setOverheadPercent] = useState(
    initialSummary.overheadPercent !== undefined ? initialSummary.overheadPercent : defaultOverhead
  );
  const [profitPercent, setProfitPercent] = useState(
    initialSummary.profitPercent !== undefined ? initialSummary.profitPercent : defaultProfit
  );
  const [vatPercent, setVatPercent] = useState(
    initialSummary.vatPercent !== undefined ? initialSummary.vatPercent : defaultVat
  );

  // Totals states
  const [totals, setTotals] = useState<QuoteSummary>({
    materialTotal: 0,
    labourTotal: 0,
    subtotal: 0,
    overheadPercent: 0,
    overheadTotal: 0,
    profitPercent: 0,
    profitTotal: 0,
    vatPercent: 0,
    vatTotal: 0,
    grandTotal: 0
  });

  useEffect(() => {
    // 1. Sum up Materials and Labour
    let materialSum = 0;
    let labourSum = 0;
    items.forEach(item => {
      materialSum += item.quantity * item.materialRate;
      labourSum += item.quantity * item.labourRate;
    });

    const subtotal = materialSum + labourSum;

    // 2. Overheads
    const overheadTotal = (subtotal * overheadPercent) / 100;

    // 3. Profit Margin (applied on subtotal + overheads for professional accuracy)
    const profitTotal = ((subtotal + overheadTotal) * profitPercent) / 100;

    // 4. VAT
    const vatTotal = ((subtotal + overheadTotal + profitTotal) * vatPercent) / 100;

    // 5. Grand Total
    const grandTotal = subtotal + overheadTotal + profitTotal + vatTotal;

    setTotals({
      materialTotal: materialSum,
      labourTotal: labourSum,
      subtotal,
      overheadPercent,
      overheadTotal,
      profitPercent,
      profitTotal,
      vatPercent,
      vatTotal,
      grandTotal
    });
  }, [items, overheadPercent, profitPercent, vatPercent]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(val);
  };

  const handleNext = () => {
    onNext(totals);
  };

  // Percentage calculations for graphical display
  const matPct = totals.subtotal > 0 ? (totals.materialTotal / totals.grandTotal) * 100 : 0;
  const labPct = totals.subtotal > 0 ? (totals.labourTotal / totals.grandTotal) * 100 : 0;
  const markupSum = totals.overheadTotal + totals.profitTotal;
  const markupPct = totals.subtotal > 0 ? (markupSum / totals.grandTotal) * 100 : 0;
  const vatPctValue = totals.subtotal > 0 ? (totals.vatTotal / totals.grandTotal) * 100 : 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
          <span className="text-construction-orange">Step 5:</span> Cost Summary & Markups
        </h2>
        <p className="text-slate-400 text-xs mt-1">
          Apply contingency, overheads, profit margins, and standard value added tax rates. Verify margins through visual gauges.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">

        {/* Sliders Control Panel */}
        <div className="md:col-span-3 space-y-5">
          <div className="glass-card rounded-2xl p-6 border border-white/5 space-y-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-slate-800">
              <Percent className="h-4.5 w-4.5 text-construction-orange" /> Customize Markups
            </h3>

            {/* Overhead Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-300">Overhead Rate</span>
                <span className="text-construction-orange font-mono text-sm">{overheadPercent}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                step="0.5"
                value={overheadPercent}
                onChange={(e) => setOverheadPercent(parseFloat(e.target.value))}
                className="w-full accent-construction-orange bg-slate-800 h-1.5 rounded-lg cursor-pointer"
              />
              <p className="text-[10px] text-slate-500">Covers insurance, office, scaffolding transport, and general administration.</p>
            </div>

            {/* Profit Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-300">Profit Margin</span>
                <span className="text-construction-orange font-mono text-sm">{profitPercent}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="0.5"
                value={profitPercent}
                onChange={(e) => setProfitPercent(parseFloat(e.target.value))}
                className="w-full accent-construction-orange bg-slate-800 h-1.5 rounded-lg cursor-pointer"
              />
              <p className="text-[10px] text-slate-500">Net corporate return target applied on aggregate costs.</p>
            </div>

            {/* VAT Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-300">VAT Rate</span>
                <span className="text-construction-orange font-mono text-sm">{vatPercent}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="25"
                step="1"
                value={vatPercent}
                onChange={(e) => setVatPercent(parseFloat(e.target.value))}
                className="w-full accent-construction-orange bg-slate-800 h-1.5 rounded-lg cursor-pointer"
              />
              <p className="text-[10px] text-slate-500">Standard 20% in the UK, reduced rates apply to specific refurbishments.</p>
            </div>
          </div>

          {/* Visual proportions meter */}
          <div className="glass-card rounded-2xl p-6 border border-white/5 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Scale className="h-4 w-4 text-construction-orange" /> Quotation Price Proportions
            </h3>
            <div className="w-full h-3 bg-slate-800 rounded-full flex overflow-hidden">
              <div className="bg-orange-500 h-full" style={{ width: `${matPct}%` }} title="Materials" />
              <div className="bg-sky-500 h-full" style={{ width: `${labPct}%` }} title="Labour" />
              <div className="bg-emerald-500 h-full" style={{ width: `${markupPct}%` }} title="Markup/Profit" />
              <div className="bg-slate-600 h-full" style={{ width: `${vatPctValue}%` }} title="VAT" />
            </div>
            <div className="grid grid-cols-2 gap-3 text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-orange-500 rounded-full" />
                <span>Materials: {matPct.toFixed(1)}%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-sky-500 rounded-full" />
                <span>Labour: {labPct.toFixed(1)}%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                <span>Markup & Profit: {markupPct.toFixed(1)}%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-slate-600 rounded-full" />
                <span>VAT Portion: {vatPctValue.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Calculations Bill Invoice panel */}
        <div className="md:col-span-2 space-y-4">
          <div className="glass-card rounded-2xl p-6 border border-construction-orange/15 shadow-xl bg-charcoal-800/80 space-y-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-800">
              <Wallet className="h-4.5 w-4.5 text-construction-orange" /> Summary Invoice
            </h3>

            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Net Materials Total:</span>
                <span className="font-semibold text-slate-100 font-mono">{formatCurrency(totals.materialTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Net Labour Total:</span>
                <span className="font-semibold text-slate-100 font-mono">{formatCurrency(totals.labourTotal)}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/60 pb-3">
                <span className="text-slate-300 font-bold">Aggregate Subtotal:</span>
                <span className="font-bold text-slate-100 font-mono">{formatCurrency(totals.subtotal)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">Overhead Fee ({totals.overheadPercent}%):</span>
                <span className="font-semibold text-slate-200 font-mono">{formatCurrency(totals.overheadTotal)}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/60 pb-3">
                <span className="text-slate-400">Profit Margin ({totals.profitPercent}%):</span>
                <span className="font-semibold text-slate-200 font-mono">{formatCurrency(totals.profitTotal)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">Value Added Tax ({totals.vatPercent}%):</span>
                <span className="font-semibold text-slate-200 font-mono">{formatCurrency(totals.vatTotal)}</span>
              </div>

              <div className="bg-charcoal-900/85 p-4 rounded-xl border border-white/5 flex flex-col justify-between items-center gap-1.5 text-center mt-4">
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">GRAND CLIENT TOTAL</span>
                <span className="text-2xl font-black text-construction-orange font-mono">
                  {formatCurrency(totals.grandTotal)}
                </span>
                <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-1">
                  <Info className="h-3 w-3 text-construction-orange" /> Recalculated live in accordance with UK CIS norms
                </span>
              </div>
            </div>
          </div>
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
          Generate Proposal Document
        </button>
      </div>
    </div>
  );
}
