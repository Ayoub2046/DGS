import React, { useState, useMemo } from 'react';
import {
  TrendingDown,
  Search,
  Calendar,
  User as UserIcon,
  ShieldCheck,
  Package,
  Clock,
  ArrowRight,
  Info,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

export const PriceChangeLogsView: React.FC = () => {
  const { priceChangeLogs, settings } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = useMemo(() => {
    return priceChangeLogs.filter(
      log =>
        log.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.changedByName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.reason.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [priceChangeLogs, searchQuery]);

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl lg:text-2xl font-bold text-slate-900 tracking-tight">
              Last Price Floor Audit Trail
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">
              {priceChangeLogs.length} Adjustments Logged
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Permanent compliance log of all Last Price floor modifications, required explanations, and administrator timestamps.
          </p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="p-4 bg-indigo-50/70 border border-indigo-200/80 rounded-2xl flex items-start gap-3 text-xs text-indigo-900">
        <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">Profit Margin Floor Protection Policy:</p>
          <p className="mt-0.5 text-indigo-800 leading-relaxed">
            Sellers are strictly blocked by the system from selling below Last Price. When an Administrator modifies or lowers the floor price, a mandatory reason is audited below to preserve accountability.
          </p>
        </div>
      </div>

      {/* Search Filter */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search price audit trail by product, administrator, or reason..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <TrendingDown className="w-10 h-10 mx-auto mb-2 opacity-40 text-slate-300" />
            <p className="text-sm font-semibold text-slate-700">No price change logs found.</p>
            <p className="text-xs text-slate-500 mt-1">
              Any Last Price floor adjustments made by Admins will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-700 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">Changed By</th>
                  <th className="py-3 px-3 text-right">Previous Floor</th>
                  <th className="py-3 px-3 text-right">New Floor</th>
                  <th className="py-3 px-4">Mandatory Reason / Justification</th>
                  <th className="py-3 px-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredLogs.map(log => {
                  const isLowered = log.newPrice < log.oldPrice;

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Product */}
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {log.productName}
                      </td>

                      {/* Changed By */}
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                          <UserIcon className="w-3 h-3 text-indigo-600" />
                          {log.changedByName}
                        </span>
                      </td>

                      {/* Old Price */}
                      <td className="py-3.5 px-3 text-right font-mono font-medium text-slate-500">
                        {formatCurrency(log.oldPrice, settings.currencySymbol, settings.currencyCode)}
                      </td>

                      {/* New Price */}
                      <td className="py-3.5 px-3 text-right font-mono font-bold">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md ${
                            isLowered
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-emerald-100 text-emerald-900'
                          }`}
                        >
                          {formatCurrency(log.newPrice, settings.currencySymbol, settings.currencyCode)}
                        </span>
                      </td>

                      {/* Reason */}
                      <td className="py-3.5 px-4 max-w-sm">
                        <p className="text-slate-800 italic bg-slate-50 p-2 rounded-lg border border-slate-100">
                          "{log.reason}"
                        </p>
                      </td>

                      {/* Timestamp */}
                      <td className="py-3.5 px-4 text-right text-slate-500 font-mono text-[11px]">
                        {formatDateTime(log.timestamp)}
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
