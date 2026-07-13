import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { dbService } from '../../services/db';

interface BoqUploadStepProps {
  onNext: (pdfData: { fileName: string; dataUrl: string }) => void;
  onBack: () => void;
}

export default function BoqUploadStep({ onNext, onBack }: BoqUploadStepProps) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  const validateAndProcessFile = (selectedFile: File) => {
    setError(null);
    const isValidPDF = selectedFile.type === 'application/pdf' || selectedFile.name.endsWith('.pdf');
    const isValidTXT = selectedFile.type === 'text/plain' || selectedFile.name.endsWith('.txt');

    if (!isValidPDF && !isValidTXT) {
      setError('Invalid file format. Please upload a valid Quantity Surveyor\'s BOQ PDF or Plain Text file.');
      return;
    }

    if (selectedFile.size > 15 * 1024 * 1024) { // 15MB limit
      setError('File is too large. Please upload a PDF file under 15MB.');
      return;
    }

    setFile(selectedFile);
  };

  const handleStartUpload = async () => {
    if (!file) return;
    setUploading(true);
    setProgress(0);
    try {
      const result = await dbService.uploadPDF(file, (pct) => {
        setProgress(pct);
      });
      onNext(result);
    } catch (err: any) {
      setError(err?.message || 'Error occurred during file uploading.');
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="glass-card rounded-2xl p-6 md:p-8 shadow-xl border border-white/5 space-y-6">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <span className="text-construction-orange">Step 2:</span> Upload Bill of Quantities (BOQ)
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Upload the measured work document prepared by a Quantity Surveyor. Accepted formats: PDF, TXT.
          </p>
        </div>

        {/* Drag and Drop Zone */}
        {!file && !uploading && (
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition flex flex-col items-center justify-center gap-4 ${
              dragActive
                ? 'border-construction-orange bg-construction-orange/5 scale-[1.01]'
                : 'border-slate-700 bg-charcoal-900/40 hover:border-slate-500 hover:bg-charcoal-800/25'
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.txt"
              onChange={handleChange}
              className="hidden"
            />
            <div className="p-4 bg-charcoal-800 rounded-full text-construction-orange">
              <Upload className="h-8 w-8" />
            </div>
            <div>
              <p className="text-slate-200 font-bold text-sm">Drag & drop your BOQ PDF here</p>
              <p className="text-slate-500 text-xs mt-1">or click to browse local files (max 15MB)</p>
            </div>
            <div className="text-[10px] text-slate-500 font-medium bg-slate-800/50 px-2.5 py-1 rounded">
              Securely stored in your workspace storage
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="flex items-start gap-3 p-4 bg-rose-500/15 border border-rose-500/20 rounded-xl text-rose-300 text-xs">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold">Validation Alert</p>
              <p className="mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Selected File Details */}
        {file && !uploading && (
          <div className="p-4 bg-charcoal-900/60 rounded-xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-construction-orange/10 text-construction-orange rounded-lg">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-100">{file.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Size: {(file.size / (1024 * 1024)).toFixed(2)} MB • PDF Document
                </p>
              </div>
            </div>
            <button
              onClick={() => setFile(null)}
              className="text-xs text-slate-400 hover:text-white underline font-medium"
            >
              Change file
            </button>
          </div>
        )}

        {/* Uploading Progress State */}
        {uploading && (
          <div className="p-6 bg-charcoal-900/60 rounded-xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-300 flex items-center gap-2">
                <RefreshCw className="h-3.5 w-3.5 text-construction-orange animate-spin" />
                Transferring BOQ file to Firebase Storage...
              </span>
              <span className="text-construction-orange">{progress}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-construction-orange h-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 text-center">
              Encrypting connection & chunking raw bytes for secure serverless ingestion
            </p>
          </div>
        )}
      </div>

      {/* Button Controls */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onBack}
          disabled={uploading}
          className="px-5 py-2.5 border border-slate-800 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition disabled:opacity-50"
        >
          Back
        </button>
        {file && !uploading && (
          <button
            onClick={handleStartUpload}
            className="px-6 py-3 bg-construction-orange text-white font-bold rounded-xl hover:bg-construction-orange-hover hover:scale-102 active:scale-98 transition shadow-lg shadow-construction-orange/15 flex items-center gap-2"
          >
            <CheckCircle2 className="h-4 w-4" />
            Upload & Analyze Document
          </button>
        )}
      </div>
    </div>
  );
}
