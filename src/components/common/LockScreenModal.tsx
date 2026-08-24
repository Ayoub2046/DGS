import React, { useState } from 'react';
import { Lock, KeyRound, ShieldAlert, ArrowRight, UserCheck, LogOut } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const LockScreenModal: React.FC = () => {
  const { isScreenLocked, unlockScreen, currentUser, settings, logout } = useApp();
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div
      id="lock-screen-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-lg overflow-y-auto"
    >
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 text-center space-y-5 animate-in fade-in zoom-in-95 duration-150">
        <div className="w-16 h-16 rounded-3xl bg-indigo-50 border-2 border-indigo-200 mx-auto flex items-center justify-center text-indigo-600 shadow-inner">
          <Lock className="w-8 h-8" />
        </div>

        <div>
          <h3 className="text-base font-bold text-slate-900">Session Protected</h3>
          <p className="text-xs text-slate-500 mt-1">
            Logged in as <strong className="text-slate-800">{currentUser.fullName}</strong> ({currentUser.role})
          </p>
        </div>

        {error && (
          <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleUnlock} className="space-y-4">
          <div className="relative">
            <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="password"
              value={pin}
              onChange={e => setPin(e.target.value)}
              placeholder="Enter PIN (e.g. 1234) or password"
              autoFocus
              className="w-full pl-10 pr-4 py-2.5 text-center tracking-widest text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-bold"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Unlock Session</span>
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
