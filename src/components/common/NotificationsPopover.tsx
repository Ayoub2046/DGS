import React, { useRef, useEffect } from 'react';
import {
  Bell,
  AlertTriangle,
  TrendingDown,
  XCircle,
  Info,
  Check,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getRelativeTime } from '../../utils/formatters';

interface NotificationsPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tabId: string) => void;
}

export const NotificationsPopover: React.FC<NotificationsPopoverProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
}) => {
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearNotification,
  } = useApp();

  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'low_stock':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'price_change':
        return <TrendingDown className="w-4 h-4 text-blue-500" />;
      case 'order_cancelled':
        return <XCircle className="w-4 h-4 text-rose-500" />;
      default:
        return <Info className="w-4 h-4 text-indigo-500" />;
    }
  };

  return (
    <div
      ref={popoverRef}
      id="notifications-popover"
      className="absolute right-0 top-12 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900 text-white">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-semibold">In-App Notifications</h3>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] font-bold bg-indigo-500 text-white rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllNotificationsAsRead}
            className="text-[11px] font-medium text-slate-300 hover:text-white transition-colors"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-300" />
            <p className="text-xs">No notifications yet.</p>
          </div>
        ) : (
          notifications.map(item => (
            <div
              key={item.id}
              onClick={() => {
                markNotificationAsRead(item.id);
                if (item.linkTab) {
                  onNavigateTab(item.linkTab);
                  onClose();
                }
              }}
              className={`p-3.5 flex gap-3 items-start transition-colors cursor-pointer ${
                item.read ? 'bg-white hover:bg-slate-50' : 'bg-indigo-50/40 hover:bg-indigo-50/70'
              }`}
            >
              <div className="p-2 rounded-lg bg-slate-100 mt-0.5 shrink-0">
                {getIcon(item.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h4 className={`text-xs font-semibold truncate ${item.read ? 'text-slate-700' : 'text-slate-900'}`}>
                    {item.title}
                  </h4>
                  <span className="text-[10px] text-slate-400 shrink-0">
                    {getRelativeTime(item.timestamp)}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed line-clamp-2">
                  {item.message}
                </p>
                {item.linkTab && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-indigo-600 hover:text-indigo-700 mt-1.5">
                    View in {item.linkTab} <ExternalLink className="w-2.5 h-2.5" />
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  clearNotification(item.id);
                }}
                className="text-slate-300 hover:text-rose-500 p-1 transition-colors"
                title="Dismiss"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="p-2 bg-slate-50 border-t border-slate-100 text-center">
        <p className="text-[10px] text-slate-400">
          In-app alerts automatically trigger on low inventory and Last Price adjustments.
        </p>
      </div>
    </div>
  );
};
