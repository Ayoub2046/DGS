import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Package,
  History,
  LayoutDashboard,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  Building2,
  ChevronDown,
  User,
  ShieldCheck,
  Briefcase,
  LogOut,
  Settings,
  Lock,
  Search,
  Sparkles,
  Menu,
  Clock,
  Wifi,
  WifiOff,
  Database,
  RefreshCw,
  Fingerprint,
  KeyRound,
  Trash2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  checkBiometricsSupport,
  isUserBiometricEnrolled,
  removeUserBiometrics,
  BiometricSupportInfo,
} from '../../lib/biometrics';
import { PWAInstallButton } from '../common/PWAInstallButton';
import { BiometricEnrollmentModal } from '../common/BiometricEnrollmentModal';

interface HeaderProps {
  onNavigateTab: (tab: string) => void;
  onOpenLoginModal: () => void;
  onOpenSettingsModal: () => void;
  onToggleMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onNavigateTab,
  onOpenLoginModal,
  onOpenSettingsModal,
  onToggleMobileMenu,
}) => {
  const {
    currentUser,
    logout,
    lockScreen,
    settings,
    notifications,
    isSupabaseConnected,
    isSupabaseLoading,
    refreshDataFromSupabase,
    supabaseSyncError,
  } = useApp();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isBiometricEnrollModalOpen, setIsBiometricEnrollModalOpen] = useState(false);
  const [time, setTime] = useState(new Date());
  const [biometricInfo, setBiometricInfo] = useState<BiometricSupportInfo>({
    supported: true,
    platformAuthenticator: false,
    type: 'fingerprint',
    label: 'Fingerprint Sensor',
    details: '',
  });
  const [isBioEnrolled, setIsBioEnrolled] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    checkBiometricsSupport().then(info => {
      setBiometricInfo(info);
      if (currentUser?.id) {
        setIsBioEnrolled(isUserBiometricEnrolled(currentUser.id));
      }
    });
    return () => clearInterval(timer);
  }, [currentUser?.id]);

  const handleEnrollmentSuccess = () => {
    if (currentUser?.id) {
      setIsBioEnrolled(isUserBiometricEnrolled(currentUser.id));
    }
  };

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  return (
    <header
      id="wms-app-header"
      className="h-[60px] bg-white border-b border-slate-200 px-4 flex items-center justify-between z-30 shrink-0 select-none shadow-xs sticky top-0"
    >
      {/* Left: Mobile Toggle & Brand / Company Title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="p-2 md:hidden text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-indigo-600/20">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 text-sm tracking-tight">
                {settings.companyName}
              </span>
              <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                ERP
              </span>
            </div>
            <p className="text-[10px] text-slate-600 font-medium hidden sm:block">
              {settings.tagline || 'Wholesale Distribution & POS Management'}
            </p>
          </div>
        </div>
      </div>

      {/* Middle: System Clock & Database Status */}
      <div className="hidden lg:flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-600">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-mono font-medium text-slate-700">
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        </div>

        {/* Supabase Cloud Sync Status Indicator */}
        <div
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border text-[11px] font-medium transition-colors ${
            isSupabaseConnected
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-amber-50 text-amber-800 border-amber-200'
          }`}
          title={
            isSupabaseConnected
              ? 'Supabase Cloud Database connected and synchronized.'
              : supabaseSyncError || 'Offline / Local cache mode active'
          }
        >
          <Database className="w-3.5 h-3.5" />
          <span>{isSupabaseConnected ? 'Cloud Sync Online' : 'Local Cache Active'}</span>
          <button
            type="button"
            onClick={() => refreshDataFromSupabase()}
            disabled={isSupabaseLoading}
            className="ml-1 p-0.5 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            title="Refresh database"
          >
            <RefreshCw className={`w-3 h-3 ${isSupabaseLoading ? 'animate-spin text-indigo-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Right Controls: PWA Install, Lock, Notifications, User Profile */}
      <div className="flex items-center gap-2">
        <PWAInstallButton variant="compact" />

        {/* Lock Terminal Action */}
        <button
          type="button"
          onClick={lockScreen}
          className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer flex items-center gap-1"
          title="Lock Terminal Screen"
        >
          <Lock className="w-4 h-4" />
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

        {/* Secure User Profile Dropdown */}
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

          {/* Secure User Dropdown Menu */}
          {userDropdownOpen && (
            <div
              id="user-dropdown-menu"
              className="absolute right-0 top-12 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-100"
            >
              {/* Profile Card Header */}
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white shadow-sm ${
                      currentUser.role === 'admin' ? 'bg-indigo-600' : 'bg-emerald-600'
                    }`}
                  >
                    {currentUser.role === 'admin' ? (
                      <ShieldCheck className="w-5 h-5" />
                    ) : (
                      <Briefcase className="w-5 h-5" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{currentUser.fullName}</p>
                    <p className="text-[11px] text-slate-500 font-mono">@{currentUser.username}</p>
                    <span className="inline-block mt-0.5 text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800">
                      {currentUser.role === 'admin' ? 'System Administrator' : 'Wholesale POS Seller'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Hardware Biometric Fingerprint Registration Section */}
              <div className="px-4 py-2.5 border-b border-slate-100 bg-indigo-50/30 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <Fingerprint className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Device Passkey & Biometrics</span>
                  </span>
                  {isBioEnrolled ? (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded">
                      Enrolled
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400">Not Setup</span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setUserDropdownOpen(false);
                    setIsBiometricEnrollModalOpen(true);
                  }}
                  className="w-full py-1.5 px-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[11px] font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Fingerprint className="w-3 h-3" />
                  <span>{isBioEnrolled ? 'Manage Device Fingerprint' : 'Register Fingerprint / Passkey'}</span>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="p-2 space-y-1 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    lockScreen();
                    setUserDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer text-left"
                >
                  <Lock className="w-4 h-4 text-indigo-600" />
                  <span>Lock Terminal Screen</span>
                </button>

                {currentUser.role === 'admin' && (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenSettingsModal();
                      setUserDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer text-left"
                  >
                    <Building2 className="w-4 h-4 text-slate-500" />
                    <span>Company & Database Settings</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    onOpenLoginModal();
                    setUserDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer text-left"
                >
                  <KeyRound className="w-4 h-4 text-indigo-500" />
                  <span>Switch Account (Enter Credentials)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setUserDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer text-left font-medium"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  <span>Sign Out of Terminal</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Biometric Enrollment Wizard */}
      <BiometricEnrollmentModal
        isOpen={isBiometricEnrollModalOpen}
        onClose={() => {
          setIsBiometricEnrollModalOpen(false);
          handleEnrollmentSuccess();
        }}
        onEnrollmentSuccess={handleEnrollmentSuccess}
      />
    </header>
  );
};

interface NotificationsPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: string) => void;
}

const NotificationsPopover: React.FC<NotificationsPopoverProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
}) => {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead } = useApp();

  if (!isOpen) return null;

  return (
    <div
      id="notifications-popover"
      className="absolute right-0 top-12 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden py-2 animate-in fade-in zoom-in-95 duration-100"
    >
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="font-bold text-xs text-slate-900">Notifications</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
            {notifications.length}
          </span>
        </div>
        {notifications.length > 0 && (
          <button
            type="button"
            onClick={markAllNotificationsAsRead}
            className="text-[11px] text-slate-400 hover:text-slate-700 cursor-pointer font-medium"
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
        {notifications.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            <CheckCircle2 className="w-8 h-8 text-slate-300 mx-auto mb-1.5" />
            <p>No new notifications</p>
          </div>
        ) : (
          notifications.map(notif => (
            <div
              key={notif.id}
              onClick={() => {
                markNotificationAsRead(notif.id);
                if (notif.type === 'low_stock') {
                  onNavigateTab('products');
                  onClose();
                } else if (notif.type === 'order_cancelled') {
                  onNavigateTab('orders');
                  onClose();
                }
              }}
              className={`p-3 text-xs flex items-start gap-2.5 transition-colors cursor-pointer ${
                notif.read ? 'bg-white opacity-70' : 'bg-indigo-50/40 hover:bg-indigo-50/70'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {notif.type === 'low_stock' ? (
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                ) : notif.type === 'order_cancelled' ? (
                  <AlertTriangle className="w-4 h-4 text-rose-500" />
                ) : (
                  <Info className="w-4 h-4 text-indigo-500" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-800 leading-snug">{notif.title}</p>
                <p className="text-slate-500 text-[11px] mt-0.5 leading-normal line-clamp-2">
                  {notif.message}
                </p>
                <span className="text-[10px] text-slate-400 mt-1 block font-mono">
                  {new Date(notif.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
