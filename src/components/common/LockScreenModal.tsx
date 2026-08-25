import React, { useState, useEffect } from 'react';
import {
  Lock,
  KeyRound,
  ShieldAlert,
  ArrowRight,
  UserCheck,
  LogOut,
  Fingerprint,
  Sparkles,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  checkBiometricsSupport,
  authenticateUserBiometrics,
  enrollUserBiometrics,
  isUserBiometricEnrolled,
  BiometricSupportInfo,
} from '../../lib/biometrics';
import { AppLogo } from './AppLogo';

export const LockScreenModal: React.FC = () => {
  const { isScreenLocked, unlockScreen, currentUser, settings, logout } = useApp();
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [biometricInfo, setBiometricInfo] = useState<BiometricSupportInfo>({
    supported: true,
    platformAuthenticator: false,
    type: 'fingerprint',
    label: 'Fingerprint Sensor',
    details: '',
  });
  const [isBiometricEnrolled, setIsBiometricEnrolled] = useState(false);
  const [isVerifyingBiometric, setIsVerifyingBiometric] = useState(false);

  useEffect(() => {
    if (isScreenLocked) {
      setError(null);
      setSuccess(null);
      setPin('');
      checkBiometricsSupport().then(info => {
        setBiometricInfo(info);
        if (currentUser?.id) {
          setIsBiometricEnrolled(isUserBiometricEnrolled(currentUser.id));
        }
      });
    }
  }, [isScreenLocked, currentUser?.id]);

  if (!isScreenLocked) return null;

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!pin.trim()) {
      setError('Please enter your PIN or password.');
      return;
    }

    const res = unlockScreen(pin);
    if (res.success) {
      setPin('');
    } else {
      setError(res.error || 'Incorrect security code.');
    }
  };

  const handleBiometricUnlock = async () => {
    setError(null);
    setSuccess(null);
    setIsVerifyingBiometric(true);

    try {
      const res = await authenticateUserBiometrics(currentUser?.id);
      setIsVerifyingBiometric(false);

      if (res.success) {
        setSuccess('Biometrics verified! Unlocking terminal...');
        setTimeout(() => {
          unlockScreen(currentUser.pin || '1234');
        }, 400);
      } else {
        setError(res.error || 'Biometric verification failed. Please enter your PIN.');
      }
    } catch (err: any) {
      setIsVerifyingBiometric(false);
      setError(err?.message || 'Biometric verification error. Please use PIN.');
    }
  };

  const handleRegisterBiometrics = async () => {
    setError(null);
    setIsVerifyingBiometric(true);
    try {
      const res = await enrollUserBiometrics(
        currentUser.id,
        currentUser.username,
        currentUser.fullName,
        currentUser.role
      );
      setIsVerifyingBiometric(false);
      if (res.success) {
        setIsBiometricEnrolled(true);
        setSuccess('Fingerprint registered! Touch sensor to unlock.');
      } else {
        setError(res.error || 'Failed to register biometrics on this device.');
      }
    } catch (err: any) {
      setIsVerifyingBiometric(false);
      setError(err?.message || 'Biometric registration error.');
    }
  };

  return (
    <div
      id="lock-screen-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-lg overflow-y-auto"
    >
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 text-center space-y-5 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex justify-center">
          <AppLogo size="lg" showText={true} showSubtitle={true} />
        </div>

        <div>
          <h3 className="text-base font-bold text-slate-900">HantiFlow Terminal Protected</h3>
          <p className="text-xs text-slate-500 mt-1">
            Logged in as <strong className="text-slate-800">{currentUser.fullName}</strong> ({currentUser.role})
          </p>
        </div>

        {error && (
          <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
            {error}
          </div>
        )}

        {success && (
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium">
            {success}
          </div>
        )}

        {/* Biometric Unlock Option */}
        <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-2xl space-y-2.5">
          <button
            type="button"
            onClick={handleBiometricUnlock}
            disabled={isVerifyingBiometric}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Fingerprint className={`w-4 h-4 ${isVerifyingBiometric ? 'animate-pulse' : ''}`} />
            <span>
              {isVerifyingBiometric
                ? 'Verifying Sensor...'
                : `Touch Sensor to Unlock (${biometricInfo.label})`}
            </span>
          </button>

          {!isBiometricEnrolled && (
            <button
              type="button"
              onClick={handleRegisterBiometrics}
              disabled={isVerifyingBiometric}
              className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold underline underline-offset-2 cursor-pointer"
            >
              Enroll device fingerprint now
            </button>
          )}
        </div>

        <form onSubmit={handleUnlock} className="space-y-4">
          <div className="relative">
            <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="password"
              value={pin}
              onChange={e => setPin(e.target.value)}
              placeholder="Or enter PIN (e.g. 1234)"
              autoFocus
              className="w-full pl-10 pr-4 py-2.5 text-center tracking-widest text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-bold"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Unlock with PIN</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <span>{settings.companyName}</span>
          <button
            type="button"
            onClick={logout}
            className="text-rose-600 hover:text-rose-700 font-semibold inline-flex items-center gap-1 cursor-pointer"
          >
            <LogOut className="w-3 h-3" />
            <span>Switch User</span>
          </button>
        </div>
      </div>
    </div>
  );
};
