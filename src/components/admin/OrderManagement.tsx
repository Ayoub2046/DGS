import React, { useState, useMemo } from 'react';
import {
  History,
  Search,
  Filter,
  Calendar,
  DollarSign,
  User as UserIcon,
  XCircle,
  FileText,
  AlertTriangle,
  Download,
  CheckCircle2,
  Share2,
  Trash2,
  Eye,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Order } from '../../types';
import {
  formatCurrency,
  formatDateTime,
  formatDozens,
  formatPairs,
} from '../../utils/formatters';
import { exportOrdersToCsv, downloadCsvFile } from '../../utils/csvHelper';

interface OrderManagementProps {
  onViewReceipt: (order: Order) => void;
}

export const OrderManagement: React.FC<OrderManagementProps> = ({ onViewReceipt }) => {
  const {
    orders,
    users,
    cancelOrder,
    cancellationLogs,
    settings,
  } = useApp();

  // Active sub-tab
  const [activeTab, setActiveTab] = useState<'orders' | 'cancellations'>('orders');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [sellerFilter, setSellerFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'cancelled'>('all');

  // Admin Cancel Modal State
  const [cancelModalOrder, setCancelModalOrder] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelError, setCancelError] = useState<string | null>(null);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchesSearch =
        o.receiptNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.customerPhone.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.sellerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.items.some(i => i.productName.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesSeller = sellerFilter === 'all' || o.sellerId === sellerFilter;
      const matchesStatus = statusFilter === 'all' || o.status === statusFilter;

      return matchesSearch && matchesSeller && matchesStatus;
    });
  }, [orders, searchQuery, sellerFilter, statusFilter]);

  // Handle Admin Cancel Order
  const handleConfirmCancel = () => {
    if (!cancelModalOrder) return;
    setCancelError(null);

    if (!cancelReason || cancelReason.trim().length < 4) {
      setCancelError('Please enter an official reason for order cancellation.');
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

  // Export orders to CSV
  const handleExportCsv = () => {
    const csvContent = exportOrdersToCsv(filteredOrders);
    downloadCsvFile(`WMS_Orders_Export_${new Date().toISOString().slice(0, 10)}.csv`, csvContent);
  };

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl lg:text-2xl font-bold text-slate-900 tracking-tight">
              Company Wholesale Sales & Orders
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">
              {orders.length} Total Orders
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Company-wide transaction records. Admins can view all seller orders, review receipts, and perform cancellations.
          </p>
        </div>

        {/* Tab Switcher & Export */}
        <div className="flex items-center gap-2">
          <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('orders')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'orders'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sales Orders ({orders.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('cancellations')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'cancellations'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cancellation Audit Logs ({cancellationLogs.length})
            </button>
          </div>

          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {activeTab === 'orders' ? (
        <>
          {/* Filters */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by receipt #, customer, seller, phone, or items..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <select
              value={sellerFilter}
              onChange={e => setSellerFilter(e.target.value)}
              className="py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-700"
            >
              <option value="all">All Sellers</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>
                  {u.fullName} ({u.role})
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-700"
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed Only</option>
              <option value="cancelled">Cancelled Only</option>
            </select>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            {filteredOrders.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <FileText className="w-10 h-10 mx-auto mb-2 opacity-40 text-slate-300" />
                <p className="text-sm font-semibold text-slate-700">No orders found.</p>
                <p className="text-xs text-slate-500 mt-1">Try clearing filters or search queries.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-700 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Receipt # & Date</th>
                      <th className="py-3 px-4">Seller</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Items Summary</th>
                      <th className="py-3 px-3 text-right">Volume</th>
                      <th className="py-3 px-4 text-right">Total Revenue</th>
                      <th className="py-3 px-3 text-right">Gross Profit</th>
                      <th className="py-3 px-3 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredOrders.map(order => {
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

                          {/* Seller */}
                          <td className="py-3.5 px-4">
                            <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                              <UserIcon className="w-3 h-3 text-indigo-600" />
                              {order.sellerName}
                            </span>
                          </td>

                          {/* Customer */}
                          <td className="py-3.5 px-4">
                            <span className="font-semibold text-slate-900 block">
                              {order.customerName}
                            </span>
                            <span className="text-[11px] text-slate-500">
                              {order.customerPhone || 'N/A'}
                            </span>
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

                          {/* Revenue */}
                          <td className="py-3.5 px-4 text-right font-bold text-slate-900 font-mono text-sm">
                            {formatCurrency(order.totalAmount, settings.currencySymbol, settings.currencyCode)}
                          </td>

                          {/* Gross Profit */}
                          <td className="py-3.5 px-3 text-right font-bold text-emerald-600 font-mono">
                            {formatCurrency(order.totalProfit, settings.currencySymbol, settings.currencyCode)}
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-3 text-center">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                isCompleted
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {isCompleted ? 'Completed' : 'Cancelled'}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => onViewReceipt(order)}
                                className="px-2.5 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 rounded-lg border border-indigo-200 transition-colors"
                                title="View Receipt / PDF"
                              >
                                Receipt
                              </button>
                              {isCompleted && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setCancelModalOrder(order);
                                    setCancelReason('');
                                    setCancelError(null);
                                  }}
                                  className="px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200 transition-colors"
                                  title="Admin Cancellation (Anytime)"
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
        </>
      ) : (
        /* Cancellation Audit Logs Table */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Official Order Cancellation Logs
              </h2>
              <p className="text-xs text-slate-500">
                Audited records of cancelled wholesale sales and restored inventory
              </p>
            </div>
          </div>

          {cancellationLogs.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <CheckCircle2 className="w-10 h-10 mx-auto mb-2 opacity-40 text-emerald-500" />
              <p className="text-sm font-semibold text-slate-700">No order cancellations recorded.</p>
              <p className="text-xs text-slate-500 mt-1">All processed sales remain in active status.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-700 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Receipt #</th>
                    <th className="py-3 px-4">Cancelled By</th>
                    <th className="py-3 px-4">Cancellation Timestamp</th>
                    <th className="py-3 px-4">Reason Given</th>
                    <th className="py-3 px-4">Restored Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {cancellationLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {log.receiptNumber}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-900 block">
                          {log.cancelledByName}
                        </span>
                        <span className="text-[10px] uppercase text-indigo-600 font-bold">
                          {log.cancelledByRole}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-mono">
                        {formatDateTime(log.timestamp)}
                      </td>
                      <td className="py-3 px-4 max-w-sm">
                        <p className="text-slate-800 italic">"{log.reason}"</p>
                      </td>
                      <td className="py-3 px-4">
                        {log.itemsRestored.map((item, i) => (
                          <div key={i} className="text-[11px] text-emerald-700 font-medium">
                            +{item.pairsRestored} pairs of {item.productName}
                          </div>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Admin Cancel Modal */}
      {cancelModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-100 text-rose-600">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Admin Cancellation</h3>
                <p className="text-xs text-slate-500">Order #{cancelModalOrder.receiptNumber}</p>
              </div>
            </div>

            <div className="p-3 bg-rose-50 rounded-xl border border-rose-100 text-xs text-rose-900 space-y-1">
              <p>
                Cancelling this order will immediately restore <strong>{cancelModalOrder.totalPairs} pairs</strong> back into the warehouse stock.
              </p>
              <p className="font-semibold text-rose-800">
                Logged as Admin Override in company cancellation records.
              </p>
            </div>

            {cancelError && (
              <p className="text-xs font-bold text-rose-600">{cancelError}</p>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Official Cancellation Reason <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Administrative refund, shipping address undeliverable, customer requested cancellation..."
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
                Cancel Order & Restore Stock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
