import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { LandingHomePage } from './components/home/LandingHomePage';
import { SellerSalesDashboard } from './components/seller/SellerSalesDashboard';
import { SellerOrderHistory } from './components/seller/SellerOrderHistory';
import { ProductCatalogView } from './components/seller/ProductCatalogView';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { ProductManagement } from './components/admin/ProductManagement';
import { OrderManagement } from './components/admin/OrderManagement';
import { ReportsAnalytics } from './components/admin/ReportsAnalytics';
import { PriceChangeLogsView } from './components/admin/PriceChangeLogsView';
import { UserManagement } from './components/admin/UserManagement';
import { CompanySettingsView } from './components/admin/CompanySettingsView';
import { ReceiptModal } from './components/common/ReceiptModal';
import { CsvImportModal } from './components/admin/CsvImportModal';
import { LoginModal } from './components/common/LoginModal';
import { LockScreenModal } from './components/common/LockScreenModal';
import { Order } from './types';
import {
  ShieldAlert,
  ArrowLeft,
  ShoppingCart,
  Package,
  History,
  LayoutDashboard,
  Menu,
} from 'lucide-react';

const MainAppContent: React.FC = () => {
  const {
    currentUser,
    activeTab,
    navigateTo,
    isAuthenticated,
    recentActiveReceipt,
    setRecentActiveReceipt,
  } = useApp();

  // Mobile sidebar visibility
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Modals
  const [activeReceiptOrder, setActiveReceiptOrder] = useState<Order | null>(null);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Sync recent active receipt to modal
  useEffect(() => {
    if (recentActiveReceipt) {
      setActiveReceiptOrder(recentActiveReceipt);
    }
  }, [recentActiveReceipt]);

  const handleOpenReceipt = (order: Order) => {
    setActiveReceiptOrder(order);
  };

  const handleCloseReceipt = () => {
    setActiveReceiptOrder(null);
    setRecentActiveReceipt(null);
  };

  const isAdmin = currentUser.role === 'admin';

  // If user is not authenticated, display the public Home / Landing Portal Page
  if (!isAuthenticated) {
    return (
      <div id="wms-root-app" className="min-h-screen w-full bg-slate-950">
        <LandingHomePage onOpenLoginModal={() => setIsLoginModalOpen(true)} />
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
        />
      </div>
    );
  }

  return (
    <div
      id="wms-root-app"
      className="h-screen w-full bg-slate-100 flex flex-col font-sans antialiased text-slate-800 selection:bg-indigo-500 selection:text-white overflow-hidden"
    >
      {/* Top Application Header */}
      <Header
        onNavigateTab={navigateTo}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onOpenSettingsModal={() => navigateTo('settings')}
        onToggleMobileMenu={() => setIsMobileSidebarOpen(prev => !prev)}
      />

      <div className="flex-1 flex flex-row overflow-hidden relative w-full h-[calc(100vh-61px)]">
        {/* Mobile Backdrop */}
        {isMobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-slate-900/60 z-30 md:hidden backdrop-blur-xs"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}

        {/* Navigation Sidebar (Fixed & Sticky across all scrolling) */}
        <div
          className={`fixed md:relative inset-y-0 left-0 z-40 h-full shrink-0 transform md:transform-none transition-transform duration-200 ease-in-out ${
            isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
        >
          <Sidebar
            activeTab={activeTab}
            onSelectTab={tabId => {
              navigateTo(tabId);
              setIsMobileSidebarOpen(false);
            }}
            onOpenSettingsModal={() => {
              navigateTo('settings');
              setIsMobileSidebarOpen(false);
            }}
            onOpenCsvModal={() => {
              setIsCsvModalOpen(true);
              setIsMobileSidebarOpen(false);
            }}
          />
        </div>

        {/* Main Content Viewport with independent scroll */}
        <main className="flex-1 h-full overflow-y-auto relative w-full bg-slate-100">
          {/* Seller / Common Views */}
          {activeTab === 'sales-pos' && (
            <SellerSalesDashboard onOrderCreated={handleOpenReceipt} />
          )}

          {(activeTab === 'seller-orders' || activeTab === 'my-orders') && (
            <SellerOrderHistory onViewReceipt={handleOpenReceipt} />
          )}

          {(activeTab === 'product-catalog' || activeTab === 'catalog') && (
            <ProductCatalogView />
          )}

          {/* Admin Views with RBAC Protection */}
          {activeTab === 'admin-dashboard' && (
            isAdmin ? (
              <AdminDashboard
                onNavigateTab={navigateTo}
                onOpenAddProductModal={() => navigateTo('products')}
                onOpenCsvModal={() => setIsCsvModalOpen(true)}
                onViewReceipt={handleOpenReceipt}
              />
            ) : (
              <AccessDeniedView onReturnToPos={() => navigateTo('sales-pos')} />
            )
          )}

          {activeTab === 'products' && (
            isAdmin ? (
              <ProductManagement onOpenCsvModal={() => setIsCsvModalOpen(true)} />
            ) : (
              <ProductCatalogView />
            )
          )}

          {activeTab === 'orders' && (
            isAdmin ? (
              <OrderManagement onViewReceipt={handleOpenReceipt} />
            ) : (
              <SellerOrderHistory onViewReceipt={handleOpenReceipt} />
            )
          )}

          {activeTab === 'reports' && (
            isAdmin ? (
              <ReportsAnalytics />
            ) : (
              <AccessDeniedView onReturnToPos={() => navigateTo('sales-pos')} />
            )
          )}

          {(activeTab === 'price-history' || activeTab === 'price-logs') && (
            isAdmin ? (
              <PriceChangeLogsView />
            ) : (
              <AccessDeniedView onReturnToPos={() => navigateTo('sales-pos')} />
            )
          )}

          {activeTab === 'users' && (
            isAdmin ? (
              <UserManagement />
            ) : (
              <AccessDeniedView onReturnToPos={() => navigateTo('sales-pos')} />
            )
          )}

          {activeTab === 'settings' && (
            isAdmin ? (
              <CompanySettingsView />
            ) : (
              <AccessDeniedView onReturnToPos={() => navigateTo('sales-pos')} />
            )
          )}
        </main>
      </div>

      {/* Floating Sticky Bottom Navigation Bar for Mobile / Compact Viewports */}
      <nav className="fixed bottom-0 inset-x-0 z-30 md:hidden bg-slate-900/95 backdrop-blur-md border-t border-slate-800 text-slate-300 py-1 px-2 flex items-center justify-around shadow-lg select-none">
        {isAdmin ? (
          <>
            <button
              type="button"
              onClick={() => navigateTo('admin-dashboard')}
              className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl text-[10px] font-semibold transition-colors ${
                activeTab === 'admin-dashboard' ? 'text-indigo-400 bg-white/10 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>
            <button
              type="button"
              onClick={() => navigateTo('sales-pos')}
              className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl text-[10px] font-semibold transition-colors ${
                activeTab === 'sales-pos' ? 'text-emerald-400 bg-white/10 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>POS</span>
            </button>
            <button
              type="button"
              onClick={() => navigateTo('products')}
              className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl text-[10px] font-semibold transition-colors ${
                activeTab === 'products' ? 'text-indigo-400 bg-white/10 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Products</span>
            </button>
            <button
              type="button"
              onClick={() => navigateTo('orders')}
              className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl text-[10px] font-semibold transition-colors ${
                activeTab === 'orders' ? 'text-indigo-400 bg-white/10 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Orders</span>
            </button>
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(prev => !prev)}
              className="flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl text-[10px] font-semibold text-slate-400 hover:text-white"
            >
              <Menu className="w-4 h-4" />
              <span>Menu</span>
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => navigateTo('sales-pos')}
              className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl text-[10px] font-semibold transition-colors ${
                activeTab === 'sales-pos' ? 'text-emerald-400 bg-white/10 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Sales POS</span>
            </button>
            <button
              type="button"
              onClick={() => navigateTo('my-orders')}
              className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl text-[10px] font-semibold transition-colors ${
                activeTab === 'my-orders' ? 'text-emerald-400 bg-white/10 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <History className="w-4 h-4" />
              <span>My Orders</span>
            </button>
            <button
              type="button"
              onClick={() => navigateTo('product-catalog')}
              className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl text-[10px] font-semibold transition-colors ${
                activeTab === 'product-catalog' ? 'text-emerald-400 bg-white/10 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Catalog</span>
            </button>
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(prev => !prev)}
              className="flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl text-[10px] font-semibold text-slate-400 hover:text-white"
            >
              <Menu className="w-4 h-4" />
              <span>More</span>
            </button>
          </>
        )}
      </nav>

      {/* Global Receipt Modal */}
      <ReceiptModal
        order={activeReceiptOrder}
        onClose={handleCloseReceipt}
      />

      {/* Global CSV Import Modal */}
      <CsvImportModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
      />

      {/* Global Authentication / Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />

      {/* Screen Lock Security Overlay */}
      <LockScreenModal />
    </div>
  );
};

const AccessDeniedView: React.FC<{ onReturnToPos: () => void }> = ({ onReturnToPos }) => {
  return (
    <div className="p-8 max-w-lg mx-auto text-center mt-12 bg-white rounded-3xl border border-rose-200 shadow-sm p-8 space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mx-auto">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <h2 className="text-lg font-bold text-slate-900">Restricted Administrator Section</h2>
      <p className="text-xs text-slate-600 leading-relaxed">
        Your current active account does not have permission to view or manage this administrative section. Please return to the Sales POS terminal or switch to an Administrator profile.
      </p>
      <button
        type="button"
        onClick={onReturnToPos}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Sales POS</span>
      </button>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
