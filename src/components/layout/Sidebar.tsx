import React from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  History,
  BarChart3,
  Users,
  TrendingDown,
  Settings,
  ShieldCheck,
  Briefcase,
  AlertTriangle,
  FileSpreadsheet,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PWAInstallButton } from '../common/PWAInstallButton';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  onOpenSettingsModal: () => void;
  onOpenCsvModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  onOpenSettingsModal,
  onOpenCsvModal,
}) => {
  const { currentUser, lowStockProducts, products } = useApp();
  const isAdmin = currentUser.role === 'admin';

  return (
    <aside className="w-64 shrink-0 bg-slate-900 text-slate-300 flex flex-col justify-between border-r border-slate-800 h-full overflow-y-auto select-none">
      {/* Navigation Links */}
      <div className="p-4 space-y-6">
        {/* User Role Badge Banner */}
        <div
          className={`p-3 rounded-xl border flex items-center gap-3 ${
            isAdmin
              ? 'bg-indigo-950/60 border-indigo-800/80 text-indigo-200'
              : 'bg-emerald-950/60 border-emerald-800/80 text-emerald-200'
          }`}
        >
          <div
            className={`p-2 rounded-lg ${
              isAdmin ? 'bg-indigo-600 text-white' : 'bg-emerald-600 text-white'
            }`}
          >
            {isAdmin ? <ShieldCheck className="w-4 h-4" /> : <Briefcase className="w-4 h-4" />}
          </div>
          <div>
            <p className="text-xs font-bold text-white uppercase tracking-wider">
              {isAdmin ? 'Admin Console' : 'Seller Workspace'}
            </p>
            <p className="text-[11px] text-slate-400">
              {isAdmin ? 'Full Inventory & Rules Access' : 'Dozen Sales & 24h Cancel'}
            </p>
          </div>
        </div>

        {/* Menu Section */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Main Menu
          </p>

          {/* If Seller: first screen is Sales Dashboard */}
          {!isAdmin ? (
            <>
              <button
                type="button"
                onClick={() => onSelectTab('sales-pos')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeTab === 'sales-pos'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Sales Terminal (POS)</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectTab('my-orders')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeTab === 'my-orders'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <History className="w-4 h-4" />
                <span>My Sales History</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectTab('product-catalog')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeTab === 'product-catalog'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>Product Catalog & Stock</span>
              </button>
            </>
          ) : (
            /* Admin Menu */
            <>
              <button
                type="button"
                onClick={() => onSelectTab('dashboard')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/40'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Admin Dashboard</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectTab('sales-pos')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeTab === 'sales-pos'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/40'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <ShoppingCart className="w-4 h-4" />
                  <span>Create Sale (POS)</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded">
                  POS
                </span>
              </button>

              <button
                type="button"
                onClick={() => onSelectTab('products')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeTab === 'products'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/40'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Package className="w-4 h-4" />
                  <span>Products & Inventory</span>
                </div>
                {lowStockProducts.length > 0 && (
                  <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full">
                    {lowStockProducts.length} low
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => onSelectTab('orders')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeTab === 'orders'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/40'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <History className="w-4 h-4" />
                <span>All Company Sales</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectTab('reports')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeTab === 'reports'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/40'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Reports & Analytics</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectTab('price-logs')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeTab === 'price-logs'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/40'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <TrendingDown className="w-4 h-4" />
                <span>Last Price Logs</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectTab('users')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeTab === 'users'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/40'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>User Management</span>
              </button>
            </>
          )}
        </div>

        {/* Quick Utilities (Admin only) */}
        {isAdmin && (
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Data & Operations
            </p>
            <button
              type="button"
              onClick={onOpenCsvModal}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>CSV Bulk Import</span>
            </button>
            <button
              type="button"
              onClick={onOpenSettingsModal}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <Settings className="w-4 h-4 text-indigo-400" />
              <span>System Settings</span>
            </button>
          </div>
        )}

        {/* PWA Mobile & PC Install Action */}
        <div className="pt-2">
          <PWAInstallButton variant="sidebar" />
        </div>
      </div>

      {/* Bottom Inventory Health Indicator */}
      <div className="p-4 bg-slate-950/60 border-t border-slate-800/80">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-slate-400">Total SKUs:</span>
          <span className="font-semibold text-white">{products.length} Products</span>
        </div>
        {lowStockProducts.length > 0 ? (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-950/40 border border-amber-800/60 text-amber-300 text-xs">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
            <span className="leading-tight">
              <strong>{lowStockProducts.length} items</strong> below stock threshold
            </span>
          </div>
        ) : (
          <div className="text-[11px] text-emerald-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>All inventory healthy</span>
          </div>
        )}
      </div>
    </aside>
  );
};
