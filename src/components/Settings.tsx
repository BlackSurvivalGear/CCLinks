import { useState } from 'react';
import { AppSettings } from '../types';
import { Save, Building, Percent, Database, Phone, Mail, MapPin } from 'lucide-react';

interface SettingsProps {
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
  onBack: () => void;
}

export default function Settings({ settings, onSave, onBack }: SettingsProps) {
  const [formData, setFormData] = useState<AppSettings>({ ...settings });
  const [firebaseApiKey, setFirebaseApiKey] = useState(settings.firebaseConfig?.apiKey || '');
  const [firebaseProjectId, setFirebaseProjectId] = useState(settings.firebaseConfig?.projectId || '');
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedSettings: AppSettings = {
      ...formData,
      firebaseConfig: formData.useFirebase
        ? {
            apiKey: firebaseApiKey,
            authDomain: `${firebaseProjectId}.firebaseapp.com`,
            projectId: firebaseProjectId,
            storageBucket: `${firebaseProjectId}.appspot.com`,
            messagingSenderId: '1234567890',
            appId: '1:1234567890:web:1234567890',
          }
        : undefined,
    };
    onSave(updatedSettings);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <span className="p-2 bg-construction-orange/10 rounded-xl text-construction-orange">
              🏗️
            </span>
            System Settings
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Configure default company profiles, margins, and cloud sync integrations.
          </p>
        </div>
        <button
          onClick={onBack}
          className="px-4 py-2 border border-slate-700 rounded-lg text-slate-300 hover:bg-charcoal-700 transition"
        >
          Back to Dashboard
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Company Profile Card */}
        <div className="glass-card rounded-2xl p-6 shadow-xl border border-white/5 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Building className="h-5 w-5 text-construction-orange" />
            Default Company Profile
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Company Name
              </label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                required
                className="w-full glass-input rounded-xl px-4 py-3 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Phone Number
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Phone className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  value={formData.companyPhone}
                  onChange={(e) => setFormData({ ...formData, companyPhone: e.target.value })}
                  className="w-full glass-input rounded-xl pl-10 pr-4 py-3 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  type="email"
                  value={formData.companyEmail}
                  onChange={(e) => setFormData({ ...formData, companyEmail: e.target.value })}
                  required
                  className="w-full glass-input rounded-xl pl-10 pr-4 py-3 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Company Logo URL
              </label>
              <input
                type="text"
                value={formData.companyLogoUrl || ''}
                onChange={(e) => setFormData({ ...formData, companyLogoUrl: e.target.value })}
                placeholder="https://example.com/logo.png"
                className="w-full glass-input rounded-xl px-4 py-3 text-sm"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Registered Site/Office Address
              </label>
              <div className="relative">
                <span className="absolute top-3.5 left-3.5 text-slate-500">
                  <MapPin className="h-4 w-4" />
                </span>
                <textarea
                  rows={2}
                  value={formData.companyAddress}
                  onChange={(e) => setFormData({ ...formData, companyAddress: e.target.value })}
                  required
                  className="w-full glass-input rounded-xl pl-10 pr-4 py-3 text-sm resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Default Markups & Terms Card */}
        <div className="glass-card rounded-2xl p-6 shadow-xl border border-white/5 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Percent className="h-5 w-5 text-construction-orange" />
            Default Profit & Overhead Rates
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Overheads (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.defaultOverheadPercent}
                  onChange={(e) => setFormData({ ...formData, defaultOverheadPercent: Number(e.target.value) })}
                  className="w-full glass-input rounded-xl px-4 py-3 text-sm pr-8"
                />
                <span className="absolute right-3 top-3.5 text-slate-500 text-sm">%</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Profit Margin (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.defaultProfitPercent}
                  onChange={(e) => setFormData({ ...formData, defaultProfitPercent: Number(e.target.value) })}
                  className="w-full glass-input rounded-xl px-4 py-3 text-sm pr-8"
                />
                <span className="absolute right-3 top-3.5 text-slate-500 text-sm">%</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                VAT Rate (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.defaultVatPercent}
                  onChange={(e) => setFormData({ ...formData, defaultVatPercent: Number(e.target.value) })}
                  className="w-full glass-input rounded-xl px-4 py-3 text-sm pr-8"
                />
                <span className="absolute right-3 top-3.5 text-slate-500 text-sm">%</span>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Default Quotation Terms & Conditions
            </label>
            <textarea
              rows={4}
              value={formData.defaultTermsAndConditions}
              onChange={(e) => setFormData({ ...formData, defaultTermsAndConditions: e.target.value })}
              className="w-full glass-input rounded-xl px-4 py-3 text-sm"
              placeholder="Enter standard terms that will appear on new quotes..."
            />
          </div>
        </div>

        {/* Database Integration Card */}
        <div className="glass-card rounded-2xl p-6 shadow-xl border border-white/5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Database className="h-5 w-5 text-construction-orange" />
              Firebase Cloud Integration
            </h2>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.useFirebase}
                onChange={(e) => setFormData({ ...formData, useFirebase: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-construction-orange"></div>
              <span className="ml-3 text-sm font-medium text-slate-300">
                {formData.useFirebase ? 'Enabled' : 'Offline Mode'}
              </span>
            </label>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            By default, CC Links operates in ultra-responsive offline mode using secure local storage. If you enable Firebase, all estimate data will be securely synced with your company cloud Firestore collection.
          </p>

          {formData.useFirebase && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Firebase API Key
                </label>
                <input
                  type="password"
                  value={firebaseApiKey}
                  onChange={(e) => setFirebaseApiKey(e.target.value)}
                  placeholder="AIzaSyA1..."
                  required={formData.useFirebase}
                  className="w-full glass-input rounded-xl px-4 py-3 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Firebase Project ID
                </label>
                <input
                  type="text"
                  value={firebaseProjectId}
                  onChange={(e) => setFirebaseProjectId(e.target.value)}
                  placeholder="cclinks-builderquote"
                  required={formData.useFirebase}
                  className="w-full glass-input rounded-xl px-4 py-3 text-sm"
                />
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4">
          {isSaved && (
            <span className="text-emerald-400 text-sm font-medium animate-pulse">
              ✓ Settings saved successfully!
            </span>
          )}
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 bg-construction-orange text-white font-semibold rounded-xl hover:bg-construction-orange-hover active:scale-95 transition shadow-lg shadow-construction-orange/20"
          >
            <Save className="h-4 w-4" />
            Save Configuration
          </button>
        </div>
      </form>
    </div>
  );
}
