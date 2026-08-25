import React, { useState, useEffect } from 'react';
import {
  Fingerprint,
  ShieldCheck,
  KeyRound,
  AlertCircle,
  CheckCircle2,
  X,
  Lock,
  ArrowRight,
  User,
  Info,
  Building2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  checkBiometricsSupport,
  authenticateUserBiometrics,
  getEnrolledBiometricAccounts,
  verifyBiometricPin,
  BiometricEnrolledAccount,
  BiometricSupportInfo,
} from '../../lib/biometrics';

interface BiometricAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenStandardLogin: () => void;
}

export const BiometricAuthModal: React.FC<BiometricAuthModalProps> = ({
  isOpen,
  onClose,
  onOpenStandardLogin,
}) => {
  const { switchUserById, settings } = useApp();

  const [biometricInfo, setBiometricInfo] = useState<BiometricSupportInfo>({
    supported: true,
    platformAuthenticator: false,
    type: 'fingerprint',
    label: 'Fingerprint Sensor',
    details: '',
  });

  const [enrolledAccounts, setEnrolledAccounts] = useState<BiometricEnrolledAccount[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [pinFallback, setPinFallback] = useState('');
  const [showPinInput, setShowPinInput] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      setSuccessMsg(null);
      setShowPinInput(false);
      setPinFallback('');

      checkBiometricsSupport().then(info => setBiometricInfo(info));
      const accounts = getEnrolledBiometricAccounts();
      setEnrolledAccounts(accounts);
      if (accounts.length > 0) {
        setSelectedUserId(accounts[0].userId);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleVerifyBiometrics = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsVerifying(true);

    try {
      const res = await authenticateUserBiometrics(selectedUserId || undefined);
      setIsVerifying(false);

      if (res.success && res.userId) {
        setSuccessMsg(`Biometrics verified! Welcome back, ${res.userAccount?.fullName || 'Staff'}.`);
        setTimeout(() => {
          switchUserById(res.userId!);
          onClose();
        }, 600);
      } else {
        setErrorMsg(res.error || 'Biometric verification failed. Please try again or use PIN.');
      }
    } catch (err: any) {
      setIsVerifying(false);
      setErrorMsg(err?.message || 'Biometric sensor error.');
    }
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) {
      setErrorMsg('Please select an account.');
      return;
    }
    if (!pinFallback.trim()) {
      setErrorMsg('Please enter your PIN.');
      return;
    }

    const isValid = verifyBiometricPin(selectedUserId, pinFallback.trim());
    if (isValid) {
      setSuccessMsg('PIN verified! Loading terminal...');
      setTimeout(() => {
        switchUserById(selectedUserId);
        onClose();
      }, 500);
    } else {
      setErrorMsg('Incorrect PIN. Please try again or use your password.');
    }
  };

  const hasEnrolled = enrolledAccounts.length > 0;
  const currentAccount = enrolledAccounts.find(a => a.userId === selectedUserId) || enrolledAccounts[0];

  return (
    <div
      id="biometric-auth-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto"
    >
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 relative">
        {/* Header */}
        <div className="p-6 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400 shadow-inner">
              <Fingerprint className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Biometric Terminal Authentication</h3>
              <p className="text-xs text-indigo-200 font-medium">
                {hasEnrolled ? 'Hardware Passkey & Fingerprint Verification' : 'Device Registration Required'}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-xs text-rose-700 font-medium">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-2.5 text-xs text-emerald-800 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {hasEnrolled ? (
            <>
              {/* Account Selector if multiple */}
              {enrolledAccounts.length > 1 && (
                <div className="space-y-1.5 text-left">
                  <label className="block text-xs font-semibold text-slate-700">Select Account</label>
                  <select
                    value={selectedUserId}
                    onChange={e => setSelectedUserId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                  >
                    {enrolledAccounts.map(acc => (
                      <option key={acc.userId} value={acc.userId}>
                        {acc.fullName} (@{acc.username}) - {acc.role.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Target User Info */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                    {currentAccount?.role === 'admin' ? <ShieldCheck className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 leading-tight">{currentAccount?.fullName}</p>
                    <p className="text-[11px] text-slate-500 font-mono">@{currentAccount?.username}</p>
                  </div>
                </div>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 border border-indigo-200">
                  {currentAccount?.role}
                </span>
              </div>

              {/* Interactive Biometric Sensor Touch Pad */}
              <div className="py-5 flex flex-col items-center justify-center space-y-3 bg-indigo-50/50 border border-indigo-100 rounded-3xl text-center p-6 relative">
                <button
                  type="button"
                  onClick={handleVerifyBiometrics}
                  disabled={isVerifying}
                  className={`w-24 h-24 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xl ${
                    isVerifying
                      ? 'bg-indigo-600 text-white ring-8 ring-indigo-400/40 scale-105 animate-pulse'
                      : 'bg-gradient-to-tr from-indigo-600 to-violet-600 text-white hover:scale-105 shadow-indigo-600/30 ring-4 ring-indigo-200'
                  }`}
                  title="Touch to verify biometric sensor"
                >
                  <Fingerprint className={`w-12 h-12 ${isVerifying ? 'animate-bounce' : ''}`} />
                </button>

                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {isVerifying ? 'Verifying Biometric Sensor...' : 'Touch Sensor to Authenticate'}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs">
                    Place your enrolled finger on the device sensor or verify Face ID / Windows Hello.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleVerifyBiometrics}
                  disabled={isVerifying}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
                >
                  {isVerifying ? 'Verifying...' : 'Verify Biometrics Now'}
                </button>
              </div>

              {/* PIN Fallback Toggle */}
              {showPinInput ? (
                <form onSubmit={handlePinSubmit} className="space-y-3 pt-2">
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      value={pinFallback}
                      onChange={e => setPinFallback(e.target.value)}
                      placeholder="Enter 4-Digit Security PIN (e.g. 1234)"
                      autoFocus
                      className="w-full pl-10 pr-4 py-2.5 text-center tracking-widest text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 font-bold"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>Unlock with PIN</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              ) : (
                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => setShowPinInput(true)}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold underline underline-offset-2 cursor-pointer"
                  >
                    Sensor not responding? Use Quick Security PIN
                  </button>
                </div>
              )}
            </>
          ) : (
            /* Guidance when no passkey/fingerprint has been registered yet */
            <div className="space-y-4 text-center py-2">
              <div className="w-16 h-16 rounded-3xl bg-amber-50 border-2 border-amber-200 mx-auto flex items-center justify-center text-amber-600 shadow-inner">
                <Info className="w-8 h-8" />
              </div>

              <div className="space-y-1.5">
                <h4 className="text-sm font-bold text-slate-900">Device Biometrics Not Yet Enrolled</h4>
                <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                  For your enterprise security, you must first sign in with your Username and Password. Once inside, you can register your device fingerprint with one click in your profile menu.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenStandardLogin();
                }}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-2xl shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Sign In with Username & Password to Register</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Standard Login Fallback Link */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenStandardLogin();
              }}
              className="text-slate-600 hover:text-indigo-600 font-semibold cursor-pointer"
            >
              ← Standard Username & Password Sign In
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
