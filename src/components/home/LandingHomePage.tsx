import React, { useState, useEffect } from 'react';
import {
  Building2,
  ShieldCheck,
  ShoppingCart,
  LayoutDashboard,
  Fingerprint,
  Lock,
  ArrowRight,
  Sparkles,
  Layers,
  Database,
  Printer,
  History,
  CheckCircle2,
  Smartphone,
  Info,
  LogIn,
  Sliders,
  FileSpreadsheet,
  AlertCircle,
  Package,
  TrendingUp,
  Cpu,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  checkBiometricsSupport,
  hasAnyBiometricEnrolled,
  getEnrolledBiometricAccounts,
  BiometricSupportInfo,
} from '../../lib/biometrics';
import { PWAInstallButton } from '../common/PWAInstallButton';
import { BiometricAuthModal } from '../common/BiometricAuthModal';
import { AppLogo } from '../common/AppLogo';

interface LandingHomePageProps {
  onOpenLoginModal: () => void;
}

export const LandingHomePage: React.FC<LandingHomePageProps> = ({ onOpenLoginModal }) => {
  const { settings, isSupabaseConnected } = useApp();

  const [biometricInfo, setBiometricInfo] = useState<BiometricSupportInfo>({
    supported: true,
    platformAuthenticator: false,
    type: 'fingerprint',
    label: 'Fingerprint Sensor',
    details: '',
  });
  const [hasEnrolledBiometrics, setHasEnrolledBiometrics] = useState(false);
  const [isBiometricModalOpen, setIsBiometricModalOpen] = useState(false);

  useEffect(() => {
    checkBiometricsSupport().then(info => {
      setBiometricInfo(info);
      setHasEnrolledBiometrics(hasAnyBiometricEnrolled());
    });
  }, []);

  return (
    <div id="landing-home-page" className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white relative overflow-x-hidden font-sans">
      {/* Background Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[450px] bg-gradient-to-b from-indigo-600/15 via-indigo-900/5 to-transparent pointer-events-none blur-3xl -z-10" />

      {/* Enterprise Top Navigation */}
      <header className="w-full border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AppLogo size="md" variant="dark" showSubtitle={true} />
            <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-md">
              ENTERPRISE ERP &amp; POS
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <PWAInstallButton variant="compact" />

            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
              <span className={`w-2 h-2 rounded-full ${isSupabaseConnected ? 'bg-emerald-400 animate-pulse' : 'bg-emerald-500'}`} />
              <span className="text-slate-300 text-[11px] font-medium">Cloud Database Connected</span>
            </div>

            <button
              type="button"
              onClick={onOpenLoginModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/25 transition-all cursor-pointer hover:scale-[1.02]"
            >
              <LogIn className="w-4 h-4" />
              <span>Staff Sign In</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-8 py-10 sm:py-16 space-y-16">
        {/* Hero Section */}
        <section className="text-center max-w-3xl mx-auto space-y-6 pt-2">
          {/* Main 3D Logo Showcase */}
          <div className="flex justify-center mb-2">
            <div className="relative group p-2">
              <img
                src="/hantiflow-logo.png"
                alt="HantiFlow Business & Accounting"
                className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl object-cover shadow-2xl ring-4 ring-blue-500/30 group-hover:scale-105 transition-transform duration-300 mx-auto"
                referrerPolicy="no-referrer"
              />
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-blue-600/90 text-white text-[10px] font-extrabold tracking-wider uppercase border border-blue-400/40 shadow-md whitespace-nowrap">
                Smart Business. Clear Numbers.
              </div>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span>Secure Business &amp; Accounting Wholesale Terminal</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight sm:leading-tight">
            HantiFlow Business &amp; Accounting
          </h1>

          <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Wholesale distribution &amp; retail sales management system: manage wholesale dozen-to-pair stock, enforce strict minimum pricing rules, issue thermal customer receipts, and secure terminal sessions with passkey and fingerprint biometrics.
          </p>

          {/* Action Center */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
            <button
              type="button"
              onClick={onOpenLoginModal}
              className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-2xl shadow-xl shadow-blue-600/25 flex items-center justify-center gap-2.5 transition-all cursor-pointer group hover:scale-[1.02]"
            >
              <Lock className="w-4 h-4 text-blue-200" />
              <span>Access HantiFlow Terminal</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>

            <button
              type="button"
              onClick={() => setIsBiometricModalOpen(true)}
              className="w-full sm:w-auto px-6 py-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-sm font-bold rounded-2xl flex items-center justify-center gap-2.5 transition-all cursor-pointer hover:border-blue-500/40"
            >
              <Fingerprint className="w-4 h-4 text-blue-400" />
              <span>{hasEnrolledBiometrics ? 'Fingerprint Sign In' : 'Biometric Sensor Login'}</span>
            </button>
          </div>
        </section>

        {/* Security & Authentication Protocol Overview Card */}
        <section className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
            <div>
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h2 className="text-lg font-bold text-white tracking-tight">Enterprise Access & Security Framework</h2>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Zero unauthorized access. All terminal sessions require credentials or hardware biometrics.
              </p>
            </div>

            <button
              type="button"
              onClick={onOpenLoginModal}
              className="self-start md:self-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Staff Login</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            {/* Step 1 */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4.5 space-y-2.5">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                <span className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center text-[10px]">1</span>
                <span>Role-Based Authentication</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Separate portals for Administrators (inventory management, financial reports, user access) and Sellers (rapid POS sales, order history).
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4.5 space-y-2.5">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-[10px]">2</span>
                <span>Hardware Biometrics Enrollment</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Staff can enroll their smartphone or laptop fingerprint sensor from inside their account. Once registered, biometrics allow instant screen unlock and login.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4.5 space-y-2.5">
              <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider">
                <span className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center text-[10px]">3</span>
                <span>Full Audit & Cancellation Trail</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Every sale, price modification, order cancellation, and inventory restock is logged with timestamps, author attribution, and reason codes.
              </p>
            </div>
          </div>
        </section>

        {/* Wholesale ERP Modules Grid */}
        <section className="space-y-6">
          <div className="text-center space-y-1.5">
            <h2 className="text-xl sm:text-2xl font-bold text-white">Wholesale Operational Capabilities</h2>
            <p className="text-xs sm:text-sm text-slate-400">High-performance tools purpose-built for bulk shoe warehousing and POS distribution.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 text-left">
            {/* Feature 1 */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3 hover:border-slate-700 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Dozen & Pairs POS Checkout</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Supports dual-unit ordering: sell by whole dozens or individual pairs with automatic real-time conversion and stock decrement.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3 hover:border-slate-700 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Last Price Protection Rules</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Strict minimum price guardrails prevent unauthorized discounts below wholesale thresholds, with automatic audit logging for overrides.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3 hover:border-slate-700 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Printer className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Thermal & 80mm Invoicing</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Instant thermal receipt printing formatted for ESC/POS and standard 80mm printers, complete with itemized dozens, totals, and return policies.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3 hover:border-slate-700 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Supabase Cloud Database</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Enterprise cloud synchronization with PostgreSQL tables plus offline local storage caching for uninterrupted offline terminal operations.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3 hover:border-slate-700 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Bulk CSV Catalog Import</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Import thousands of footwear inventory items with pricing, category tags, supplier codes, and initial dozen counts in seconds.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3 hover:border-slate-700 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                <Fingerprint className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Biometric Terminal Lock</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Instant one-touch screen lock when stepping away from the counter, with biometric unlock via phone fingerprint sensor or Face ID.
              </p>
            </div>
          </div>
        </section>

        {/* Bottom CTA Banner */}
        <section className="bg-gradient-to-r from-indigo-950/60 via-slate-900 to-indigo-950/60 border border-indigo-500/20 rounded-3xl p-8 text-center space-y-4 shadow-xl">
          <h2 className="text-xl sm:text-2xl font-bold text-white">Ready to operate your wholesale terminal?</h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Authorized personnel must sign in with their assigned username and password to launch the POS or Admin Dashboard.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={onOpenLoginModal}
              className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-2xl shadow-xl shadow-indigo-600/25 inline-flex items-center gap-2 transition-all cursor-pointer hover:scale-[1.02]"
            >
              <LogIn className="w-4 h-4" />
              <span>Open Staff Sign In</span>
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 px-4 text-center text-xs text-slate-500 space-y-1.5">
        <div className="flex items-center justify-center gap-2">
          <span className="font-semibold text-slate-300">HantiFlow</span>
          <span>•</span>
          <span>Business &amp; Accounting ERP v3.0</span>
          <span>•</span>
          <span className="text-amber-400 font-medium">Smart Business. Clear Numbers.</span>
        </div>
        <p className="text-[11px] text-slate-600">
          Secure Multi-User System • Protected by 256-bit Encryption &amp; Hardware WebAuthn Biometrics
        </p>
      </footer>

      {/* Biometric Authentication Dialog */}
      <BiometricAuthModal
        isOpen={isBiometricModalOpen}
        onClose={() => setIsBiometricModalOpen(false)}
        onOpenStandardLogin={() => {
          setIsBiometricModalOpen(false);
          onOpenLoginModal();
        }}
      />
    </div>
  );
};
