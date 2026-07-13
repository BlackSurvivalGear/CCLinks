import { useState } from 'react';
import { Quote } from '../types';
import {
  Plus, Search, SlidersHorizontal, Settings as SettingsIcon,
  TrendingUp, Clock, CheckCircle2, FileText, Trash2,
  Eye, FileSpreadsheet, RefreshCw
} from 'lucide-react';

interface DashboardProps {
  quotes: Quote[];
  loading: boolean;
  onNewQuote: () => void;
  onEditQuote: (id: string) => void;
  onDeleteQuote: (id: string) => void;
  onOpenSettings: () => void;
}

export default function Dashboard({
  quotes,
  loading,
  onNewQuote,
  onEditQuote,
  onDeleteQuote,
  onOpenSettings
}: DashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Calculate statistics
  const totalQuotes = quotes.length;
  const approvedQuotes = quotes.filter(q => q.status === 'Approved');
  const pendingQuotes = quotes.filter(q => q.status === 'Pending' || q.status === 'Draft');

  const totalValue = quotes.reduce((sum, q) => sum + (q.summary?.grandTotal || 0), 0);
  const approvedValue = approvedQuotes.reduce((sum, q) => sum + (q.summary?.grandTotal || 0), 0);

  // Filter quotes based on search term & status filter
  const filteredQuotes = quotes.filter(q => {
    const matchesSearch =
      q.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.reference.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || q.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(val);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Upper Brand Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-construction-orange/10 rounded-2xl text-2xl">🏗️</span>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
                CC Links <span className="text-construction-orange font-light">BuilderQuote AI</span>
              </h1>
              <p className="text-slate-400 text-sm">
                Quantity Surveyor (QS) BOQ intelligence and premium commercial estimating platform
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-2 px-4 py-2.5 border border-slate-800 rounded-xl hover:bg-charcoal-700 hover:border-slate-700 text-slate-300 transition"
            title="Configure default markups & profiles"
          >
            <SettingsIcon className="h-4.5 w-4.5 text-slate-400" />
            <span>Settings</span>
          </button>
          <button
            onClick={onNewQuote}
            className="flex items-center gap-2 px-5 py-2.5 bg-construction-orange text-white font-bold rounded-xl hover:bg-construction-orange-hover hover:scale-102 active:scale-98 transition shadow-lg shadow-construction-orange/15"
          >
            <Plus className="h-5 w-5" />
            <span>New Estimate</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Stat 1 */}
        <div className="glass-card rounded-2xl p-5 border border-white/5 flex items-center justify-between shadow-md">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Projects</p>
            <h3 className="text-2xl font-extrabold text-white">{totalQuotes}</h3>
            <p className="text-xs text-slate-500">Estimates drafted or active</p>
          </div>
          <div className="p-3 bg-slate-800/60 text-slate-300 rounded-xl">
            <FileText className="h-6 w-6" />
          </div>
        </div>

        {/* Stat 2 */}
        <div className="glass-card rounded-2xl p-5 border border-white/5 flex items-center justify-between shadow-md">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Value</p>
            <h3 className="text-2xl font-extrabold text-white">{formatCurrency(totalValue)}</h3>
            <p className="text-xs text-emerald-400 font-medium">All active quotes</p>
          </div>
          <div className="p-3 bg-construction-orange/10 text-construction-orange rounded-xl">
            <TrendingUp className="h-6 w-6" />
          </div>
        </div>

        {/* Stat 3 */}
        <div className="glass-card rounded-2xl p-5 border border-white/5 flex items-center justify-between shadow-md">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Approved Quotes</p>
            <h3 className="text-2xl font-extrabold text-white">
              {approvedQuotes.length} <span className="text-xs text-slate-500">/ {totalQuotes}</span>
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              Value: {formatCurrency(approvedValue)}
            </p>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        </div>

        {/* Stat 4 */}
        <div className="glass-card rounded-2xl p-5 border border-white/5 flex items-center justify-between shadow-md">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Quotes</p>
            <h3 className="text-2xl font-extrabold text-white">
              {pendingQuotes.length}
            </h3>
            <p className="text-xs text-slate-500">Awaiting client decision</p>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
            <Clock className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Main Content & Table Area */}
      <div className="glass-card rounded-2xl border border-white/5 shadow-xl overflow-hidden mb-12">

        {/* Table Filters Header */}
        <div className="p-5 border-b border-slate-800 bg-charcoal-800/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:max-w-md">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Search className="h-4.5 w-4.5" />
            </span>
            <input
              type="text"
              placeholder="Search reference, project, or client name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full glass-input rounded-xl pl-10 pr-4 py-2.5 text-sm"
            />
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            <span className="text-slate-400 text-xs font-semibold flex items-center gap-1">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filter:
            </span>
            <div className="flex gap-1 bg-charcoal-900 p-1 rounded-lg border border-slate-800 text-xs">
              {['ALL', 'Draft', 'Pending', 'Approved', 'Rejected'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-md font-medium transition ${
                    statusFilter === status
                      ? 'bg-construction-orange text-white'
                      : 'text-slate-400 hover:text-white hover:bg-charcoal-700'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Quotes list */}
        {loading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
            <RefreshCw className="h-8 w-8 text-construction-orange animate-spin" />
            <p className="text-slate-400 text-sm font-medium">Retrieving estimating documents...</p>
          </div>
        ) : filteredQuotes.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-4">
            <div className="p-4 bg-slate-800/40 rounded-full text-slate-500">
              <FileSpreadsheet className="h-8 w-8" />
            </div>
            <div>
              <p className="text-slate-300 font-bold text-lg">No estimating sheets found</p>
              <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
                {searchTerm || statusFilter !== 'ALL'
                  ? "Adjust your filters or search terms and try again."
                  : "Start by uploading a QS BOQ PDF file to generate your first professional client quote in minutes."}
              </p>
            </div>
            {!(searchTerm || statusFilter !== 'ALL') && (
              <button
                onClick={onNewQuote}
                className="mt-2 px-5 py-2.5 bg-construction-orange/15 text-construction-orange border border-construction-orange/30 font-semibold rounded-xl hover:bg-construction-orange/20 transition"
              >
                Launch Quote Builder
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider font-semibold">
                  <th className="px-6 py-4">Reference</th>
                  <th className="px-6 py-4">Project / Client</th>
                  <th className="px-6 py-4">Quote Date</th>
                  <th className="px-6 py-4">Grand Total</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {filteredQuotes.map((q) => (
                  <tr key={q.id} className="hover:bg-charcoal-800/20 transition group">
                    <td className="px-6 py-4.5 font-mono text-xs font-semibold text-slate-300">
                      {q.reference || 'Q-TEMP'}
                    </td>
                    <td className="px-6 py-4.5">
                      <div>
                        <div className="font-bold text-white group-hover:text-construction-orange transition">
                          {q.projectName}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          {q.clientName}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4.5 text-slate-300 text-xs">
                      {q.date}
                    </td>
                    <td className="px-6 py-4.5 font-bold text-slate-100">
                      {formatCurrency(q.summary?.grandTotal || 0)}
                    </td>
                    <td className="px-6 py-4.5 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                        q.status === 'Approved'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : q.status === 'Pending'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : q.status === 'Rejected'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full mr-1.5 ${
                          q.status === 'Approved' ? 'bg-emerald-400' :
                          q.status === 'Pending' ? 'bg-amber-400' :
                          q.status === 'Rejected' ? 'bg-rose-400' : 'bg-slate-400'
                        }`} />
                        {q.status}
                      </span>
                    </td>
                    <td className="px-6 py-4.5 text-right">
                      {deleteConfirmId === q.id ? (
                        <div className="flex items-center justify-end gap-2 animate-fade-in">
                          <span className="text-xs text-rose-400 font-semibold mr-1">Confirm delete?</span>
                          <button
                            onClick={() => {
                              onDeleteQuote(q.id);
                              setDeleteConfirmId(null);
                            }}
                            className="p-1.5 bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white rounded-lg transition"
                            title="Yes, delete"
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="p-1.5 bg-slate-800 text-slate-400 hover:text-white rounded-lg transition"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onEditQuote(q.id)}
                            className="p-2 text-slate-300 hover:text-white bg-slate-800/40 hover:bg-slate-800 rounded-lg transition"
                            title="Edit cost editor spreadsheet & update terms"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(q.id)}
                            className="p-2 text-slate-400 hover:text-rose-400 bg-slate-800/40 hover:bg-rose-500/10 rounded-lg transition"
                            title="Delete Estimate"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
