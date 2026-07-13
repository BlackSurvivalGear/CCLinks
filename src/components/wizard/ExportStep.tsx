import { useState } from 'react';
import { Quote, AppSettings } from '../../types';
import { Printer, Download, Save, Home, CheckCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ExportStepProps {
  quote: Quote;
  settings: AppSettings;
  onSaveToDatabase: () => Promise<void>;
  onClose: () => void;
}

export default function ExportStep({ quote, settings, onSaveToDatabase, onClose }: ExportStepProps) {
  const [saving, setSaving] = useState(false);
  const [savedSuccessfully, setSavedSuccessfully] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(val);
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FF6B00', '#0EA5E9', '#FFFFFF']
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await onSaveToDatabase();
      setSavedSuccessfully(true);
      triggerConfetti();
    } catch (err: any) {
      setError(err?.message || 'Failed to save quote');
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadHtml = () => {
    // Generate clean standalone responsive HTML download
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Quotation Proposal - ${quote.reference}</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; line-height: 1.5; margin: 40px; background: #fff; }
    .header { display: flex; justify-content: space-between; border-b: 2px solid #ff6b00; padding-bottom: 20px; margin-bottom: 30px; }
    .logo-container { font-size: 24px; font-weight: bold; color: #111; }
    .meta-container { text-align: right; font-size: 14px; color: #555; }
    .title { font-size: 28px; font-weight: 800; color: #ff6b00; margin-bottom: 20px; text-transform: uppercase; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 30px; }
    .card { background: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px; }
    .card h3 { margin-top: 0; font-size: 13px; text-transform: uppercase; color: #64748b; letter-spacing: 1px; }
    .table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    .table th { background: #0f172a; color: #fff; text-align: left; padding: 12px; font-size: 12px; text-transform: uppercase; }
    .table td { padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
    .table tr:hover { background: #f8fafc; }
    .summary-box { background: #0f172a; color: #fff; padding: 25px; border-radius: 8px; margin-left: auto; width: 320px; margin-bottom: 30px; }
    .summary-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; }
    .grand-total { font-size: 20px; font-weight: 800; color: #ff6b00; border-top: 1px solid #334155; padding-top: 10px; margin-top: 10px; }
    .section-title { font-size: 16px; font-weight: bold; margin-bottom: 15px; border-bottom: 1px solid #ff6b00; padding-bottom: 5px; color: #111; }
    .footer-text { font-size: 12px; color: #64748b; border-t: 1px solid #e2e8f0; padding-top: 20px; margin-top: 40px; }
  </style>
</head>
<body>
  <div class="title">QUOTATION PROPOSAL</div>
  <div class="header">
    <div class="logo-container">
      ${settings.companyName}<br>
      <span style="font-size: 12px; font-weight: normal; color: #555;">
        ${settings.companyAddress}<br>
        Tel: ${settings.companyPhone} | Email: ${settings.companyEmail}
      </span>
    </div>
    <div class="meta-container">
      <strong>Quote Ref:</strong> ${quote.reference}<br>
      <strong>Date Issued:</strong> ${quote.date}<br>
      <strong>Project Name:</strong> ${quote.projectName}
    </div>
  </div>

  <div class="grid">
    <div class="card">
      <h3>Prepared For</h3>
      <strong>${quote.clientName}</strong><br>
      Site Address: ${quote.siteAddress}
    </div>
    <div class="card">
      <h3>Executive Summary</h3>
      <div style="font-size: 13px; color: #475569;">${quote.scopeOfWorks}</div>
    </div>
  </div>

  <div class="section-title">Estimated Cost Breakdown</div>
  <table class="table">
    <thead>
      <tr>
        <th>Work Section / Trade Description</th>
        <th style="text-align: right;">Total Net Price</th>
      </tr>
    </thead>
    <tbody>
      ${Array.from(new Set(quote.items.map(i => i.section))).map(secName => {
        const secTotal = quote.items.filter(i => i.section === secName).reduce((s, i) => s + i.total, 0);
        return `
          <tr>
            <td><strong>${secName}</strong></td>
            <td style="text-align: right; font-weight: bold;">${formatCurrency(secTotal)}</td>
          </tr>
        `;
      }).join('')}
    </tbody>
  </table>

  <div class="summary-box">
    <div class="summary-row"><span>Materials Net Total:</span><span>${formatCurrency(quote.summary.materialTotal)}</span></div>
    <div class="summary-row"><span>Labour Net Total:</span><span>${formatCurrency(quote.summary.labourTotal)}</span></div>
    <div class="summary-row" style="border-bottom: 1px solid #334155; padding-bottom: 8px;"><span>Aggregate Subtotal:</span><span>${formatCurrency(quote.summary.subtotal)}</span></div>
    <div class="summary-row" style="margin-top: 8px;"><span>Overheads (${quote.summary.overheadPercent}%):</span><span>${formatCurrency(quote.summary.overheadTotal)}</span></div>
    <div class="summary-row"><span>Profit Margin (${quote.summary.profitPercent}%):</span><span>${formatCurrency(quote.summary.profitTotal)}</span></div>
    <div class="summary-row"><span>VAT (${quote.summary.vatPercent}%):</span><span>${formatCurrency(quote.summary.vatTotal)}</span></div>
    <div class="summary-row grand-total"><span>Grand Total:</span><span>${formatCurrency(quote.summary.grandTotal)}</span></div>
  </div>

  <div class="section-title">Stage Payments Schedule</div>
  <table class="table" style="margin-bottom: 30px;">
    <thead>
      <tr>
        <th>Milestone Target</th>
        <th style="text-align: center;">Percentage</th>
        <th style="text-align: right;">Invoice Amount</th>
      </tr>
    </thead>
    <tbody>
      ${quote.paymentSchedule.map(m => `
        <tr>
          <td>${m.milestone}</td>
          <td style="text-align: center;">${m.percentage}%</td>
          <td style="text-align: right; font-weight: bold;">${formatCurrency(m.amount)}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="section-title">Terms & Conditions</div>
  <div style="font-size: 11px; white-space: pre-line; color: #475569; background: #f8fafc; padding: 15px; border-radius: 8px;">
    ${quote.termsAndConditions}
  </div>

  <div class="footer-text">
    CC Links BuilderQuote AI • Automated construction estimates compliant with standard rules of measurement.
  </div>
</body>
</html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CC-Quote-${quote.reference}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Group items for rendering in the live preview panel
  const uniqueSections = Array.from(new Set(quote.items.map(i => i.section)));

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Upper action control bar - hidden on print */}
      <div className="no-print glass-card rounded-2xl p-4 border border-white/5 flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-2">
          <span className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
            ✓
          </span>
          <div>
            <h3 className="font-bold text-white text-sm">Quotation compiled successfully!</h3>
            <p className="text-slate-400 text-xs">Ready for client presentation & storage sync</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 text-slate-200 border border-slate-700 font-semibold rounded-xl hover:bg-slate-700 transition text-xs"
          >
            <Printer className="h-4 w-4" /> Print Proposal
          </button>
          <button
            onClick={handleDownloadHtml}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 text-slate-200 border border-slate-700 font-semibold rounded-xl hover:bg-slate-700 transition text-xs"
          >
            <Download className="h-4 w-4" /> Download HTML
          </button>

          {!savedSuccessfully ? (
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-construction-orange text-white font-bold rounded-xl hover:bg-construction-orange-hover hover:scale-102 active:scale-98 transition text-xs disabled:opacity-50"
            >
              <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save Estimate'}
            </button>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-4 py-2.5 rounded-xl animate-fade-in">
              <CheckCircle className="h-4 w-4" /> Saved in Cloud
            </div>
          )}

          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-4 py-2.5 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition text-xs"
          >
            <Home className="h-4 w-4" /> Dashboard
          </button>
        </div>
      </div>

      {error && (
        <div className="no-print p-4 bg-rose-500/15 border border-rose-500/20 rounded-xl text-rose-300 text-xs">
          {error}
        </div>
      )}

      {/* Real Printable Quote Proposal Render Card */}
      <div className="print-card bg-[#111115] text-slate-100 rounded-2xl border border-white/5 p-8 md:p-12 shadow-2xl space-y-8">

        {/* Document Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b-2 border-construction-orange pb-8">
          <div className="space-y-2">
            <div className="text-xl font-black text-white flex items-center gap-2">
              <span className="text-construction-orange text-xl">🏗️</span>
              {settings.companyName}
            </div>
            <p className="text-xs text-slate-400 whitespace-pre-line leading-relaxed">
              {settings.companyAddress}
              <br />
              Tel: {settings.companyPhone} • Email: {settings.companyEmail}
            </p>
          </div>

          <div className="sm:text-right space-y-1">
            <h1 className="text-2xl font-black text-construction-orange uppercase tracking-wider">QUOTATION PROPOSAL</h1>
            <div className="text-xs text-slate-400 space-y-0.5">
              <p><span className="font-semibold text-slate-300">Quote Reference:</span> {quote.reference}</p>
              <p><span className="font-semibold text-slate-300">Issue Date:</span> {quote.date}</p>
              <p><span className="font-semibold text-slate-300">Project Reference:</span> {quote.projectName}</p>
            </div>
          </div>
        </div>

        {/* Addresses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-[#181820]/60 p-5 rounded-xl border border-white/5 space-y-1.5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">PREPARED FOR</h3>
            <p className="text-sm font-bold text-white">{quote.clientName}</p>
            <p className="text-xs text-slate-400 leading-relaxed whitespace-pre-line">
              <span className="font-semibold text-slate-300">Site/Billing Location:</span><br />
              {quote.siteAddress}
            </p>
          </div>

          <div className="bg-[#181820]/60 p-5 rounded-xl border border-white/5 space-y-1.5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">EXECUTIVE SCOPE SUMMARY</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {quote.scopeOfWorks}
            </p>
          </div>
        </div>

        {/* Section Breakdown Grid */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-2">
            DETAILED WORK SUBSECTION SUMS
          </h3>
          <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden">
            {uniqueSections.map((secName) => {
              const secTotal = quote.items.filter(i => i.section === secName).reduce((sum, item) => sum + item.total, 0);
              return (
                <div key={secName} className="flex justify-between py-3.5 px-4 bg-[#14141a]/40 text-xs">
                  <span className="font-semibold text-slate-200">{secName}</span>
                  <span className="font-bold text-white font-mono">{formatCurrency(secTotal)}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Calculations / Summary Invoice box */}
        <div className="flex justify-end pt-2">
          <div className="bg-[#181820] rounded-xl border border-white/5 p-5 w-full sm:max-w-md space-y-3 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Materials Net Base:</span>
              <span className="font-semibold font-mono text-slate-200">{formatCurrency(quote.summary.materialTotal)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Labour Net Base:</span>
              <span className="font-semibold font-mono text-slate-200">{formatCurrency(quote.summary.labourTotal)}</span>
            </div>
            <div className="flex justify-between font-bold text-slate-200 border-b border-slate-800 pb-2">
              <span>Net Value Subtotal:</span>
              <span className="font-mono">{formatCurrency(quote.summary.subtotal)}</span>
            </div>

            <div className="flex justify-between text-slate-400">
              <span>Overhead Fee ({quote.summary.overheadPercent}%):</span>
              <span className="font-semibold font-mono text-slate-200">{formatCurrency(quote.summary.overheadTotal)}</span>
            </div>
            <div className="flex justify-between text-slate-400 border-b border-slate-800 pb-2">
              <span>Profit Margin ({quote.summary.profitPercent}%):</span>
              <span className="font-semibold font-mono text-slate-200">{formatCurrency(quote.summary.profitTotal)}</span>
            </div>

            <div className="flex justify-between text-slate-400">
              <span>Value Added Tax ({quote.summary.vatPercent}%):</span>
              <span className="font-semibold font-mono text-slate-200">{formatCurrency(quote.summary.vatTotal)}</span>
            </div>

            <div className="flex justify-between font-black text-white text-base border-t border-construction-orange/40 pt-3">
              <span className="text-construction-orange uppercase tracking-wide text-xs">GRAND ESTIMATED TOTAL:</span>
              <span className="font-mono text-construction-orange">{formatCurrency(quote.summary.grandTotal)}</span>
            </div>
          </div>
        </div>

        {/* Payment schedule table */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-2">
            MILESTONE INVOICING SCHEDULE
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 font-semibold border-b border-slate-800">
                  <th className="py-2.5">Stage milestone</th>
                  <th className="py-2.5 text-center">Percentage</th>
                  <th className="py-2.5 text-right">Stage Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {quote.paymentSchedule.map((m) => (
                  <tr key={m.id} className="text-slate-300">
                    <td className="py-3 font-semibold">{m.milestone}</td>
                    <td className="py-3 text-center">{m.percentage}%</td>
                    <td className="py-3 text-right font-bold text-white font-mono">{formatCurrency(m.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* T&Cs Block */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-2">
            TERMS & ACCEPTANCE CONDITIONS
          </h3>
          <p className="text-[10px] text-slate-400 whitespace-pre-line leading-relaxed">
            {quote.termsAndConditions}
          </p>
        </div>

        {/* Printable Footer */}
        <div className="text-center text-[10px] text-slate-500 border-t border-slate-800 pt-6">
          CC Links BuilderQuote AI is an automated Quantity Surveyor compiler. All values are subject to contract.
        </div>
      </div>
    </div>
  );
}
