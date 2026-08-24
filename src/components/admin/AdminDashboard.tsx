import React, { useMemo } from 'react';
import {
  TrendingUp,
  DollarSign,
  Package,
  AlertTriangle,
  ShoppingCart,
  Users,
  Layers,
  ArrowUpRight,
  TrendingDown,
  FileSpreadsheet,
  Plus,
  ArrowRight,
  ShieldCheck,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  formatCurrency,
  formatDozens,
  formatPairs,
  formatDateTime,
  formatDate,
} from '../../utils/formatters';
import { Order, Product } from '../../types';

interface AdminDashboardProps {
  onNavigateTab: (tabId: string) => void;
  onOpenAddProductModal: () => void;
  onOpenCsvModal: () => void;
  onViewReceipt: (order: Order) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onNavigateTab,
  onOpenAddProductModal,
  onOpenCsvModal,
  onViewReceipt,
}) => {
  const {
    products,
    orders,
    users,
    lowStockProducts,
    priceChangeLogs,
    settings,
    navigateTo,
  } = useApp();

  // Calculate Today's Date bounds
  const todayDateString = new Date().toISOString().slice(0, 10);

  // Today's Orders
  const todayOrders = useMemo(() => {
    return orders.filter(
      o => o.status === 'completed' && o.date.slice(0, 10) === todayDateString
    );
  }, [orders, todayDateString]);

  // Today's Sales Metrics
  const todayMetrics = useMemo(() => {
    const revenue = todayOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const profit = todayOrders.reduce((sum, o) => sum + o.totalProfit, 0);
    const dozens = todayOrders.reduce((sum, o) => sum + o.totalDozens, 0);
    const pairs = todayOrders.reduce((sum, o) => sum + o.totalPairs, 0);
    return {
      revenue,
      profit,
      dozens: Number(dozens.toFixed(2)),
      pairs,
      count: todayOrders.length,
    };
  }, [todayOrders]);

  // All-time / Current Month Metrics
  const allTimeCompletedOrders = useMemo(() => {
    return orders.filter(o => o.status === 'completed');
  }, [orders]);

  const allTimeRevenue = allTimeCompletedOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const allTimeProfit = allTimeCompletedOrders.reduce((sum, o) => sum + o.totalProfit, 0);
  const allTimeMargin = allTimeRevenue > 0 ? (allTimeProfit / allTimeRevenue) * 100 : 0;
  const allTimePairs = allTimeCompletedOrders.reduce((sum, o) => sum + o.totalPairs, 0);
  const allTimeDozens = allTimeCompletedOrders.reduce((sum, o) => sum + o.totalDozens, 0);

  // Top Products Widget Calculation
  const topProducts = useMemo(() => {
    const productSalesMap = new Map<
      string,
      { product: Product | undefined; name: string; sku: string; dozensSold: number; revenue: number }
    >();

    allTimeCompletedOrders.forEach(order => {
      order.items.forEach(item => {
        const existing = productSalesMap.get(item.productId) || {
          product: products.find(p => p.id === item.productId),
          name: item.productName,
          sku: item.sku,
          dozensSold: 0,
          revenue: 0,
        };
        existing.dozensSold += item.quantityDozens;
        existing.revenue += item.subtotal;
        productSalesMap.set(item.productId, existing);
      });
    });

    return Array.from(productSalesMap.values())
      .sort((a, b) => b.dozensSold - a.dozensSold)
      .slice(0, 5);
  }, [allTimeCompletedOrders, products]);

  // Seller Performance breakdown
  const sellerStats = useMemo(() => {
    const sellerMap = new Map<
      string,
      { sellerName: string; orderCount: number; dozensSold: number; revenue: number; profit: number }
    >();

    allTimeCompletedOrders.forEach(order => {
      const existing = sellerMap.get(order.sellerId) || {
        sellerName: order.sellerName,
        orderCount: 0,
        dozensSold: 0,
        revenue: 0,
        profit: 0,
      };
      existing.orderCount += 1;
      existing.dozensSold += order.totalDozens;
      existing.revenue += order.totalAmount;
      existing.profit += order.totalProfit;
      sellerMap.set(order.sellerId, existing);
    });

    return Array.from(sellerMap.values()).sort((a, b) => b.revenue - a.revenue);
  }, [allTimeCompletedOrders]);

  // Total warehouse inventory valuation
  const inventoryValuation = useMemo(() => {
    let totalCost = 0;
    let totalFloorValue = 0;
    let totalPairs = 0;

    products.forEach(p => {
      const dozens = p.quantityPairs / 12;
      totalCost += dozens * p.costPerDozen;
      totalFloorValue += dozens * p.lastPrice;
      totalPairs += p.quantityPairs;
    });

    return {
      totalCost: Number(totalCost.toFixed(2)),
      totalFloorValue: Number(totalFloorValue.toFixed(2)),
      totalPairs,
      totalDozens: Number((totalPairs / 12).toFixed(2)),
    };
  }, [products]);

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-slate-900 tracking-tight">
            Wholesale Executive Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time wholesale sales performance, low-stock inventory alerts, and pricing floor health.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="btn-admin-pos"
            type="button"
            onClick={() => onNavigateTab('sales-pos')}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-xs"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>New Sale POS</span>
          </button>
          <button
            id="btn-admin-add-product"
            type="button"
            onClick={onOpenAddProductModal}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-600" />
            <span>Add Product</span>
          </button>
          <button
            id="btn-admin-csv-import"
            type="button"
            onClick={onOpenCsvModal}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition-colors shadow-xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>CSV Import</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Widgets Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Widget 1: Today's Sales (PRD requirement) */}
        <div className="p-5 bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl shadow-sm border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-indigo-200">
              <span className="font-semibold uppercase tracking-wider">Today's Sales Value</span>
              <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-300">
                <DollarSign className="w-4 h-4" />
              </span>
            </div>
            <p className="text-2xl font-bold font-mono text-white mt-2">
              {formatCurrency(todayMetrics.revenue, settings.currencySymbol, settings.currencyCode)}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-indigo-900/60 flex items-center justify-between text-xs text-indigo-200">
            <span>{todayMetrics.count} orders today</span>
            <span className="font-mono font-semibold">
              {todayMetrics.dozens} doz ({todayMetrics.pairs} pairs)
            </span>
          </div>
        </div>

        {/* Widget 2: Gross Profit & Margin */}
        <div className="p-5 bg-white rounded-2xl shadow-xs border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold uppercase tracking-wider">Total Gross Profit</span>
              <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                <TrendingUp className="w-4 h-4" />
              </span>
            </div>
            <p className="text-2xl font-bold font-mono text-slate-900 mt-2">
              {formatCurrency(allTimeProfit, settings.currencySymbol, settings.currencyCode)}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Avg Profit Margin:</span>
            <span className="font-bold text-emerald-600 font-mono">
              {allTimeMargin.toFixed(1)}% margin
            </span>
          </div>
        </div>

        {/* Widget 3: Total Warehouse Valuation */}
        <div className="p-5 bg-white rounded-2xl shadow-xs border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold uppercase tracking-wider">Warehouse Stock Value</span>
              <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                <Package className="w-4 h-4" />
              </span>
            </div>
            <p className="text-2xl font-bold font-mono text-slate-900 mt-2">
              {formatCurrency(inventoryValuation.totalCost, settings.currencySymbol, settings.currencyCode)}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Total on hand:</span>
            <span className="font-bold text-slate-800 font-mono">
              {inventoryValuation.totalPairs.toLocaleString()} pairs ({inventoryValuation.totalDozens} doz)
            </span>
          </div>
        </div>

        {/* Widget 4: Low Stock Alert (PRD requirement) */}
        <div
          onClick={() => navigateTo('products', { stockFilter: 'low_stock' })}
          className={`p-5 rounded-2xl shadow-xs border flex flex-col justify-between cursor-pointer transition-all ${
            lowStockProducts.length > 0
              ? 'bg-amber-50/70 border-amber-300 hover:bg-amber-50'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div>
            <div className="flex items-center justify-between text-xs">
              <span
                className={`font-semibold uppercase tracking-wider ${
                  lowStockProducts.length > 0 ? 'text-amber-800' : 'text-slate-500'
                }`}
              >
                Low Stock Alerts (&lt;{settings.lowStockThresholdPairs} pairs)
              </span>
              <span
                className={`p-1.5 rounded-lg ${
                  lowStockProducts.length > 0
                    ? 'bg-amber-200 text-amber-900'
                    : 'bg-emerald-50 text-emerald-600'
                }`}
              >
                <AlertTriangle className="w-4 h-4" />
              </span>
            </div>
            <p
              className={`text-2xl font-bold font-mono mt-2 ${
                lowStockProducts.length > 0 ? 'text-amber-950' : 'text-slate-900'
              }`}
            >
              {lowStockProducts.length} Products
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-amber-200/60 flex items-center justify-between text-xs text-amber-800">
            <span>Threshold: {settings.lowStockThresholdPairs} pairs</span>
            <span className="font-semibold flex items-center gap-1">
              View Items <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>

      {/* Middle Section: Top Products & Low Stock Alerts Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top Products Widget (PRD requirement) - 7 cols */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Top Selling Wholesale Products
              </h2>
              <p className="text-xs text-slate-500">Ranked by volume in dozens & pairs sold</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('reports')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              Full Reports <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {topProducts.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No sales completed yet.</p>
            ) : (
              topProducts.map((tp, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-indigo-100 text-indigo-800 text-xs font-bold font-mono">
                      #{idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{tp.name}</p>
                      <p className="text-[11px] text-slate-500 font-mono">SKU: {tp.sku}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-slate-900 font-mono">
                      {tp.dozensSold.toFixed(1)} doz ({Math.round(tp.dozensSold * 12)} pairs)
                    </p>
                    <p className="text-[11px] text-emerald-600 font-mono font-medium">
                      {formatCurrency(tp.revenue, settings.currencySymbol, settings.currencyCode)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Low Stock Alerts Widget (PRD requirement) - 5 cols */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Low Stock Warning
              </h2>
            </div>
            <span className="text-xs text-slate-500">&lt; {settings.lowStockThresholdPairs} pairs</span>
          </div>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {lowStockProducts.length === 0 ? (
              <div className="p-8 text-center bg-emerald-50/50 rounded-xl border border-emerald-100 text-emerald-800">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-600" />
                <p className="text-xs font-bold">All Products Well Stocked</p>
                <p className="text-[11px] text-emerald-600 mt-0.5">
                  No SKUs currently below {settings.lowStockThresholdPairs} pairs.
                </p>
              </div>
            ) : (
              lowStockProducts.map(prod => {
                const isZero = prod.quantityPairs <= 0;
                return (
                  <div
                    key={prod.id}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-2 ${
                      isZero
                        ? 'bg-rose-50 border-rose-200 text-rose-950'
                        : 'bg-amber-50/60 border-amber-200 text-amber-950'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold truncate">{prod.name}</span>
                        {isZero && (
                          <span className="px-1.5 py-0.2 text-[9px] font-bold bg-rose-200 text-rose-800 rounded">
                            OUT
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 font-mono">SKU: {prod.sku}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold font-mono block">
                        {prod.quantityPairs} pairs
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        ({formatDozens(prod.quantityPairs / 12)})
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Seller Performance & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Seller Leaderboard - 5 cols */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Seller Sales Leaderboard
              </h2>
              <p className="text-xs text-slate-500">Transactions & revenue per seller</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('users')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Manage
            </button>
          </div>

          <div className="space-y-3">
            {sellerStats.map((stat, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                    {stat.sellerName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{stat.sellerName}</p>
                    <p className="text-[10px] text-slate-500">
                      {stat.orderCount} sales • {stat.dozensSold.toFixed(1)} doz sold
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-emerald-600 font-mono">
                    {formatCurrency(stat.revenue, settings.currencySymbol, settings.currencyCode)}
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono">
                    Profit: {formatCurrency(stat.profit, settings.currencySymbol, settings.currencyCode)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Company Orders - 7 cols */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Recent Wholesale Transactions
              </h2>
              <p className="text-xs text-slate-500">Latest completed and processed sales</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('orders')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              All Orders <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Receipt & Time</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Seller</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                  <th className="py-2.5 px-3 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {orders.slice(0, 5).map(order => (
                  <tr key={order.id} className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-3">
                      <span className="font-bold text-slate-900 font-mono block">
                        {order.receiptNumber}
                      </span>
                      <span className="text-[10px] text-slate-400">{formatDateTime(order.date)}</span>
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-800">
                      {order.customerName}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{order.sellerName}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900 font-mono">
                      {formatCurrency(order.totalAmount, settings.currencySymbol, settings.currencyCode)}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => onViewReceipt(order)}
                        className="px-2 py-1 text-[11px] font-semibold text-indigo-600 hover:bg-indigo-50 rounded border border-indigo-200"
                      >
                        Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
