import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  Calendar,
  Download,
  FileSpreadsheet,
  FileText,
  DollarSign,
  TrendingUp,
  Package,
  Users,
  Filter,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  formatCurrency,
  formatDozens,
  formatPairs,
  formatDate,
} from '../../utils/formatters';
import { generateReportPdf } from '../../utils/pdfGenerator';
import { downloadCsvFile, exportOrdersToCsv } from '../../utils/csvHelper';

export const ReportsAnalytics: React.FC = () => {
  const { orders, products, users, settings } = useApp();

  // Date Range Filter
  const [dateRangePreset, setDateRangePreset] = useState<'today' | '7d' | '30d' | 'this_month' | 'custom'>('30d');
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0, 10);
  });
  const [endDate, setEndDate] = useState<string>(() => {
    return new Date().toISOString().slice(0, 10);
  });

  // Handle Preset Change
  const handlePresetChange = (preset: 'today' | '7d' | '30d' | 'this_month' | 'custom') => {
    setDateRangePreset(preset);
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    if (preset === 'today') {
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (preset === '7d') {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      setStartDate(d.toISOString().slice(0, 10));
      setEndDate(todayStr);
    } else if (preset === '30d') {
      const d = new Date();
      d.setDate(d.getDate() - 30);
      setStartDate(d.toISOString().slice(0, 10));
      setEndDate(todayStr);
    } else if (preset === 'this_month') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
      setStartDate(startOfMonth);
      setEndDate(todayStr);
    }
  };

  // Filter Completed Orders within Date Range
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      if (o.status !== 'completed') return false;
      const orderDay = o.date.slice(0, 10);
      return orderDay >= startDate && orderDay <= endDate;
    });
  }, [orders, startDate, endDate]);

  // Aggregate Metrics
  const summary = useMemo(() => {
    const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalCost = filteredOrders.reduce((sum, o) => sum + o.totalCost, 0);
    const totalProfit = filteredOrders.reduce((sum, o) => sum + o.totalProfit, 0);
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
    const totalDozens = filteredOrders.reduce((sum, o) => sum + o.totalDozens, 0);
    const totalPairs = filteredOrders.reduce((sum, o) => sum + o.totalPairs, 0);

    return {
      totalRevenue,
      totalCost,
      totalProfit,
      profitMargin,
      totalDozens: Number(totalDozens.toFixed(2)),
      totalPairs,
      orderCount: filteredOrders.length,
      avgOrderValue: filteredOrders.length > 0 ? totalRevenue / filteredOrders.length : 0,
    };
  }, [filteredOrders]);

  // Seller Breakdown
  const sellerReportData = useMemo(() => {
    const map = new Map<
      string,
      { sellerName: string; orderCount: number; dozensSold: number; revenue: number; profit: number }
    >();

    filteredOrders.forEach(order => {
      const existing = map.get(order.sellerId) || {
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
      map.set(order.sellerId, existing);
    });

    return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue);
  }, [filteredOrders]);

  // Product Breakdown
  const productReportData = useMemo(() => {
    const map = new Map<
      string,
      { productName: string; sku: string; dozensSold: number; revenue: number; profit: number }
    >();

    filteredOrders.forEach(order => {
      order.items.forEach(item => {
        const existing = map.get(item.productId) || {
          productName: item.productName,
          sku: item.sku,
          dozensSold: 0,
          revenue: 0,
          profit: 0,
        };
        existing.dozensSold += item.quantityDozens;
        existing.revenue += item.subtotal;
        const itemProfit = item.subtotal - item.quantityDozens * item.costPerDozen;
        existing.profit += itemProfit;
        map.set(item.productId, existing);
      });
    });

    return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue);
  }, [filteredOrders]);

  // Export PDF Report (PRD requirement)
  const handleExportPdf = () => {
    const dateRangeLabel = `${formatDate(startDate)} to ${formatDate(endDate)}`;
    generateReportPdf(
      'Wholesale Performance & Profit Report',
      dateRangeLabel,
      summary,
      sellerReportData,
      productReportData,
      settings
    );
  };

  // Export Excel / CSV Report (PRD requirement)
  const handleExportExcelCsv = () => {
    const csvContent = exportOrdersToCsv(filteredOrders);
    downloadCsvFile(`Wholesale_Report_${startDate}_to_${endDate}.csv`, csvContent);
  };

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl lg:text-2xl font-bold text-slate-900 tracking-tight">
              Company Reports & Analytics
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">
              Admin Exclusive
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Total wholesale revenue, quantity sold (dozens & pairs), profit margins, and transactions per seller.
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            id="btn-report-excel"
            type="button"
            onClick={handleExportExcelCsv}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl transition-colors shadow-xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export Excel / CSV</span>
          </button>
          <button
            id="btn-report-pdf"
            type="button"
            onClick={handleExportPdf}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF Report</span>
          </button>
        </div>
      </div>

      {/* Date Range Selector Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Preset Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-500 mr-1">Period:</span>
          {(['today', '7d', '30d', 'this_month', 'custom'] as const).map(preset => (
            <button
              key={preset}
              type="button"
              onClick={() => handlePresetChange(preset)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                dateRangePreset === preset
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {preset === 'today' && 'Today'}
              {preset === '7d' && 'Last 7 Days'}
              {preset === '30d' && 'Last 30 Days'}
              {preset === 'this_month' && 'This Month'}
              {preset === 'custom' && 'Custom Date Range'}
            </button>
          ))}
        </div>

        {/* Date Inputs */}
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={e => {
                setStartDate(e.target.value);
                setDateRangePreset('custom');
              }}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-hidden"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">To:</span>
            <input
              type="date"
              value={endDate}
              onChange={e => {
                setEndDate(e.target.value);
                setDateRangePreset('custom');
              }}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* Summary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sales Revenue */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Sales Revenue</p>
          <p className="text-2xl font-bold font-mono text-slate-900 mt-2">
            {formatCurrency(summary.totalRevenue, settings.currencySymbol, settings.currencyCode)}
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {summary.orderCount} completed transactions
          </span>
        </div>

        {/* Gross Profit & Margin */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gross Profit</p>
          <p className="text-2xl font-bold font-mono text-emerald-600 mt-2">
            {formatCurrency(summary.totalProfit, settings.currencySymbol, settings.currencyCode)}
          </p>
          <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">
            {summary.profitMargin.toFixed(1)}% profit margin
          </span>
        </div>

        {/* Total Volume Sold */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Volume Sold</p>
          <p className="text-2xl font-bold font-mono text-indigo-600 mt-2">
            {summary.totalDozens} <span className="text-sm font-normal">doz</span>
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Equivalent to {summary.totalPairs.toLocaleString()} pairs
          </span>
        </div>

        {/* Avg Transaction Value */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Avg Order Value</p>
          <p className="text-2xl font-bold font-mono text-slate-900 mt-2">
            {formatCurrency(summary.avgOrderValue, settings.currencySymbol, settings.currencyCode)}
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">Per wholesale client</span>
        </div>
      </div>

      {/* Seller Performance Table (PRD requirement: transactions per seller) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Seller Performance Breakdown
            </h2>
            <p className="text-xs text-slate-500">Sales volume, gross revenue, and profit per representative</p>
          </div>
        </div>

        {sellerReportData.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">No transactions in selected period.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-700 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Sales Representative</th>
                  <th className="py-3 px-3 text-center">Orders Placed</th>
                  <th className="py-3 px-3 text-right">Volume (Dozens)</th>
                  <th className="py-3 px-3 text-right">Equivalent Pairs</th>
                  <th className="py-3 px-4 text-right">Total Revenue</th>
                  <th className="py-3 px-4 text-right">Gross Profit</th>
                  <th className="py-3 px-3 text-right">Margin %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {sellerReportData.map((seller, idx) => {
                  const margin = seller.revenue > 0 ? (seller.profit / seller.revenue) * 100 : 0;
                  return (
                    <tr key={idx} className="hover:bg-slate-50/80">
                      <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                          {seller.sellerName.charAt(0)}
                        </div>
                        <span>{seller.sellerName}</span>
                      </td>
                      <td className="py-3.5 px-3 text-center font-semibold text-slate-800">
                        {seller.orderCount} sales
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono font-semibold text-indigo-700">
                        {seller.dozensSold.toFixed(2)} doz
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono text-slate-600">
                        {Math.round(seller.dozensSold * 12)} pairs
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold font-mono text-slate-900">
                        {formatCurrency(seller.revenue, settings.currencySymbol, settings.currencyCode)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold font-mono text-emerald-600">
                        {formatCurrency(seller.profit, settings.currencySymbol, settings.currencyCode)}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-700">
                        {margin.toFixed(1)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Top Products Sold Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Product Sales Analysis
            </h2>
            <p className="text-xs text-slate-500">Volume sold in dozens & total profit generated</p>
          </div>
        </div>

        {productReportData.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">No product data for selected period.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-700 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Product Name & SKU</th>
                  <th className="py-3 px-3 text-right">Dozens Sold</th>
                  <th className="py-3 px-3 text-right">Equivalent Pairs</th>
                  <th className="py-3 px-4 text-right">Gross Revenue</th>
                  <th className="py-3 px-4 text-right">Gross Profit</th>
                  <th className="py-3 px-3 text-right">Margin %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {productReportData.map((prod, idx) => {
                  const margin = prod.revenue > 0 ? (prod.profit / prod.revenue) * 100 : 0;
                  return (
                    <tr key={idx} className="hover:bg-slate-50/80">
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 block">{prod.productName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">SKU: {prod.sku}</span>
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono font-bold text-indigo-700">
                        {prod.dozensSold.toFixed(2)} doz
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono text-slate-600">
                        {Math.round(prod.dozensSold * 12)} pairs
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold font-mono text-slate-900">
                        {formatCurrency(prod.revenue, settings.currencySymbol, settings.currencyCode)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold font-mono text-emerald-600">
                        {formatCurrency(prod.profit, settings.currencySymbol, settings.currencyCode)}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-700">
                        {margin.toFixed(1)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
