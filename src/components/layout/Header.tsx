import React, { useState, useEffect } from 'react';
import {
  Building2,
  Bell,
  User as UserIcon,
  ShieldCheck,
  Briefcase,
  ChevronDown,
  LogOut,
  RefreshCw,
  Clock,
  Check,
  Lock,
  Menu,
  KeyRound,
  Database,
  Fingerprint,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { checkBiometricsSupport } from '../../lib/biometrics';
import { NotificationsPopover } from '../common/NotificationsPopover';
import { PWAInstallButton } from '../common/PWAInstallButton';

interface HeaderProps {
  onNavigateTab: (tabId: string) => void;
  onOpenLoginModal: () => void;
  onOpenSettingsModal: () => void;
  onToggleMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onNavigateTab,
  onOpenLoginModal,
  onOpenSettingsModal,
  onToggleMobileMenu,
}) => {
  const {
    currentUser,
    users,
    switchUserById,
    logout,
    lockScreen,
    settings,
    notifications,
    isSupabaseConnected,
    isSupabaseLoading,
    refreshDataFromSupabase,
  } = useApp();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [time, setTime] = useState(new Date());
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    checkBiometricsSupport().then(res => setIsBiometricSupported(res.supported));
    return () => clearInterval(timer);
  }, []);

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 lg:px-8 py-3 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Left: Mobile Toggle & Brand Identity */}
      <div className="flex items-center gap-3">
        {onToggleMobileMenu && (
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            title="Toggle Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-900 via-indigo-900 to-indigo-700 text-white shadow-xs">
          <Building2 className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-slate-900 tracking-tight">
              {settings.companyName}
            </h1>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
              WMS
            </span>
          </div>
          <p className="text-xs text-slate-500 hidden md:block">
            Wholesale Dozen & Pairs Management System
          </p>
        </div>
      </div>

      {/* Right: Controls, Notifications, Lock & User Switcher */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* PWA Install Button */}
        <PWAInstallButton variant="compact" />

        {/* Supabase Live Connection Indicator */}
        <button
          type="button"
          onClick={() => {
            if (currentUser.role === 'admin') {
              onOpenSettingsModal();
            } else {
              refreshDataFromSupabase();
            }
          }}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-xl border bg-emerald-50/70 border-emerald-200 text-emerald-900 hover:bg-emerald-100/70 transition-colors cursor-pointer"
          title="Supabase PostgreSQL Live Database (Click to view database settings / sync)"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <Database className="w-3.5 h-3.5 text-emerald-700" />
          <span className="font-semibold text-[11px]">Supabase DB</span>
          {isSupabaseLoading && <RefreshCw className="w-3 h-3 text-emerald-600 animate-spin ml-0.5" />}
        </button>

        {/* System Time indicator */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-500 bg-slate-50 rounded-lg border border-slate-200">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>
            {time.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">({settings.timezone})</span>
        </div>

        {/* Lock Screen Button */}
        <button
          type="button"
          onClick={lockScreen}
          className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer flex items-center gap-1"
          title={isBiometricSupported ? "Lock POS Terminal (Fingerprint / PIN Protected)" : "Lock POS Terminal (PIN Protected)"}
        >
          {isBiometricSupported ? (
            <Fingerprint className="w-4 h-4 text-indigo-600" />
          ) : (
            <Lock className="w-4 h-4" />
          )}
        </button>

        {/* Notifications Icon with Popover */}
        <div className="relative">
          <button
            id="btn-notifications-toggle"
            type="button"
            onClick={() => setNotificationsOpen(prev => !prev)}
            className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            title="In-App Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-rose-500 rounded-full ring-2 ring-white">
                {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
              </span>
            )}
          </button>
          <NotificationsPopover
            isOpen={notificationsOpen}
            onClose={() => setNotificationsOpen(false)}
            onNavigateTab={onNavigateTab}
          />
        </div>

        {/* Role & User Switcher Dropdown */}
        <div className="relative">
          <button
            id="btn-user-menu"
            type="button"
            onClick={() => setUserDropdownOpen(prev => !prev)}
            className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
              currentUser.role === 'admin'
                ? 'bg-indigo-50/60 border-indigo-200 hover:bg-indigo-100/60 text-indigo-950'
                : 'bg-emerald-50/60 border-emerald-200 hover:bg-emerald-100/60 text-emerald-950'
            }`}
          >
            <div
              className={`flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold text-white ${
                currentUser.role === 'admin' ? 'bg-indigo-600' : 'bg-emerald-600'
              }`}
            >
              {currentUser.role === 'admin' ? (
                <ShieldCheck className="w-4 h-4" />
              ) : (
                <Briefcase className="w-4 h-4" />
              )}
            </div>
            <div className="text-left hidden sm:block">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-900">{currentUser.fullName}</span>
                <span
                  className={`text-[10px] uppercase font-bold px-1.5 py-0.2 rounded ${
                    currentUser.role === 'admin'
                      ? 'bg-indigo-200/80 text-indigo-900'
                      : 'bg-emerald-200/80 text-emerald-900'
                  }`}
                >
                  {currentUser.role}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 truncate max-w-[130px]">@{currentUser.username}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Switch User Dropdown */}
          {userDropdownOpen && (
            <div
              id="user-dropdown-menu"
              className="absolute right-0 top-12 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-100"
            >
              <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-800">Switch Active Demo Account</p>
                <p className="text-[11px] text-slate-500">Test different role permissions</p>
              </div>

              <div className="max-h-60 overflow-y-auto py-1 divide-y divide-slate-100">
                {users.map(u => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      switchUserById(u.id);
                      setUserDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2 text-left hover:bg-slate-50 transition-colors cursor-pointer ${
                      currentUser.id === u.id ? 'bg-indigo-50/50' : ''
                    } ${!u.isActive ? 'opacity-50' : ''}`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold text-white shrink-0 ${
                          u.role === 'admin' ? 'bg-indigo-600' : 'bg-emerald-600'
                        }`}
                      >
                        {u.role === 'admin' ? 'A' : 'S'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-slate-900 truncate">
                            {u.fullName}
                          </span>
                          {!u.isActive && (
                            <span className="text-[9px] px-1 bg-rose-100 text-rose-700 rounded">
                              Disabled
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 block truncate">
                          {u.role === 'admin' ? 'Administrator' : 'Wholesale Seller'}
                        </span>
                      </div>
                    </div>
                    {currentUser.id === u.id && (
                      <Check className="w-4 h-4 text-indigo-600 shrink-0 ml-1" />
                    )}
                  </button>
                ))}
              </div>

              <div className="p-2 border-t border-slate-100 bg-slate-50 flex gap-1">
                {currentUser.role === 'admin' && (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenSettingsModal();
                      setUserDropdownOpen(false);
                    }}
                    className="flex-1 text-center py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
                  >
                    Settings
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    onOpenLoginModal();
                    setUserDropdownOpen(false);
                  }}
                  className="flex-1 text-center py-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-100/50 rounded-lg transition-colors cursor-pointer"
                >
                  Auth Portal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setUserDropdownOpen(false);
                  }}
                  className="p-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

