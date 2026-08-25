import React, { useState, useEffect } from 'react';
import {
  Building2,
  ShieldCheck,
  ShoppingCart,
  LayoutDashboard,
  Fingerprint,
  KeyRound,
  ArrowRight,
  Sparkles,
  Layers,
  Database,
  Printer,
  History,
  Lock,
  UserCheck,
  CheckCircle2,
  Smartphone,
  Info,
  Check,
  LogIn,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { checkBiometricsSupport, authenticateUserBiometrics, BiometricSupportInfo } from '../../lib/biometrics';
import { PWAInstallButton } from '../common/PWAInstallButton';

interface LandingHomePageProps {
  onOpenLoginModal: () => void;
}

export const LandingHomePage: React.FC<LandingHomePageProps> = ({ onOpenLoginModal }) => {
  const {
    settings,
    users,
    switchUserById,
    loginWithCredentials,
    isSupabaseConnected,
  } = useApp();

  const [biometricInfo, setBiometricInfo] = useState<BiometricSupportInfo>({
    supported: false,
    platformAuthenticator: false,
    type: 'none',
    label: 'Checking biometrics...',
  });
  const [biometricStatusMsg, setBiometricStatusMsg] = useState<string | null>(null);
  const [isScanningBiometrics, setIsScanningBiometrics] = useState(false);

  // Check biometric support on mount
  useEffect(() => {
    checkBiometricsSupport().then(info => {
      setBiometricInfo(info);
    });
  }, []);

  const handleQuickLogin = (userId: string) => {
    switchUserById(userId);
  };

  const handleDirectAdminLogin = () => {
    const res = loginWithCredentials('admin', 'admin');
    if (!res.success) {
      onOpenLoginModal();
    }
  };

  const handleDirectSellerLogin = () => {
    const res = loginWithCredentials('sarah_j', 'seller');
    if (!res.success) {
      onOpenLoginModal();
    }
  };

  const handleBiometricLogin = async () => {
    setIsScanningBiometrics(true);
    setBiometricStatusMsg('Touch your fingerprint sensor or verify Face ID...');

    try {
      const res = await authenticateUserBiometrics();
      if (res.success) {
        setBiometricStatusMsg('Biometrics verified successfully! Signing in...');
        // Default to admin or first user
        setTimeout(() => {
          loginWithCredentials('admin', 'admin');
        }, 500);
      } else {
        setBiometricStatusMsg(res.error || 'Biometric verification failed. Please use PIN or password.');
      }
    } catch (err: any) {
      setBiometricStatusMsg(err?.message || 'Biometric sensor error. Please use username/password.');
    } finally {
      setIsScanningBiometrics(false);
    }
  };

  const adminUsers = users.filter(u => u.role === 'admin' && u.isActive);
  const sellerUsers = users.filter(u => u.role === 'seller' && u.isActive);

  return (
    <div id="landing-home-page" className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white relative overflow-x-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-indigo-600/15 via-indigo-900/5 to-transparent pointer-events-none blur-3xl -z-10" />

      {/* Top Navbar */}
      <nav className="w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-600/25">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-tight text-white">{settings.companyName}</span>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-md">
                  ERP & POS
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Wholesale Footwear Distribution System</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <PWAInstallButton variant="compact" />

            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
              <span className={`w-2 h-2 rounded-full ${isSupabaseConnected ? 'bg-emerald-400 animate-pulse' : 'bg-emerald-500'}`} />
              <span className="text-slate-300 text-[11px] font-medium">Cloud Sync Ready</span>
            </div>

            <button
              type="button"
              onClick={onOpenLoginModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/25 transition-all cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Hero Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-8 py-8 sm:py-12 space-y-12">
        {/* Hero Section */}
        <section className="text-center max-w-3xl mx-auto space-y-6 pt-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>DUBUGAAS Enterprise Wholesale Management Portal</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight sm:leading-tight">
            Wholesale Footwear ERP & Mobile POS Terminal
          </h1>

          <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Manage bulk inventory in dozens and pairs, enforce minimum pricing rules, process rapid seller orders with thermal receipts, and secure access with phone fingerprint authentication.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleDirectAdminLogin}
              className="w-full sm:w-auto px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-2xl shadow-xl shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer group"
            >
              <LayoutDashboard className="w-4 h-4 text-indigo-200" />
              <span>Launch Admin Dashboard</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>

            <button
              type="button"
              onClick={handleDirectSellerLogin}
              className="w-full sm:w-auto px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-2xl shadow-xl shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer group"
            >
              <ShoppingCart className="w-4 h-4 text-emerald-200" />
              <span>Open Sales POS Terminal</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>

            {biometricInfo.supported && (
              <button
                type="button"
                onClick={handleBiometricLogin}
                disabled={isScanningBiometrics}
                className="w-full sm:w-auto px-5 py-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-sm font-bold rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Fingerprint className={`w-4 h-4 text-indigo-400 ${isScanningBiometrics ? 'animate-pulse' : ''}`} />
                <span>{biometricInfo.type === 'face' ? 'Face ID Login' : 'Fingerprint Login'}</span>
              </button>
            )}
          </div>

          {biometricStatusMsg && (
            <div className="inline-block p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-indigo-300 animate-in fade-in">
              {biometricStatusMsg}
            </div>
          )}
        </section>

        {/* Quick Access Account Credentials Banner */}
        <section className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-indigo-400" />
                <h2 className="text-lg font-bold text-white tracking-tight">One-Click Account Login</h2>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Select an account below to log in directly, or click "Custom Login" to enter credentials.
              </p>
            </div>

            <button
              type="button"
              onClick={onOpenLoginModal}
              className="self-start sm:self-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5 text-indigo-400" />
              <span>Custom Login Form</span>
            </button>
          </div>

          {/* Accounts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Admin Card */}
            {adminUsers.map(user => (
              <div
                key={user.id}
                className="bg-slate-950/70 border border-indigo-500/30 hover:border-indigo-500/60 rounded-2xl p-5 flex flex-col justify-between space-y-4 transition-all hover:shadow-lg hover:shadow-indigo-500/10 group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      ADMINISTRATOR
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  </div>

                  <h3 className="text-sm font-bold text-white">{user.fullName}</h3>
                  <p className="text-xs text-slate-400">Full System Control & Analytics</p>

                  <div className="mt-3 bg-slate-900/90 rounded-xl p-2.5 border border-slate-800 text-[11px] space-y-1 font-mono">
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-500">Username:</span>
                      <strong className="text-indigo-300">{user.username}</strong>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-500">Password:</span>
                      <strong className="text-indigo-300">{user.password || 'admin'}</strong>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-500">PIN Code:</span>
                      <strong className="text-indigo-300">{user.pin || '1234'}</strong>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleQuickLogin(user.id)}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-indigo-600/20"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Log In as Admin</span>
                </button>
              </div>
            ))}

            {/* Seller Cards */}
            {sellerUsers.slice(0, 2).map((user, idx) => (
              <div
                key={user.id}
                className="bg-slate-950/70 border border-emerald-500/30 hover:border-emerald-500/60 rounded-2xl p-5 flex flex-col justify-between space-y-4 transition-all hover:shadow-lg hover:shadow-emerald-500/10 group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <ShoppingCart className="w-3 h-3" />
                      WHOLESALE SELLER
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  </div>

                  <h3 className="text-sm font-bold text-white">{user.fullName}</h3>
                  <p className="text-xs text-slate-400">POS Sales, Receipts & Catalog</p>

                  <div className="mt-3 bg-slate-900/90 rounded-xl p-2.5 border border-slate-800 text-[11px] space-y-1 font-mono">
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-500">Username:</span>
                      <strong className="text-emerald-300">{user.username}</strong>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-500">Password:</span>
                      <strong className="text-emerald-300">{user.password || 'seller'}</strong>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-500">PIN Code:</span>
                      <strong className="text-emerald-300">{user.pin || '1234'}</strong>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleQuickLogin(user.id)}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-emerald-600/20"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Log In as Seller</span>
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Biometrics & Phone Hardware Support Banner */}
        <section className="bg-gradient-to-r from-slate-900 via-indigo-950/50 to-slate-900 border border-indigo-500/20 rounded-3xl p-6 sm:p-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                <Fingerprint className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">Hardware Biometric Authentication</h3>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-500/20 text-indigo-300 rounded-md">
                    WebAuthn Native
                  </span>
                </div>
                <p className="text-xs text-slate-400 max-w-xl">
                  {biometricInfo.supported
                    ? `Your device supports ${biometricInfo.label}. You can lock the screen and unlock instantly with your phone or laptop fingerprint sensor.`
                    : 'When accessing this portal on a smartphone or laptop with Touch ID / Fingerprint / Face ID, you can lock the POS screen and unlock with one touch.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={handleBiometricLogin}
                disabled={isScanningBiometrics}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Fingerprint className="w-4 h-4" />
                <span>Test Fingerprint Sensor</span>
              </button>
            </div>
          </div>
        </section>

        {/* Core System Features Grid */}
        <section className="space-y-6">
          <div className="text-center space-y-1.5">
            <h2 className="text-xl font-bold text-white">Engineered for High-Volume Wholesale Operations</h2>
            <p className="text-xs text-slate-400">Everything needed to manage wholesale shoes, bulk sales, and distributor accounts.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Feature 1 */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Wholesale Dozen & Pairs POS</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Automatic conversion of dozens to individual pairs (1 dozen = 12 pairs) with live stock verification and instant customer receipts.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Minimum Price Protection</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Built-in guardrails prevent sellers from selling below the configured Last Price, with audit logs for any authorized adjustments.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Printer className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Thermal & 80mm Receipts</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Generate clean, printable wholesale invoices with itemized dozens, totals, customer phone, notes, and 24-hour cancellation rules.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Supabase Live Cloud Database</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Dual-engine synchronization with Supabase PostgreSQL and offline local caching for high reliability in warehouse environments.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <History className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Auditing & Cancellation Logs</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Full transparent audit trails of every price edit, order cancellation, stock restoration, and user session activity.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Biometric Screen Lock</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Lock your terminal when stepping away from the register and unlock in a second with your fingerprint or 4-digit PIN.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 px-4 text-center text-xs text-slate-500 space-y-2">
        <div className="flex items-center justify-center gap-2">
          <span className="font-semibold text-slate-400">{settings.companyName}</span>
          <span>•</span>
          <span>DUBUGAAS v2.4 Enterprise</span>
        </div>
        <p className="text-[11px] text-slate-600">
          Admin Credentials: <strong className="text-slate-400">admin / admin</strong> (PIN: 1234) | Seller: <strong className="text-slate-400">sarah_j / seller</strong>
        </p>
      </footer>
    </div>
  );
};
