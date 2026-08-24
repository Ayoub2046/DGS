import React, { useRef } from 'react';
import {
  X,
  Printer,
  Download,
  Share2,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  Building2,
  Phone,
  Mail,
  Calendar,
  User as UserIcon,
  Package,
} from 'lucide-react';
import { Order } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  formatCurrency,
  formatDateTime,
  formatDozens,
  formatPairs,
} from '../../utils/formatters';
import {
  generateReceiptPdf,
  generateWhatsAppMessageText,
} from '../../utils/pdfGenerator';

interface ReceiptModalProps {
  order: Order | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ order, onClose }) => {
  const { settings } = useApp();
  const [copied, setCopied] = React.useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    generateReceiptPdf(order, settings);
  };

  const handleWhatsAppShare = () => {
    const encodedText = generateWhatsAppMessageText(order, settings);
    const url = `https://wa.me/?text=${encodedText}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCopyText = () => {
    const itemsText = order.items
      .map(
        i =>
          `• ${i.productName} (${i.sku}): ${i.quantityDozens} doz (${i.quantityPairs} pairs) @ ${formatCurrency(i.pricePerDozen, settings.currencySymbol)} = ${formatCurrency(i.subtotal, settings.currencySymbol)}`
      )
      .join('\n');

    const text = `==============================
${settings.companyName}
WHOLESALE RECEIPT #${order.receiptNumber}
Date: ${formatDateTime(order.date)}
Customer: ${order.customerName} (${order.customerPhone || 'N/A'})
Seller: ${order.sellerName}
Status: ${order.status.toUpperCase()}
------------------------------
ITEMS:
${itemsText}
------------------------------
TOTAL DOZENS: ${order.totalDozens} doz (${order.totalPairs} pairs)
TOTAL AMOUNT: ${formatCurrency(order.totalAmount, settings.currencySymbol)}
==============================`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      id="receipt-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs overflow-y-auto"
    >
      <div
        id="receipt-modal-container"
        className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8"
      >
        {/* Modal Top Control Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold">Wholesale Sales Receipt</h2>
              <p className="text-xs text-slate-400 font-mono">{order.receiptNumber}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              id="btn-receipt-whatsapp"
              type="button"
              onClick={handleWhatsAppShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-300 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/60 rounded-lg transition-colors"
              title="Share receipt directly via WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>
            <button
              id="btn-receipt-pdf"
              type="button"
              onClick={handleDownloadPdf}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
              title="Download official PDF receipt"
            >
              <Download className="w-3.5 h-3.5" />
              <span>PDF</span>
            </button>
            <button
              id="btn-receipt-print"
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
              title="Print Receipt"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              id="btn-receipt-close"
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div ref={printRef} className="p-8 space-y-6 text-slate-800 bg-white">
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <Building2 className="w-6 h-6 text-indigo-600" />
                <h1 className="text-xl font-bold text-slate-900">{settings.companyName}</h1>
              </div>
              <p className="text-xs text-slate-500 mt-1">{settings.tagline}</p>
              <div className="text-xs text-slate-600 mt-2 space-y-0.5">
                <p>{settings.address}</p>
                <p>Phone: {settings.phone} | Email: {settings.email}</p>
                {settings.taxId && <p className="font-mono text-slate-500">Tax ID: {settings.taxId}</p>}
              </div>
            </div>
            <div className="sm:text-right">
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                  order.status === 'completed'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-rose-100 text-rose-800 border border-rose-300'
                }`}
              >
                {order.status === 'completed' ? 'Official Sale' : 'Cancelled Order'}
              </span>
              <p className="text-lg font-bold font-mono text-slate-900 mt-2">{order.receiptNumber}</p>
              <p className="text-xs text-slate-500 mt-1 flex sm:justify-end items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {formatDateTime(order.date)}
              </p>
            </div>
          </div>

          {/* Info Columns: Customer & Seller */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Customer / Buyer</p>
              <p className="text-sm font-bold text-slate-900 mt-1">{order.customerName}</p>
              <p className="text-xs text-slate-600 mt-0.5 flex items-center gap-1.5">
                <Phone className="w-3 h-3 text-slate-400" />
                {order.customerPhone || 'Walk-in wholesale client'}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sales Representative</p>
              <p className="text-sm font-bold text-slate-900 mt-1 flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5 text-indigo-600" />
                {order.sellerName}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">Wholesale Terminal #1</p>
            </div>
          </div>

          {/* Line Items Table */}
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Itemized Products (Sold in Dozens)</h3>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-100 text-slate-700 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Item & SKU</th>
                    <th className="py-3 px-3 text-right">Quantity (Dozens)</th>
                    <th className="py-3 px-3 text-right">Pairs Count</th>
                    <th className="py-3 px-3 text-right">Price / Dozen</th>
                    <th className="py-3 px-4 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  {order.items.map((item, idx) => (
                    <tr key={item.id || idx} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-900">{item.productName}</div>
                        <div className="text-xs text-slate-500 font-mono">SKU: {item.sku || 'N/A'}</div>
                      </td>
                      <td className="py-3 px-3 text-right font-medium text-slate-900">
                        {item.quantityDozens} doz
                      </td>
                      <td className="py-3 px-3 text-right text-slate-600 font-mono">
                        {item.quantityPairs} pairs
                      </td>
                      <td className="py-3 px-3 text-right font-mono">
                        {formatCurrency(item.pricePerDozen, settings.currencySymbol, settings.currencyCode)}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-slate-900 font-mono">
                        {formatCurrency(item.subtotal, settings.currencySymbol, settings.currencyCode)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50 border-t border-slate-200 text-slate-900 font-semibold">
                  <tr>
                    <td className="py-3 px-4 text-slate-600 uppercase text-xs">Total Units Sold</td>
                    <td className="py-3 px-3 text-right text-indigo-700 font-bold">{order.totalDozens} doz</td>
                    <td className="py-3 px-3 text-right text-indigo-700 font-bold">{order.totalPairs} pairs</td>
                    <td className="py-3 px-3 text-right text-xs text-slate-500 uppercase">Grand Total:</td>
                    <td className="py-3 px-4 text-right text-base text-emerald-600 font-bold font-mono">
                      {formatCurrency(order.totalAmount, settings.currencySymbol, settings.currencyCode)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Notes & Summary Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start pt-2">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
              <p className="font-semibold text-slate-800 mb-1">Order Notes / Terms:</p>
              <p>{order.notes || 'Standard wholesale fulfillment. All quantities packed and inspected in full carton lots.'}</p>
            </div>
            <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 flex flex-col justify-between">
              <div className="flex justify-between items-center text-xs text-slate-600 mb-1">
                <span>Total Quantity in Dozens:</span>
                <span className="font-bold text-slate-900">{order.totalDozens} Dozens</span>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-600 mb-2">
                <span>Total Equivalent Units:</span>
                <span className="font-bold text-slate-900">{order.totalPairs} Pairs</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-indigo-200/60 text-sm">
                <span className="font-bold text-slate-900">Total Billed:</span>
                <span className="font-bold text-emerald-700 text-lg font-mono">
                  {formatCurrency(order.totalAmount, settings.currencySymbol, settings.currencyCode)}
                </span>
              </div>
            </div>
          </div>

          {/* Footer Terms */}
          <div className="pt-4 border-t border-slate-200 text-center text-xs text-slate-500 space-y-1">
            <p>{settings.receiptFooterNote}</p>
            <p className="text-[11px] text-slate-400 font-mono">
              System verified — Apex Wholesale Management Platform | 1 Dozen = 12 Pairs
            </p>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-200">
          <button
            type="button"
            onClick={handleCopyText}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 px-3 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied to Clipboard' : 'Copy Text'}</span>
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadPdf}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
