import React, { useState, useEffect } from 'react';
import {
  Fingerprint,
  ShieldCheck,
  Smartphone,
  Laptop,
  CheckCircle2,
  AlertCircle,
  X,
  Lock,
  KeyRound,
  Trash2,
  Sparkles,
  Info,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  checkBiometricsSupport,
  enrollUserBiometrics,
  removeUserBiometrics,
  isUserBiometricEnrolled,
  getEnrolledAccount,
  detectDeviceName,
  BiometricSupportInfo,
} from '../../lib/biometrics';

interface BiometricEnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEnrollmentSuccess?: () => void;
}

export const BiometricEnrollmentModal: React.FC<BiometricEnrollmentModalProps> = ({
  isOpen,
  onClose,
  onEnrollmentSuccess,
}) => {
  const { currentUser, settings } = useApp();

  const [biometricInfo, setBiometricInfo] = useState<BiometricSupportInfo>({
    supported: false,
    platformAuthenticator: false,
    type: 'none',
    label: 'Detecting sensor...',
    details: '',
  });

  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrolledDetails, setEnrolledDetails] = useState<any>(null);
  const [quickPin, setQuickPin] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [step, setStep] = useState<'idle' | 'scanning' | 'success' | 'test'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [hasPasskeyCreated, setHasPasskeyCreated] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      setSuccessMsg(null);
      setStep('idle');
      checkBiometricsSupport().then(info => {
        setBiometricInfo(info);
        if (currentUser?.id) {
          const enrolled = isUserBiometricEnrolled(currentUser.id);
          setIsEnrolled(enrolled);
          if (enrolled) {
            setEnrolledDetails(getEnrolledAccount(currentUser.id));
          }
        }
      });
    }
  }, [isOpen, currentUser?.id]);

  if (!isOpen) return null;

  const handleStartEnrollment = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsScanning(true);
    setStep('scanning');

    try {
      const res = await enrollUserBiometrics(
        currentUser.id,
        currentUser.username,
        currentUser.fullName,
        currentUser.role,
        quickPin.trim() || undefined
      );

      setIsScanning(false);

      if (res.success) {
        setIsEnrolled(true);
        setHasPasskeyCreated(!!res.hasPasskey);
        setEnrolledDetails(getEnrolledAccount(currentUser.id));
        setStep('success');
        setSuccessMsg(
          res.hasPasskey
            ? `Passkey & Biometric Sensor successfully registered on this ${detectDeviceName()}!`
            : `Device Biometrics successfully registered for ${currentUser.fullName}!`
        );
        if (onEnrollmentSuccess) onEnrollmentSuccess();
      } else {
        setStep('idle');
        setErrorMsg(res.error || 'Failed to register biometric sensor. Please try again.');
      }
    } catch (err: any) {
      setIsScanning(false);
      setStep('idle');
      setErrorMsg(err?.message || 'Biometric sensor initialization error.');
    }
  };

  const handleRemoveEnrollment = () => {
    removeUserBiometrics(currentUser.id);
    setIsEnrolled(false);
    setEnrolledDetails(null);
    setStep('idle');
    setSuccessMsg('Biometric registration removed from this device.');
  };

  return (
    <div
      id="biometric-enrollment-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto"
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
              <h3 className="text-base font-bold text-white">Biometric Passkey Setup</h3>
              <p className="text-xs text-indigo-200">Hardware Fingerprint & Face ID Enrollment</p>
            </div>
          </div>
        </div>

        {/* Modal Content */}
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

          {/* Enrolled Account Badge */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-500 block text-[11px]">Enrolling Account:</span>
              <strong className="text-slate-900 font-bold">{currentUser.fullName}</strong>{' '}
              <span className="text-slate-500 font-mono">(@{currentUser.username})</span>
            </div>
            <span
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                isEnrolled
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : 'bg-amber-100 text-amber-800 border border-amber-200'
              }`}
            >
              {isEnrolled ? 'Registered' : 'Not Registered'}
            </span>
          </div>

          {/* Interactive Scanner Animation View */}
          <div className="py-4 flex flex-col items-center justify-center space-y-3 bg-indigo-50/40 border border-indigo-100 rounded-3xl text-center p-6 relative overflow-hidden">
            <div
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                isScanning
                  ? 'bg-indigo-600 text-white ring-8 ring-indigo-400/30 scale-105 animate-pulse'
                  : isEnrolled
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 ring-4 ring-emerald-100'
                  : 'bg-indigo-100 text-indigo-600 hover:scale-105'
              }`}
            >
              <Fingerprint className={`w-10 h-10 ${isScanning ? 'animate-bounce' : ''}`} />
            </div>

            <div>
              <h4 className="text-sm font-bold text-slate-900">
                {isScanning
                  ? 'Scanning Fingerprint Sensor...'
                  : isEnrolled
                  ? 'Device Passkey Active'
                  : 'Ready to Enroll Sensor'}
              </h4>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                {isScanning
                  ? 'Touch your device fingerprint sensor or prompt Face ID...'
                  : isEnrolled
                  ? `Bound to ${enrolledDetails?.deviceName || detectDeviceName()}`
                  : `Binds ${biometricInfo.label} to this device for instant one-touch login.`}
              </p>
            </div>
          </div>

          {/* PIN Setup (Optional backup) */}
          {!isEnrolled && (
            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-semibold text-slate-700">
                Optional Quick Biometric Security PIN (Backup)
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  maxLength={6}
                  value={quickPin}
                  onChange={e => setQuickPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 1234 (4 to 6 digits)"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 font-mono tracking-widest text-slate-800"
                />
              </div>
              <p className="text-[11px] text-slate-400">
                Used if your device sensor is temporarily wet, dirty, or offline.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-2 pt-2">
            {!isEnrolled ? (
              <button
                type="button"
                onClick={handleStartEnrollment}
                disabled={isScanning}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-[1.01]"
              >
                <Fingerprint className="w-4 h-4" />
                <span>{isScanning ? 'Registering Sensor...' : 'Register Fingerprint & Passkey'}</span>
              </button>
            ) : (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleStartEnrollment}
                  disabled={isScanning}
                  className="w-full py-2.5 px-4 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                  <span>Re-register Sensor / Update Passkey</span>
                </button>

                <button
                  type="button"
                  onClick={handleRemoveEnrollment}
                  className="w-full py-2.5 px-4 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Biometric Registration on this Device</span>
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 text-xs text-slate-500 hover:text-slate-800 font-medium transition-colors cursor-pointer"
            >
              Done / Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
