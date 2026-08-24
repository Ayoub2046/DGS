import { Product, Category, Order } from '../types';

export interface CsvImportResult {
  addedCount: number;
  updatedCount: number;
  errors: string[];
  importedProducts: Product[];
}

export function generateProductCsvTemplate(): string {
  const headers = [
    'Product Name',
    'SKU',
    'Category',
    'Quantity Pairs',
    'Cost per Dozen',
    'Last Price',
    'Description',
  ];

  const sampleRows = [
    [
      'AeroFlex High Performance Runner',
      'AER-RUN-11',
      'Athletic Sneakers',
      '240',
      '230.00',
      '295.00',
      'Lightweight athletic running shoes in dozen packs',
    ],
    [
      'Chelsea Leather Slip-On Boot',
      'CHL-BOT-12',
      'Work & Safety Boots',
      '120',
      '480.00',
      '620.00',
      'Full grain leather water-resistant Chelsea boots',
    ],
    [
      'Cushion Comfort Ankle Socks Pack',
      'SCK-ANK-13',
      'Bulk Athletic Socks',
      '600',
      '22.00',
      '34.00',
      'Breathable combed cotton wholesale socks',
    ],
  ];

  const csvContent = [
    headers.join(','),
    ...sampleRows.map(row => row.map(val => `"${val.replace(/"/g, '""')}"`).join(',')),
  ].join('\n');

  return csvContent;
}

export function downloadCsvFile(filename: string, content: string): void {
  // Prepend UTF-8 BOM for Microsoft Excel compatibility
  const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function parseCsvText(text: string): string[][] {
  const lines: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        currentField += '"';
        i++; // skip next quote
      } else if (char === '"') {
        inQuotes = false;
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        currentRow.push(currentField.trim());
        currentField = '';
      } else if (char === '\r') {
        // ignore
      } else if (char === '\n') {
        currentRow.push(currentField.trim());
        if (currentRow.some(c => c.length > 0)) {
          lines.push(currentRow);
        }
        currentRow = [];
        currentField = '';
      } else {
        currentField += char;
      }
    }
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some(c => c.length > 0)) {
      lines.push(currentRow);
    }
  }

  return lines;
}

export function processProductCsvImport(
  csvText: string,
  existingProducts: Product[],
  categories: Category[]
): CsvImportResult {
  const rows = parseCsvText(csvText);
  if (rows.length < 2) {
    return {
      addedCount: 0,
      updatedCount: 0,
      errors: ['The CSV file is empty or missing headers.'],
      importedProducts: existingProducts,
    };
  }

  const headers = rows[0].map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
  const nameIdx = headers.findIndex(h => h.includes('name') || h.includes('product'));
  const skuIdx = headers.findIndex(h => h.includes('sku') || h.includes('upc') || h.includes('code'));
  const catIdx = headers.findIndex(h => h.includes('cat'));
  const qtyIdx = headers.findIndex(h => h.includes('qty') || h.includes('quant') || h.includes('pair'));
  const costIdx = headers.findIndex(h => h.includes('cost'));
  const lastPriceIdx = headers.findIndex(h => h.includes('last') || h.includes('floor') || h.includes('min'));
  const descIdx = headers.findIndex(h => h.includes('desc'));

  if (nameIdx === -1) {
    return {
      addedCount: 0,
      updatedCount: 0,
      errors: ['Could not find a "Product Name" column in the header row.'],
      importedProducts: existingProducts,
    };
  }

  let addedCount = 0;
  let updatedCount = 0;
  const errors: string[] = [];
  const updatedProductList = [...existingProducts];

  // Helper to match or create category
  const categoryMap = new Map<string, string>();
  categories.forEach(c => categoryMap.set(c.name.toLowerCase(), c.id));
  const defaultCategoryId = categories[0]?.id || 'cat-1';

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const name = row[nameIdx]?.trim();
    if (!name) continue; // Skip empty rows

    const sku = skuIdx !== -1 && row[skuIdx] ? row[skuIdx].trim() : `SKU-${Date.now()}-${r}`;
    const rawCat = catIdx !== -1 ? row[catIdx]?.trim() : '';
    const categoryId = rawCat && categoryMap.has(rawCat.toLowerCase())
      ? categoryMap.get(rawCat.toLowerCase())!
      : defaultCategoryId;

    const rawQty = qtyIdx !== -1 ? parseFloat(row[qtyIdx]?.replace(/[^0-9.-]/g, '')) : 0;
    const quantityPairs = isNaN(rawQty) ? 0 : Math.max(0, Math.round(rawQty));

    const rawCost = costIdx !== -1 ? parseFloat(row[costIdx]?.replace(/[^0-9.-]/g, '')) : 0;
    const costPerDozen = isNaN(rawCost) ? 0 : Math.max(0, rawCost);

    const rawLastPrice = lastPriceIdx !== -1 ? parseFloat(row[lastPriceIdx]?.replace(/[^0-9.-]/g, '')) : 0;
    const initialLastPrice = isNaN(rawLastPrice) || rawLastPrice <= 0
      ? (costPerDozen > 0 ? Number((costPerDozen * 1.25).toFixed(2)) : 50)
      : rawLastPrice;

    const description = descIdx !== -1 ? row[descIdx]?.trim() : '';

    // Check for duplicate by SKU or by Product Name (case-insensitive)
    const existingIndex = updatedProductList.findIndex(
      p => (sku && p.sku.toLowerCase() === sku.toLowerCase()) || p.name.toLowerCase() === name.toLowerCase()
    );

    if (existingIndex !== -1) {
      // DUPLICATE RULE AS PER PRD:
      // "Duplicate Handling: Update only quantity and cost – Last Price stays unchanged"
      const current = updatedProductList[existingIndex];
      updatedProductList[existingIndex] = {
        ...current,
        quantityPairs: quantityPairs,
        costPerDozen: costPerDozen > 0 ? costPerDozen : current.costPerDozen,
        // Last price STAYS UNCHANGED
        lastPrice: current.lastPrice,
        description: description || current.description,
      };
      updatedCount++;
    } else {
      // Add as new product
      const newProduct: Product = {
        id: `prod-imp-${Date.now()}-${r}`,
        name,
        sku,
        categoryId,
        quantityPairs,
        costPerDozen,
        lastPrice: initialLastPrice,
        createdAt: new Date().toISOString(),
        description,
      };
      updatedProductList.push(newProduct);
      addedCount++;
    }
  }

  return {
    addedCount,
    updatedCount,
    errors,
    importedProducts: updatedProductList,
  };
}

export function exportProductsToCsv(products: Product[], categories: Category[]): string {
  const catMap = new Map(categories.map(c => [c.id, c.name]));
  const headers = [
    'Product Name',
    'SKU',
    'Category',
    'Stock Pairs',
    'Stock Dozens',
    'Cost / Dozen',
    'Last Price / Dozen',
    'Total Stock Value (Cost)',
  ];

  const rows = products.map(p => {
    const dozens = (p.quantityPairs / 12).toFixed(2);
    const stockVal = ((p.quantityPairs / 12) * p.costPerDozen).toFixed(2);
    return [
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.sku}"`,
      `"${catMap.get(p.categoryId) || 'General'}"`,
      p.quantityPairs.toString(),
      dozens,
      p.costPerDozen.toFixed(2),
      p.lastPrice.toFixed(2),
      stockVal,
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

export function exportOrdersToCsv(orders: Order[]): string {
  const headers = [
    'Receipt #',
    'Date & Time',
    'Seller Name',
    'Customer Name',
    'Customer Phone',
    'Status',
    'Total Dozens Sold',
    'Total Pairs Sold',
    'Total Revenue',
    'Total Cost',
    'Gross Profit',
    'Item Details',
  ];

  const rows = orders.map(o => {
    const itemDetails = o.items
      .map(i => `${i.productName} (${i.quantityDozens} doz @ $${i.pricePerDozen.toFixed(2)})`)
      .join('; ');

    return [
      `"${o.receiptNumber}"`,
      `"${o.date}"`,
      `"${o.sellerName.replace(/"/g, '""')}"`,
      `"${o.customerName.replace(/"/g, '""')}"`,
      `"${o.customerPhone}"`,
      `"${o.status}"`,
      o.totalDozens.toFixed(2),
      o.totalPairs.toString(),
      o.totalAmount.toFixed(2),
      o.totalCost.toFixed(2),
      o.totalProfit.toFixed(2),
      `"${itemDetails.replace(/"/g, '""')}"`,
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}
