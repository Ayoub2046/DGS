import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Order, CompanySettings } from '../types';
import { formatCurrency, formatDozens, formatDateTime, formatDate } from './formatters';

export function generateReceiptPdf(order: Order, settings: CompanySettings): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Header Background Accent Banner
  doc.setFillColor(30, 41, 59); // Slate 800
  doc.rect(0, 0, pageWidth, 38, 'F');

  // Company Branding
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(settings.companyName, 14, 15);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225); // Slate 300
  doc.text(settings.tagline || 'Wholesale Distribution & Inventory System', 14, 22);
  doc.text(`${settings.address}  |  Tel: ${settings.phone}  |  ${settings.email}`, 14, 28);

  // Title: Official Wholesale Sales Receipt
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('WHOLESALE INVOICE / RECEIPT', pageWidth - 14, 18, { align: 'right' });

  // Receipt Number & Date badge
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(226, 232, 240);
  doc.text(`Receipt: ${order.receiptNumber}`, pageWidth - 14, 25, { align: 'right' });
  doc.text(`Date: ${formatDateTime(order.date)}`, pageWidth - 14, 30, { align: 'right' });

  // Reset text color for body
  doc.setTextColor(30, 41, 59);

  // Customer & Order Info Box
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252); // Slate 50
  doc.roundedRect(14, 44, pageWidth - 28, 30, 2, 2, 'FD');

  // Customer column
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139); // Slate 500
  doc.text('BILLED TO / CUSTOMER', 20, 52);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42); // Slate 900
  doc.text(order.customerName || 'Walk-in Wholesale Customer', 20, 59);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Phone: ${order.customerPhone || 'N/A'}`, 20, 66);

  // Order Details column
  const midX = pageWidth / 2 + 10;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('TRANSACTION DETAILS', midX, 52);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(`Handled by Seller: ${order.sellerName}`, midX, 59);
  doc.text(`Status: ${order.status.toUpperCase()}`, midX, 66);

  // Items Table
  const tableRows = order.items.map((item, idx) => [
    (idx + 1).toString(),
    `${item.productName}\nSKU: ${item.sku || 'N/A'}`,
    `${item.quantityDozens} doz`,
    `${item.quantityPairs} pairs`,
    formatCurrency(item.pricePerDozen, settings.currencySymbol, settings.currencyCode),
    formatCurrency(item.subtotal, settings.currencySymbol, settings.currencyCode),
  ]);

  autoTable(doc, {
    startY: 80,
    head: [['#', 'Product Description', 'Quantity (Dozens)', 'Equivalent Pairs', 'Price / Dozen', 'Total']],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: 'bold',
      halign: 'left',
    },
    styles: {
      fontSize: 9,
      cellPadding: 4,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.2,
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 32, halign: 'right' },
      3: { cellWidth: 32, halign: 'right' },
      4: { cellWidth: 30, halign: 'right' },
      5: { cellWidth: 32, halign: 'right', fontStyle: 'bold' },
    },
    foot: [
      [
        '',
        'GRAND TOTALS',
        `${order.totalDozens} doz`,
        `${order.totalPairs} pairs`,
        '',
        formatCurrency(order.totalAmount, settings.currencySymbol, settings.currencyCode),
      ],
    ],
    footStyles: {
      fillColor: [241, 245, 249],
      textColor: [15, 23, 42],
      fontSize: 9,
      fontStyle: 'bold',
    },
  });

  // Calculate final Y position after table
  const finalY = (doc as any).lastAutoTable.finalY + 10;

  // Totals Summary Box on the right
  const summaryBoxWidth = 80;
  const summaryBoxX = pageWidth - 14 - summaryBoxWidth;
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(summaryBoxX, finalY, summaryBoxWidth, 24, 2, 2, 'FD');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Total Dozens Sold:', summaryBoxX + 6, finalY + 8);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text(`${order.totalDozens} doz (${order.totalPairs} pairs)`, summaryBoxX + summaryBoxWidth - 6, finalY + 8, { align: 'right' });

  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.text('Amount Due / Paid:', summaryBoxX + 6, finalY + 18);
  doc.setTextColor(16, 185, 129); // Emerald
  doc.setFont('helvetica', 'bold');
  doc.text(
    formatCurrency(order.totalAmount, settings.currencySymbol, settings.currencyCode),
    summaryBoxX + summaryBoxWidth - 6,
    finalY + 18,
    { align: 'right' }
  );

  // Notes & Footer
  if (order.notes) {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text('ORDER NOTES:', 14, finalY + 6);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(order.notes, 14, finalY + 12, { maxWidth: pageWidth - summaryBoxWidth - 36 });
  }

  // Footer Disclaimer
  const footerY = doc.internal.pageSize.getHeight() - 18;
  doc.setDrawColor(226, 232, 240);
  doc.line(14, footerY - 5, pageWidth - 14, footerY - 5);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text(settings.receiptFooterNote || 'All wholesale transactions are final. Thank you for your partnership!', pageWidth / 2, footerY, { align: 'center' });
  doc.text(`Generated by Apex WMS on ${new Date().toLocaleString()}`, pageWidth / 2, footerY + 5, { align: 'center' });

  doc.save(`Receipt_${order.receiptNumber}.pdf`);
}

export function generateReportPdf(
  reportTitle: string,
  dateRangeLabel: string,
  summary: {
    totalRevenue: number;
    totalProfit: number;
    profitMargin: number;
    totalDozens: number;
    totalPairs: number;
    orderCount: number;
  },
  sellerData: Array<{
    sellerName: string;
    orderCount: number;
    dozensSold: number;
    revenue: number;
    profit: number;
  }>,
  productData: Array<{
    productName: string;
    sku: string;
    dozensSold: number;
    revenue: number;
    profit: number;
  }>,
  settings: CompanySettings
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.rect(0, 0, pageWidth, 35, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(settings.companyName, 14, 14);

  doc.setFontSize(12);
  doc.setTextColor(56, 189, 248); // Sky 400
  doc.text(reportTitle.toUpperCase(), 14, 22);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text(`Period: ${dateRangeLabel}  |  Generated: ${new Date().toLocaleString()}`, 14, 28);

  // Summary Metrics Grid
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 42, pageWidth - 28, 26, 2, 2, 'FD');

  const colW = (pageWidth - 28) / 4;

  // Box 1: Total Revenue
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('TOTAL REVENUE', 14 + 6, 50);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(formatCurrency(summary.totalRevenue, settings.currencySymbol), 14 + 6, 60);

  // Box 2: Total Gross Profit
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('GROSS PROFIT (MARGIN)', 14 + colW + 6, 50);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(16, 185, 129);
  doc.text(`${formatCurrency(summary.totalProfit, settings.currencySymbol)} (${summary.profitMargin.toFixed(1)}%)`, 14 + colW + 6, 60);

  // Box 3: Volume Sold
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('VOLUME SOLD', 14 + colW * 2 + 6, 50);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`${summary.totalDozens.toFixed(1)} doz (${summary.totalPairs} pairs)`, 14 + colW * 2 + 6, 60);

  // Box 4: Completed Transactions
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('COMPLETED ORDERS', 14 + colW * 3 + 6, 50);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(59, 130, 246);
  doc.text(`${summary.orderCount} sales`, 14 + colW * 3 + 6, 60);

  // Seller Performance Table
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Seller Performance Breakdown', 14, 76);

  const sellerRows = sellerData.map(s => [
    s.sellerName,
    s.orderCount.toString(),
    `${s.dozensSold.toFixed(1)} doz`,
    formatCurrency(s.revenue, settings.currencySymbol),
    formatCurrency(s.profit, settings.currencySymbol),
    s.revenue > 0 ? `${((s.profit / s.revenue) * 100).toFixed(1)}%` : '0%',
  ]);

  autoTable(doc, {
    startY: 80,
    head: [['Seller Name', 'Orders', 'Dozens Sold', 'Total Revenue', 'Gross Profit', 'Margin']],
    body: sellerRows,
    theme: 'striped',
    headStyles: { fillColor: [51, 65, 85], fontSize: 8.5, textColor: [255, 255, 255] },
    styles: { fontSize: 8.5, cellPadding: 3 },
  });

  const nextY = (doc as any).lastAutoTable.finalY + 10;

  // Top Products Table
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Top Products Sold', 14, nextY);

  const productRows = productData.map(p => [
    p.productName,
    p.sku,
    `${p.dozensSold.toFixed(1)} doz`,
    `${Math.round(p.dozensSold * 12)} pairs`,
    formatCurrency(p.revenue, settings.currencySymbol),
    formatCurrency(p.profit, settings.currencySymbol),
  ]);

  autoTable(doc, {
    startY: nextY + 4,
    head: [['Product Name', 'SKU', 'Dozens Sold', 'Equivalent Pairs', 'Revenue', 'Profit']],
    body: productRows,
    theme: 'grid',
    headStyles: { fillColor: [30, 41, 59], fontSize: 8.5, textColor: [255, 255, 255] },
    styles: { fontSize: 8.5, cellPadding: 3 },
  });

  doc.save(`Wholesale_Report_${Date.now()}.pdf`);
}

export function generateWhatsAppMessageText(order: Order, settings: CompanySettings): string {
  const itemsText = order.items
    .map(
      (item, idx) =>
        `${idx + 1}. *${item.productName}*\n   Qty: ${item.quantityDozens} doz (${item.quantityPairs} pairs) @ ${formatCurrency(item.pricePerDozen, settings.currencySymbol)}/doz = ${formatCurrency(item.subtotal, settings.currencySymbol)}`
    )
    .join('\n\n');

  const message = `*${settings.companyName}*
*WHOLESALE SALES RECEIPT*
----------------------------------------
*Receipt #:* ${order.receiptNumber}
*Date:* ${formatDateTime(order.date)}
*Customer:* ${order.customerName || 'Valued Customer'}
*Seller:* ${order.sellerName}
----------------------------------------
*ITEMS:*
${itemsText}
----------------------------------------
*Total Dozens:* ${order.totalDozens} doz (${order.totalPairs} pairs)
*TOTAL AMOUNT:* *${formatCurrency(order.totalAmount, settings.currencySymbol)}*
*Status:* ${order.status.toUpperCase()}
----------------------------------------
${settings.receiptFooterNote || 'Thank you for your business!'}`;

  return encodeURIComponent(message);
}
