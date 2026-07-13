import { useState } from 'react';
import { Quote } from '../../types';
import { Calendar, User, Building, MapPin, Hash, Sparkles } from 'lucide-react';

interface ProjectDetailsStepProps {
  initialQuote: Partial<Quote>;
  onNext: (details: Partial<Quote>) => void;
  defaultCompanyName: string;
}

export default function ProjectDetailsStep({ initialQuote, onNext, defaultCompanyName }: ProjectDetailsStepProps) {
  const [projectName, setProjectName] = useState(initialQuote.projectName || '');
  const [clientName, setClientName] = useState(initialQuote.clientName || '');
  const [companyName, setCompanyName] = useState(initialQuote.companyName || defaultCompanyName || 'CC Links Ltd');
  const [siteAddress, setSiteAddress] = useState(initialQuote.siteAddress || '');
  const [reference, setReference] = useState(initialQuote.reference || '');
  const [date, setDate] = useState(initialQuote.date || new Date().toISOString().split('T')[0]);

  const generateRef = () => {
    const year = new Date().getFullYear();
    const rand = Math.floor(1000 + Math.random() * 9000);
    setReference(`CC-${year}-${rand}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext({
      projectName,
      clientName,
      companyName,
      siteAddress,
      reference,
      date,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl mx-auto">
      <div className="glass-card rounded-2xl p-6 md:p-8 shadow-xl border border-white/5 space-y-6">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <span className="text-construction-orange">Step 1:</span> Project details
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Input basic metadata for this construction estimate. These details will be formatted directly into the final client proposal.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Project Name */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Project Name / Scope Heading
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                🏗️
              </span>
              <input
                type="text"
                required
                placeholder="e.g. 2-Story Rear Extension or Loft Conversion"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full glass-input rounded-xl pl-11 pr-4 py-3.5 text-sm"
              />
            </div>
          </div>

          {/* Client Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Client / Organization Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                <User className="h-4 w-4" />
              </span>
              <input
                type="text"
                required
                placeholder="e.g. Mr. David Henderson"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full glass-input rounded-xl pl-10 pr-4 py-3.5 text-sm"
              />
            </div>
          </div>

          {/* Company Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Bidding Company Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                <Building className="h-4 w-4" />
              </span>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full glass-input rounded-xl pl-10 pr-4 py-3.5 text-sm"
              />
            </div>
          </div>

          {/* Site Address */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Site / Project Address
            </label>
            <div className="relative">
              <span className="absolute top-3.5 left-3.5 text-slate-500">
                <MapPin className="h-4 w-4" />
              </span>
              <textarea
                rows={2}
                required
                placeholder="e.g. 42 Westbourne Grove, London, W2 5SH"
                value={siteAddress}
                onChange={(e) => setSiteAddress(e.target.value)}
                className="w-full glass-input rounded-xl pl-10 pr-4 py-3 text-sm resize-none"
              />
            </div>
          </div>

          {/* Quote Reference */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex justify-between items-center">
              <span>Quote Reference</span>
              <button
                type="button"
                onClick={generateRef}
                className="text-[10px] text-construction-orange hover:underline flex items-center gap-0.5 font-medium"
              >
                <Sparkles className="h-3 w-3" /> Auto-generate
              </button>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                <Hash className="h-4 w-4" />
              </span>
              <input
                type="text"
                required
                placeholder="e.g. CC-2026-1042"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="w-full glass-input rounded-xl pl-10 pr-4 py-3.5 text-sm"
              />
            </div>
          </div>

          {/* Quote Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Quote Issue Date
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                <Calendar className="h-4 w-4" />
              </span>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full glass-input rounded-xl pl-10 pr-4 py-3.5 text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          className="px-6 py-3 bg-construction-orange text-white font-bold rounded-xl hover:bg-construction-orange-hover hover:scale-102 active:scale-98 transition shadow-lg shadow-construction-orange/15"
        >
          Save & Continue to Upload
        </button>
      </div>
    </form>
  );
}
