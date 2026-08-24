import React, { useState } from 'react';
import {
  Building2,
  Save,
  CheckCircle2,
  RotateCcw,
  AlertTriangle,
  FileText,
  DollarSign,
  Layers,
  MapPin,
  Mail,
  Phone,
  Database,
  RefreshCw,
  Trash2,
  Copy,
  ExternalLink,
  ShieldCheck,
  Check,
  Zap,
  Eye,
  Table,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CompanySettings } from '../../types';
import { SUPABASE_SCHEMA_SQL, SUPABASE_URL } from '../../lib/supabase';

export const CompanySettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    resetAllDataToDefaults,
    isSupabaseConnected,
    isSupabaseLoading,
    supabaseHealth,
    supabaseSyncError,
    refreshDataFromSupabase,
    seedDatabaseToSupabase,
    clearAllDataAndStartFresh,
    supabaseUrl,
    products,
    categories,
    orders,
    users,
    priceChangeLogs,
    cancellationLogs,
    notifications,
  } = useApp();

  const [formData, setFormData] = useState<CompanySettings>(settings);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isClearDbConfirmOpen, setIsClearDbConfirmOpen] = useState(false);
  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);
  const [isTableBrowserOpen, setIsTableBrowserOpen] = useState(false);
  const [selectedBrowserTable, setSelectedBrowserTable] = useState<string>('products');
  const [copiedSql, setCopiedSql] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    setSuccessMessage('Company settings saved and synchronized to Supabase.');
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  const handleResetData = () => {
    resetAllDataToDefaults();
    setIsResetConfirmOpen(false);
    setFormData(settings);
    setSuccessMessage('Application data reset to clean initial demo state.');
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  const handleClearDbFresh = async () => {
    const res = await clearAllDataAndStartFresh();
    setIsClearDbConfirmOpen(false);
    if (res.success) {
      setSuccessMessage('Database cleared successfully! You are now in Clean Real-World Mode with zero sample products/orders.');
    } else {
      setErrorMessage(`Failed to clear database: ${res.error}`);
    }
    setTimeout(() => {
      setSuccessMessage(null);
      setErrorMessage(null);
    }, 4500);
  };

  const handleSeedDb = async () => {
    const res = await seedDatabaseToSupabase();
    if (res.success) {
      setSuccessMessage('Sample database schema and catalog synchronized to your Supabase tables!');
    } else {
      setErrorMessage(`Seed failed: ${res.error}`);
    }
    setTimeout(() => {
      setSuccessMessage(null);
      setErrorMessage(null);
    }, 4000);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SCHEMA_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl lg:text-2xl font-bold text-slate-900 tracking-tight">
            Company & Database Settings
          </h1>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">
            Admin
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Manage your live Supabase PostgreSQL database connection, company branding, receipt layout, and wholesale thresholds.
        </p>
      </div>

      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 1. Supabase Live Database Connection Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-6 shadow-md border border-slate-700/60 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-700/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Live Supabase Database</h2>
                {isSupabaseConnected ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Connected & Live
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    Connecting...
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 truncate max-w-md font-mono mt-0.5">
                {supabaseUrl}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => refreshDataFromSupabase()}
              disabled={isSupabaseLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSupabaseLoading ? 'animate-spin' : ''}`} />
              <span>Sync Now</span>
            </button>

            <button
              type="button"
              onClick={() => setIsTableBrowserOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors cursor-pointer shadow-xs"
            >
              <Table className="w-3.5 h-3.5" />
              <span>Inspect Database Tables</span>
            </button>

            <button
              type="button"
              onClick={() => setIsSqlModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-indigo-500/30 hover:bg-indigo-500/40 text-indigo-200 border border-indigo-400/30 rounded-xl transition-colors cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>View Schema SQL</span>
            </button>
          </div>
        </div>

        {/* Live Database Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
            <p className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">Products</p>
            <p className="text-xl font-bold text-white mt-1 font-mono">{products.length}</p>
            <span className="text-[10px] text-slate-400">Total in stock</span>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
            <p className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">Orders</p>
            <p className="text-xl font-bold text-emerald-400 mt-1 font-mono">{orders.length}</p>
            <span className="text-[10px] text-slate-400">Recorded sales</span>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
            <p className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">Categories</p>
            <p className="text-xl font-bold text-indigo-300 mt-1 font-mono">{categories.length}</p>
            <span className="text-[10px] text-slate-400">Wholesale lines</span>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
            <p className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">Users</p>
            <p className="text-xl font-bold text-amber-300 mt-1 font-mono">{users.length}</p>
            <span className="text-[10px] text-slate-400">Staff accounts</span>
          </div>
        </div>

        {/* Database Table Health Breakdown */}
        {supabaseHealth && (
          <div className="bg-black/30 border border-white/10 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">Supabase Table Sync Status:</span>
              <button
                type="button"
                onClick={() => setIsSqlModalOpen(true)}
                className="text-[11px] text-indigo-300 hover:text-white underline cursor-pointer"
              >
                Copy SQL to create missing tables
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {Object.entries(supabaseHealth.tableStatus).map(([table, isReady]) => (
                <div
                  key={table}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono ${
                    isReady
                      ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/20'
                      : 'bg-amber-950/40 text-amber-300 border border-amber-500/20'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isReady ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                  <span className="truncate">{table}</span>
                  <span className="ml-auto text-[10px] opacity-75">{isReady ? '✓' : 'offline'}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Real-world Clear & Start Fresh Action */}
        <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-700/50">
          <div>
            <p className="text-xs font-bold text-white">Start Recording Real Wholesale Data</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Clear all demo products and sample orders from Supabase to start inputting your live company stock.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsClearDbConfirmOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition-colors cursor-pointer shadow-sm"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Sample Data (Start Fresh)</span>
            </button>

            <button
              type="button"
              onClick={handleSeedDb}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 rounded-xl transition-colors cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Re-sync Sample Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Company Settings Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Building2 className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Company Profile (Appears on Receipts & Reports)
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Company Legal / Trade Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.companyName}
                onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Official Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Physical Warehouse / Office Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>
          </div>
        </div>

        {/* System & Currency Settings */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <DollarSign className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Currency & Wholesale Inventory Settings
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Currency Symbol
              </label>
              <input
                type="text"
                value={formData.currencySymbol}
                onChange={e => setFormData({ ...formData, currencySymbol: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Currency Code (ISO)
              </label>
              <input
                type="text"
                value={formData.currencyCode}
                onChange={e => setFormData({ ...formData, currencyCode: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Low Stock Threshold (Pairs)
              </label>
              <input
                type="number"
                min="0"
                step="12"
                value={formData.lowStockThresholdPairs}
                onChange={e =>
                  setFormData({
                    ...formData,
                    lowStockThresholdPairs: parseInt(e.target.value) || 24,
                  })
                }
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-mono"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Products below this pair count trigger low stock alerts.
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Receipt Footer Note / Terms
            </label>
            <textarea
              rows={3}
              value={formData.receiptFooterNote}
              onChange={e => setFormData({ ...formData, receiptFooterNote: e.target.value })}
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setIsResetConfirmOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Seed</span>
          </button>

          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-xs cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Company Settings</span>
          </button>
        </div>
      </form>

      {/* SQL Migration Script Modal */}
      {isSqlModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">Supabase SQL Schema Script</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSqlModalOpen(false)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-900"
              >
                ✕ Close
              </button>
            </div>

            <p className="text-xs text-slate-600">
              If tables are not created in your Supabase project, open your <strong>Supabase Dashboard &gt; SQL Editor</strong>, paste this script, and click <strong>Run</strong>:
            </p>

            <div className="flex-1 overflow-y-auto bg-slate-950 text-emerald-400 p-4 rounded-2xl font-mono text-xs max-h-96 selection:bg-emerald-800">
              <pre>{SUPABASE_SCHEMA_SQL}</pre>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <a
                href="https://supabase.com/dashboard/project/ghhldisvneqoxlmyapcx/sql"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:underline"
              >
                <span>Open Supabase SQL Editor</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                type="button"
                onClick={handleCopySql}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSql ? 'Copied to Clipboard!' : 'Copy SQL Schema'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Database Modal for Real Data */}
      {isClearDbConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200 p-6 space-y-4">
            <div className="p-3 rounded-2xl bg-rose-100 text-rose-600 w-fit">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Clear All Sample Data & Start Fresh?</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                This will delete all sample demo products, test orders, and price change logs from both your live Supabase database and local session.
                <br /><br />
                <strong>You can immediately begin entering your real-world wholesale inventory and actual customer sales.</strong>
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsClearDbConfirmOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClearDbFresh}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs cursor-pointer"
              >
                Yes, Clear & Start Fresh
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table Browser Modal */}
      {isTableBrowserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs">
          <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-950 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold">Supabase Live Database Inspector</h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Direct live view of records stored in PostgreSQL tables
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => refreshDataFromSupabase()}
                  disabled={isSupabaseLoading}
                  className="px-3 py-1.5 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSupabaseLoading ? 'animate-spin' : ''}`} />
                  <span>Refresh DB</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsTableBrowserOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Table Selection Tabs */}
            <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto">
              {[
                { id: 'products', label: 'Products', count: products.length },
                { id: 'orders', label: 'Orders', count: orders.length },
                { id: 'categories', label: 'Categories', count: categories.length },
                { id: 'users', label: 'Users', count: users.length },
                { id: 'price_logs', label: 'Price Logs', count: priceChangeLogs.length },
                { id: 'cancel_logs', label: 'Cancel Logs', count: cancellationLogs.length },
                { id: 'notifications', label: 'Notifications', count: notifications.length },
                { id: 'settings', label: 'Settings', count: 1 },
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedBrowserTable(tab.id)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    selectedBrowserTable === tab.id
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      selectedBrowserTable === tab.id
                        ? 'bg-indigo-500 text-white'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Table Content Area */}
            <div className="p-6 overflow-y-auto flex-1 bg-slate-900/5 font-mono text-xs">
              {selectedBrowserTable === 'products' && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-slate-800 text-xs font-sans">
                      Table: <span className="font-mono text-indigo-600">public.products</span> ({products.length} records)
                    </span>
                  </div>
                  {products.length === 0 ? (
                    <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center text-slate-400 font-sans">
                      <p className="text-sm font-bold text-slate-700">0 Products in Supabase Table</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Use Product Management to insert products or click "Re-sync Sample Data".
                      </p>
                    </div>
                  ) : (
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto shadow-xs">
                      <table className="w-full text-left text-xs text-slate-700">
                        <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
                          <tr>
                            <th className="py-2.5 px-3">Name</th>
                            <th className="py-2.5 px-3">SKU</th>
                            <th className="py-2.5 px-3 text-right">Pairs</th>
                            <th className="py-2.5 px-3 text-right">Dozens</th>
                            <th className="py-2.5 px-3 text-right">Cost/Doz</th>
                            <th className="py-2.5 px-3 text-right">Last Price</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {products.map(p => (
                            <tr key={p.id} className="hover:bg-slate-50">
                              <td className="py-2 px-3 font-semibold text-slate-900">{p.name}</td>
                              <td className="py-2 px-3 text-slate-500">{p.sku}</td>
                              <td className="py-2 px-3 text-right font-bold">{p.quantityPairs}</td>
                              <td className="py-2 px-3 text-right">{(p.quantityPairs / 12).toFixed(2)}</td>
                              <td className="py-2 px-3 text-right">${p.costPerDozen}</td>
                              <td className="py-2 px-3 text-right font-bold text-indigo-600">${p.lastPrice}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {selectedBrowserTable === 'orders' && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-slate-800 text-xs font-sans">
                      Table: <span className="font-mono text-indigo-600">public.orders</span> ({orders.length} records)
                    </span>
                  </div>
                  {orders.length === 0 ? (
                    <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center text-slate-400 font-sans">
                      <p className="text-sm font-bold text-slate-700">0 Orders in Supabase Table</p>
                      <p className="text-xs text-slate-500 mt-1">Complete sales in POS to record orders to Supabase.</p>
                    </div>
                  ) : (
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto shadow-xs">
                      <table className="w-full text-left text-xs text-slate-700">
                        <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
                          <tr>
                            <th className="py-2.5 px-3">Receipt #</th>
                            <th className="py-2.5 px-3">Customer</th>
                            <th className="py-2.5 px-3">Seller</th>
                            <th className="py-2.5 px-3 text-right">Amount</th>
                            <th className="py-2.5 px-3 text-right">Profit</th>
                            <th className="py-2.5 px-3 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {orders.map(o => (
                            <tr key={o.id} className="hover:bg-slate-50">
                              <td className="py-2 px-3 font-bold text-indigo-600">{o.receiptNumber}</td>
                              <td className="py-2 px-3 font-semibold text-slate-900">{o.customerName}</td>
                              <td className="py-2 px-3 text-slate-500">{o.sellerName}</td>
                              <td className="py-2 px-3 text-right font-bold text-emerald-600">${o.totalAmount.toFixed(2)}</td>
                              <td className="py-2 px-3 text-right font-semibold text-indigo-600">${o.totalProfit.toFixed(2)}</td>
                              <td className="py-2 px-3 text-center">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${
                                  o.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                }`}>
                                  {o.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {selectedBrowserTable === 'categories' && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-slate-800 text-xs font-sans">
                      Table: <span className="font-mono text-indigo-600">public.categories</span> ({categories.length} records)
                    </span>
                  </div>
                  <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto shadow-xs">
                    <table className="w-full text-left text-xs text-slate-700">
                      <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-3">Category Name</th>
                          <th className="py-2.5 px-3">Description</th>
                          <th className="py-2.5 px-3">ID</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {categories.map(c => (
                          <tr key={c.id} className="hover:bg-slate-50">
                            <td className="py-2 px-3 font-bold text-slate-900">{c.name}</td>
                            <td className="py-2 px-3 text-slate-500">{c.description || '-'}</td>
                            <td className="py-2 px-3 font-mono text-[10px] text-slate-400">{c.id}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {selectedBrowserTable === 'users' && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-slate-800 text-xs font-sans">
                      Table: <span className="font-mono text-indigo-600">public.users</span> ({users.length} records)
                    </span>
                  </div>
                  <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto shadow-xs">
                    <table className="w-full text-left text-xs text-slate-700">
                      <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-3">Full Name</th>
                          <th className="py-2.5 px-3">Username</th>
                          <th className="py-2.5 px-3">Role</th>
                          <th className="py-2.5 px-3">Active</th>
                          <th className="py-2.5 px-3">Email</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {users.map(u => (
                          <tr key={u.id} className="hover:bg-slate-50">
                            <td className="py-2 px-3 font-bold text-slate-900">{u.fullName}</td>
                            <td className="py-2 px-3 text-slate-500">@{u.username}</td>
                            <td className="py-2 px-3 font-semibold uppercase text-indigo-600">{u.role}</td>
                            <td className="py-2 px-3">{u.isActive ? 'Active' : 'Disabled'}</td>
                            <td className="py-2 px-3 text-slate-400">{u.email || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {selectedBrowserTable === 'price_logs' && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-slate-800 text-xs font-sans">
                      Table: <span className="font-mono text-indigo-600">public.price_change_logs</span> ({priceChangeLogs.length} records)
                    </span>
                  </div>
                  {priceChangeLogs.length === 0 ? (
                    <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center text-slate-400 font-sans">
                      <p className="text-sm font-bold text-slate-700">0 Price Floor Logs in Database</p>
                    </div>
                  ) : (
                    <div className="bg-white rounded-2xl border border-slate-200 p-3 space-y-2">
                      <pre className="text-[11px] overflow-x-auto text-slate-800">{JSON.stringify(priceChangeLogs, null, 2)}</pre>
                    </div>
                  )}
                </div>
              )}

              {selectedBrowserTable === 'cancel_logs' && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-slate-800 text-xs font-sans">
                      Table: <span className="font-mono text-indigo-600">public.cancellation_logs</span> ({cancellationLogs.length} records)
                    </span>
                  </div>
                  {cancellationLogs.length === 0 ? (
                    <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center text-slate-400 font-sans">
                      <p className="text-sm font-bold text-slate-700">0 Cancellation Logs in Database</p>
                    </div>
                  ) : (
                    <div className="bg-white rounded-2xl border border-slate-200 p-3 space-y-2">
                      <pre className="text-[11px] overflow-x-auto text-slate-800">{JSON.stringify(cancellationLogs, null, 2)}</pre>
                    </div>
                  )}
                </div>
              )}

              {selectedBrowserTable === 'notifications' && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-slate-800 text-xs font-sans">
                      Table: <span className="font-mono text-indigo-600">public.notifications</span> ({notifications.length} records)
                    </span>
                  </div>
                  {notifications.length === 0 ? (
                    <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center text-slate-400 font-sans">
                      <p className="text-sm font-bold text-slate-700">0 Notifications in Database</p>
                    </div>
                  ) : (
                    <div className="bg-white rounded-2xl border border-slate-200 p-3 space-y-2">
                      <pre className="text-[11px] overflow-x-auto text-slate-800">{JSON.stringify(notifications, null, 2)}</pre>
                    </div>
                  )}
                </div>
              )}

              {selectedBrowserTable === 'settings' && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-slate-800 text-xs font-sans">
                      Table: <span className="font-mono text-indigo-600">public.settings</span> (1 record)
                    </span>
                  </div>
                  <div className="bg-white rounded-2xl border border-slate-200 p-4">
                    <pre className="text-[11px] overflow-x-auto text-slate-800">{JSON.stringify(settings, null, 2)}</pre>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs">
              <span className="text-slate-500 font-sans">
                Status: <span className="text-emerald-600 font-bold">Connected to Supabase</span>
              </span>
              <button
                type="button"
                onClick={() => setIsTableBrowserOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 rounded-xl cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4">
            <div className="p-2.5 rounded-xl bg-rose-100 text-rose-600 w-fit">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Reset All Demo Data</h3>
              <p className="text-xs text-slate-500 mt-1">
                This will reset your products catalog, orders, and logs to the original initial seed data.
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetData}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs cursor-pointer"
              >
                Yes, Reset Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
