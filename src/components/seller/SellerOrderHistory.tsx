import React, { useState, useMemo } from 'react';
import {
  History,
  Search,
  Filter,
  Calendar,
  DollarSign,
  Package,
  Layers,
  XCircle,
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Share2,
  Printer,
  Download,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Order } from '../../types';
import {
  formatCurrency,
  formatDateTime,
  formatDozens,
  formatPairs,
  isOrderWithin24Hours,
  formatRemainingTime,
  getCancellationRemainingMs,
} from '../../utils/formatters';

interface SellerOrderHistoryProps {
  onViewReceipt: (order: Order) => void;
}

export const SellerOrderHistory: React.FC<SellerOrderHistoryProps> = ({ onViewReceipt }) => {
  const { orders, currentUser, cancelOrder, settings } = useApp();

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'cancelled'>('all');

  // Cancel Modal State
  const [cancelModalOrder, setCancelModalOrder] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelError, setCancelError] = useState<string | null>(null);

  // Filter orders strictly for the current seller
  const sellerOrders = useMemo(() => {
    return orders.filter(o => o.sellerId === currentUser.id);
  }, [orders, currentUser.id]);

  // Apply search & status filters
  const filteredOrders = useMemo(() => {
    return sellerOrders.filter(o => {
      const matchesSearch =
        o.receiptNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.customerPhone.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.items.some(i => i.productName.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [sellerOrders, searchQuery, statusFilter]);

  // Seller Summary Metrics
  const metrics = useMemo(() => {
    const completed = sellerOrders.filter(o => o.status === 'completed');
    const totalRevenue = completed.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalDozens = completed.reduce((sum, o) => sum + o.totalDozens, 0);
    const totalPairs = completed.reduce((sum, o) => sum + o.totalPairs, 0);

    return {
      totalRevenue,
      totalDozens: Number(totalDozens.toFixed(2)),
      totalPairs,
      completedCount: completed.length,
      cancelledCount: sellerOrders.filter(o => o.status === 'cancelled').length,
    };
  }, [sellerOrders]);

  const handleConfirmCancel = () => {
    if (!cancelModalOrder) return;
    setCancelError(null);

    if (!cancelReason || cancelReason.trim().length < 4) {
      setCancelError('Please provide a meaningful reason for order cancellation.');
      return;
    }

    const res = cancelOrder(cancelModalOrder.id, cancelReason);
    if (res.success) {
      setCancelModalOrder(null);
      setCancelReason('');
    } else {
      setCancelError(res.error || 'Failed to cancel order.');
    }
  };

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl lg:text-2xl font-bold text-slate-900 tracking-tight">
              My Sales Order History
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">
              {currentUser.fullName}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Orders created by your account. You can cancel orders within <strong>24 hours</strong> of creation.
          </p>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">My Total Sales</p>
          <p className="text-xl font-bold text-slate-900 font-mono mt-1">
            {formatCurrency(metrics.totalRevenue, settings.currencySymbol, settings.currencyCode)}
          </p>
          <span className="text-[11px] text-emerald-600 font-medium">Completed orders</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Volume (Dozens)</p>
          <p className="text-xl font-bold text-indigo-600 font-mono mt-1">
            {metrics.totalDozens} <span className="text-xs font-normal">doz</span>
          </p>
          <span className="text-[11px] text-slate-500">{metrics.totalPairs} pairs total</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Orders Placed</p>
          <p className="text-xl font-bold text-slate-900 font-mono mt-1">
            {metrics.completedCount}
          </p>
          <span className="text-[11px] text-slate-500">Active transactions</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Cancelled</p>
          <p className="text-xl font-bold text-slate-900 font-mono mt-1">
            {metrics.cancelledCount}
          </p>
          <span className="text-[11px] text-rose-500">Restored to inventory</span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by receipt #, customer name, phone, or product..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-700"
          >
            <option value="all">All Statuses ({sellerOrders.length})</option>
            <option value="completed">Completed Only</option>
            <option value="cancelled">Cancelled Only</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <FileText className="w-10 h-10 mx-auto mb-2 opacity-40 text-slate-300" />
            <p className="text-sm font-semibold text-slate-700">No orders found.</p>
            <p className="text-xs text-slate-500 mt-1">Start by creating sales in the Sales Terminal.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-700 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Receipt # & Date</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Items Summary</th>
                  <th className="py-3 px-3 text-right">Volume</th>
                  <th className="py-3 px-4 text-right">Total Amount</th>
                  <th className="py-3 px-3 text-center">Status & 24h Window</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredOrders.map(order => {
                  const within24h = isOrderWithin24Hours(order.date);
                  const remainingMs = getCancellationRemainingMs(order.date);
                  const isCompleted = order.status === 'completed';

                  return (
                    <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Receipt & Date */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 font-mono block">
                          {order.receiptNumber}
                        </span>
                        <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {formatDateTime(order.date)}
                        </span>
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-900 block">
                          {order.customerName}
                        </span>
                        <span className="text-[11px] text-slate-500">{order.customerPhone || 'N/A'}</span>
                      </td>

                      {/* Items */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="space-y-0.5">
                          {order.items.slice(0, 2).map((item, i) => (
                            <div key={i} className="text-[11px] text-slate-700 truncate">
                              • {item.productName} (<strong>{item.quantityDozens} doz</strong>)
                            </div>
                          ))}
                          {order.items.length > 2 && (
                            <span className="text-[10px] text-indigo-600 font-medium">
                              +{order.items.length - 2} more item(s)
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Volume */}
                      <td className="py-3.5 px-3 text-right">
                        <span className="font-bold text-slate-900 block font-mono">
                          {order.totalDozens} doz
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          ({order.totalPairs} pairs)
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900 font-mono text-sm">
                        {formatCurrency(order.totalAmount, settings.currencySymbol, settings.currencyCode)}
                      </td>

                      {/* Status & Cancellation Window */}
                      <td className="py-3.5 px-3 text-center">
                        {isCompleted ? (
                          <div className="inline-flex flex-col items-center">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              Completed
                            </span>
                            {within24h ? (
                              <span className="text-[10px] text-amber-600 font-medium mt-1 flex items-center gap-0.5">
                                <Clock className="w-2.5 h-2.5" />
                                {formatRemainingTime(remainingMs)}
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400 mt-0.5">
                                Cancel expired
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                            Cancelled
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onViewReceipt(order)}
                            className="px-2.5 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 rounded-lg border border-indigo-200 transition-colors"
                            title="View / Print Receipt"
                          >
                            Receipt
                          </button>
                          {isCompleted && within24h && (
                            <button
                              type="button"
                              onClick={() => {
                                setCancelModalOrder(order);
                                setCancelReason('');
                                setCancelError(null);
                              }}
                              className="px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200 transition-colors"
                              title="Cancel within 24h"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Cancellation Confirmation Modal */}
      {cancelModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-rose-100 text-rose-600">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Cancel Order #{cancelModalOrder.receiptNumber}</h3>
                <p className="text-xs text-slate-500">24-Hour Seller Cancellation Window</p>
              </div>
            </div>

            <div className="p-3 bg-rose-50 rounded-xl border border-rose-100 text-xs text-rose-900 space-y-1">
              <p>
                Cancelling this order will immediately restore <strong>{cancelModalOrder.totalPairs} pairs</strong> back into the warehouse stock.
              </p>
              <p className="font-semibold text-rose-800">
                This action is audited and logged in the company records.
              </p>
            </div>

            {cancelError && (
              <p className="text-xs font-bold text-rose-600">{cancelError}</p>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Reason for Cancellation <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Customer cancelled order prior to dispatch, incorrect quantity entered..."
                value={cancelReason}
                onChange={e => setCancelReason(e.target.value)}
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCancelModalOrder(null)}
                className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Keep Order
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-xs"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
