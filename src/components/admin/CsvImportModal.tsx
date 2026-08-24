import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Upload,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  FileText,
  X,
  RefreshCw,
  Layers,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  generateProductCsvTemplate,
  downloadCsvFile,
  processProductCsvImport,
  CsvImportResult,
} from '../../utils/csvHelper';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CsvImportModal: React.FC<CsvImportModalProps> = ({ isOpen, onClose }) => {
  const { products, categories, bulkUpdateProducts } = useApp();

  const [fileContent, setFileContent] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [dragActive, setDragActive] = useState(false);
  const [importResult, setImportResult] = useState<CsvImportResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleDownloadTemplate = () => {
    const template = generateProductCsvTemplate();
    downloadCsvFile('Wholesale_Product_Import_Template.csv', template);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      readFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      readFile(file);
    }
  };

  const readFile = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = event => {
      const text = event.target?.result as string;
      setFileContent(text);
      setImportResult(null);
    };
    reader.readAsText(file);
  };

  const handleExecuteImport = () => {
    if (!fileContent) return;
    setIsProcessing(true);

    setTimeout(() => {
      const result = processProductCsvImport(fileContent, products, categories);
      setImportResult(result);
      if (result.errors.length === 0 || result.addedCount > 0 || result.updatedCount > 0) {
        bulkUpdateProducts(result.importedProducts);
      }
      setIsProcessing(false);
    }, 400);
  };

  return (
    <div
      id="csv-import-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto"
    >
      <div
        id="csv-import-modal-container"
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Bulk CSV Product Import</h2>
              <p className="text-xs text-slate-400">Add new products or batch-update quantities</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* PRD Duplicate Rule Banner */}
          <div className="p-3.5 bg-indigo-50/80 rounded-xl border border-indigo-100 flex items-start gap-2.5 text-xs text-indigo-900">
            <HelpCircle className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">PRD Duplicate Handling Specification:</p>
              <p className="mt-0.5 text-indigo-800 leading-relaxed">
                When an imported row matches an existing product SKU or Name, the system will{' '}
                <strong>update only quantity and cost</strong> — the <strong>Last Price floor stays unchanged</strong> to preserve pricing safeguards.
              </p>
            </div>
          </div>

          {/* Template Download Card */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200/80">
            <div>
              <p className="text-xs font-bold text-slate-900">1. Download Standard CSV Template</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Contains columns: Product Name, SKU, Category, Quantity Pairs, Cost per Dozen, Last Price.
              </p>
            </div>
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-800 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-indigo-600" />
              <span>Download Template</span>
            </button>
          </div>

          {/* File Upload Zone */}
          <div
            onDragOver={e => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
              dragActive
                ? 'border-indigo-500 bg-indigo-50/50'
                : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
            }`}
          >
            <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
            <p className="text-xs font-bold text-slate-800">
              Drag & Drop your CSV file here, or{' '}
              <label className="text-indigo-600 hover:text-indigo-700 cursor-pointer underline">
                Browse Files
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Accepts UTF-8 encoded .csv files</p>

            {fileName && (
              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800">
                <FileText className="w-3.5 h-3.5 text-emerald-600" />
                <span>Selected: {fileName}</span>
              </div>
            )}
          </div>

          {/* Import Execution & Summary */}
          {importResult && (
            <div
              className={`p-4 rounded-xl border space-y-2 animate-in fade-in ${
                importResult.errors.length > 0 && importResult.addedCount === 0 && importResult.updatedCount === 0
                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-900'
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-xs">
                {importResult.errors.length === 0 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                )}
                <span>Import Operation Summary:</span>
              </div>
              <div className="text-xs space-y-1 pl-6">
                <p>
                  • <strong>{importResult.addedCount} new product(s)</strong> added to catalog.
                </p>
                <p>
                  • <strong>{importResult.updatedCount} existing product(s)</strong> updated in Quantity & Cost (Last Price preserved).
                </p>
                {importResult.errors.map((err, i) => (
                  <p key={i} className="text-rose-700 font-semibold">
                    • Error: {err}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Close
          </button>
          <button
            type="button"
            disabled={!fileContent || isProcessing}
            onClick={handleExecuteImport}
            className={`inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl transition-all shadow-xs ${
              !fileContent || isProcessing
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-900/20'
            }`}
          >
            {isProcessing && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
            <span>{isProcessing ? 'Processing CSV...' : 'Process & Apply Import'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
