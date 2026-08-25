import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Briefcase,
  Lock,
  User,
  KeyRound,
  ArrowRight,
  AlertCircle,
  Building2,
  CheckCircle2,
  Sparkles,
  Fingerprint,
  X,
  UserCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  checkBiometricsSupport,
  authenticateUserBiometrics,
  BiometricSupportInfo,
} from '../../lib/biometrics';

interface LoginModalProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { loginWithCredentials, users, settings, switchUserById } = useApp();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [biometricInfo, setBiometricInfo] = useState<BiometricSupportInfo>({
    supported: false,
    platformAuthenticator: false,
    type: 'none',
    label: '',
  });
  const [isVerifyingBiometric, setIsVerifyingBiometric] = useState(false);

  useEffect(() => {
    if (isOpen) {
      checkBiometricsSupport().then(setBiometricInfo);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim()) {
      setError('Please enter your username.');
      return;
    }

    setIsSubmitting(true);
    const result = loginWithCredentials(username.trim(), password);
    setIsSubmitting(false);

    if (result.success) {
      if (onClose) onClose();
    } else {
      setError(result.error || 'Invalid credentials.');
    }
  };

  const handleQuickFill = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setError(null);
  };

  const handleBiometricLogin = async () => {
    setError(null);
    setIsVerifyingBiometric(true);

    try {
      const res = await authenticateUserBiometrics();
      if (res.success) {
        // Log in as default admin or first active user
        loginWithCredentials('admin', 'admin');
        if (onClose) onClose();
      } else {
        setError(res.error || 'Biometric authentication failed. Please enter password.');
      }
    } catch (err: any) {
      setError(err?.message || 'Biometric error.');
    } finally {
      setIsVerifyingBiometric(false);
    }
  };

  return (
    <div
      id="login-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto"
    >
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 relative">
        {/* Top Header Banner */}
        <div className="p-6 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white relative">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl transition-colors cursor-pointer"
              title="Close and return to home page"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-white shadow-inner">
              <Building2 className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-white">{settings.companyName}</h2>
              <p className="text-xs text-indigo-200 font-medium">Wholesale Management Security Portal</p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-[11px] text-slate-300 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
            <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Secure 256-bit Encrypted Session & Role Access Control</span>
          </div>
        </div>

        {/* Body Form */}
        <div className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Biometrics Button if Available */}
          {biometricInfo.supported && (
            <button
              type="button"
              onClick={handleBiometricLogin}
              disabled={isVerifyingBiometric}
              className="w-full py-2.5 px-4 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <Fingerprint className={`w-4 h-4 ${isVerifyingBiometric ? 'animate-pulse' : ''}`} />
              <span>{isVerifyingBiometric ? 'Scanning Sensor...' : `Sign In with ${biometricInfo.label}`}</span>
            </button>
          )}

          {/* Quick Demo Credentials Pill Bar */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Quick 1-Click Credentials
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('admin', 'admin')}
                className="flex-1 py-1.5 px-2.5 bg-slate-100 hover:bg-indigo-50 hover:border-indigo-300 border border-slate-200 rounded-lg text-[11px] font-medium text-slate-700 transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <ShieldCheck className="w-3 h-3 text-indigo-600" />
                <span>Admin (admin/admin)</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('sarah_j', 'seller')}
                className="flex-1 py-1.5 px-2.5 bg-slate-100 hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 rounded-lg text-[11px] font-medium text-slate-700 transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <Briefcase className="w-3 h-3 text-emerald-600" />
                <span>Seller (sarah_j/seller)</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Username or Email Address
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Enter your username or email"
                  autoFocus
                  required
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-medium text-slate-800"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Password or Security PIN
                </label>
              </div>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password or PIN"
                  required
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-medium text-slate-800"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>Sign In to Terminal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-1 text-center">
            <p className="text-[11px] text-slate-400">
              Default Admin: <strong className="text-slate-600">admin / admin</strong> (PIN: 1234)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
