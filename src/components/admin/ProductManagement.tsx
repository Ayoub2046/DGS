import React, { useState, useMemo, useEffect } from 'react';
import {
  Package,
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  TrendingDown,
  FileSpreadsheet,
  Download,
  AlertTriangle,
  CheckCircle2,
  Layers,
  ArrowUpDown,
  Tag,
  DollarSign,
  ShieldCheck,
  Eye,
  Info,
  Database,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Product, Category } from '../../types';
import {
  formatCurrency,
  formatDozens,
  formatPairs,
  formatDate,
} from '../../utils/formatters';
import { exportProductsToCsv, downloadCsvFile } from '../../utils/csvHelper';

interface ProductManagementProps {
  onOpenCsvModal: () => void;
}

export const ProductManagement: React.FC<ProductManagementProps> = ({ onOpenCsvModal }) => {
  const {
    products,
    categories,
    addProduct,
    updateProduct,
    deleteProduct,
    updateLastPrice,
    settings,
    addCategory,
    deleteCategory,
    lowStockProducts,
    currentUser,
    navigationParams,
    refreshDataFromSupabase,
    seedDatabaseToSupabase,
    isSupabaseLoading,
    isSupabaseConnected,
  } = useApp();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState(navigationParams?.search || '');
  const [selectedCategory, setSelectedCategory] = useState(navigationParams?.category || 'all');
  const [stockStatusFilter, setStockStatusFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>(
    navigationParams?.stockFilter || 'all'
  );

  useEffect(() => {
    if (navigationParams?.stockFilter) {
      setStockStatusFilter(navigationParams.stockFilter);
    }
    if (navigationParams?.search) {
      setSearchQuery(navigationParams.search);
    }
    if (navigationParams?.category) {
      setSelectedCategory(navigationParams.category);
    }
  }, [navigationParams]);

  // Product Add / Edit Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    categoryId: '',
    quantityPairs: 120, // 10 dozens
    costPerDozen: 200,
    lastPrice: 260,
    description: '',
  });
  const [formError, setFormError] = useState<string | null>(null);

  // Adjust Last Price Modal State (Audited Admin Action)
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
  const [priceModalProduct, setPriceModalProduct] = useState<Product | null>(null);
  const [newLastPrice, setNewLastPrice] = useState<number>(0);
  const [priceReason, setPriceReason] = useState('');
  const [priceError, setPriceError] = useState<string | null>(null);

  // Category Manager Modal
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Delete confirmation
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCat =
        selectedCategory === 'all' || p.categoryId === selectedCategory;

      const isZero = p.quantityPairs <= 0;
      const isLow = p.quantityPairs > 0 && p.quantityPairs <= settings.lowStockThresholdPairs;

      const matchesStock =
        stockStatusFilter === 'all' ||
        (stockStatusFilter === 'in_stock' && !isZero && !isLow) ||
        (stockStatusFilter === 'low_stock' && isLow) ||
        (stockStatusFilter === 'out_of_stock' && isZero);

      return matchesSearch && matchesCat && matchesStock;
    });
  }, [products, searchQuery, selectedCategory, stockStatusFilter, settings.lowStockThresholdPairs]);

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingProductId(null);
    setFormData({
      name: '',
      sku: `SKU-${Date.now().toString().slice(-4)}`,
      categoryId: categories[0]?.id || 'cat-1',
      quantityPairs: 120, // 10 dozens
      costPerDozen: 200,
      lastPrice: 260,
      description: '',
    });
    setFormError(null);
    setIsProductModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (product: Product) => {
    setEditingProductId(product.id);
    setFormData({
      name: product.name,
      sku: product.sku,
      categoryId: product.categoryId,
      quantityPairs: product.quantityPairs,
      costPerDozen: product.costPerDozen,
      lastPrice: product.lastPrice,
      description: product.description || '',
    });
    setFormError(null);
    setIsProductModalOpen(true);
  };

  // Save Product
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.name.trim()) {
      setFormError('Product Name is strictly required.');
      return;
    }

    if (formData.quantityPairs < 0 || isNaN(formData.quantityPairs)) {
      setFormError('Quantity in pairs cannot be negative.');
      return;
    }

    if (formData.costPerDozen < 0 || isNaN(formData.costPerDozen)) {
      setFormError('Cost per dozen must be a valid non-negative number.');
      return;
    }

    if (formData.lastPrice <= 0 || isNaN(formData.lastPrice)) {
      setFormError('Last Price floor must be greater than 0.');
      return;
    }

    if (editingProductId) {
      updateProduct(editingProductId, {
        name: formData.name.trim(),
        sku: formData.sku.trim(),
        categoryId: formData.categoryId,
        quantityPairs: Math.round(formData.quantityPairs),
        costPerDozen: Number(formData.costPerDozen.toFixed(2)),
        // If updating an existing product's last price directly in edit mode, notify or update
        lastPrice: Number(formData.lastPrice.toFixed(2)),
        description: formData.description.trim(),
      });
    } else {
      addProduct({
        name: formData.name.trim(),
        sku: formData.sku.trim(),
        categoryId: formData.categoryId,
        quantityPairs: Math.round(formData.quantityPairs),
        costPerDozen: Number(formData.costPerDozen.toFixed(2)),
        lastPrice: Number(formData.lastPrice.toFixed(2)),
        description: formData.description.trim(),
      });
    }

    setIsProductModalOpen(false);
  };

  // Open Last Price Floor Adjustment Modal
  const handleOpenPriceModal = (product: Product) => {
    setPriceModalProduct(product);
    setNewLastPrice(product.lastPrice);
    setPriceReason('');
    setPriceError(null);
    setIsPriceModalOpen(true);
  };

  // Submit Last Price Floor Adjustment
  const handleSubmitPriceChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!priceModalProduct) return;
    setPriceError(null);

    if (newLastPrice <= 0) {
      setPriceError('Last Price must be greater than 0.');
      return;
    }

    if (!priceReason || priceReason.trim().length < 6) {
      setPriceError('Please enter a detailed explanation/reason for lowering or modifying the Last Price floor.');
      return;
    }

    const res = updateLastPrice(priceModalProduct.id, newLastPrice, priceReason);
    if (res.success) {
      setIsPriceModalOpen(false);
    } else {
      setPriceError(res.error || 'Failed to update Last Price.');
    }
  };

  // Export CSV
  const handleExportCsv = () => {
    const csvData = exportProductsToCsv(products, categories);
    downloadCsvFile(`WMS_Inventory_Export_${new Date().toISOString().slice(0, 10)}.csv`, csvData);
  };

  // Delete product
  const handleConfirmDelete = (id: string) => {
    deleteProduct(id);
    setDeleteConfirmId(null);
  };

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl lg:text-2xl font-bold text-slate-900 tracking-tight">
              Product & Wholesale Inventory
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">
              {products.length} SKUs
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage wholesale catalog, track stock in <strong>Pairs & Dozens (Quantity/12)</strong>, and enforce <strong>Last Price</strong> floors.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsCategoryModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition-colors shadow-xs"
          >
            <Tag className="w-3.5 h-3.5 text-indigo-600" />
            <span>Categories ({categories.length})</span>
          </button>
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition-colors shadow-xs"
            title="Download Excel / CSV inventory"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={onOpenCsvModal}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl transition-colors shadow-xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Bulk CSV Import</span>
          </button>
          <button
            id="btn-add-new-product"
            type="button"
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search products by name, SKU, or description..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          className="py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-700"
        >
          <option value="all">All Categories</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={stockStatusFilter}
          onChange={e => setStockStatusFilter(e.target.value as any)}
          className="py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-700"
        >
          <option value="all">All Stock Statuses</option>
          <option value="in_stock">Healthy Stock</option>
          <option value="low_stock">Low Stock (&lt;{settings.lowStockThresholdPairs} pairs)</option>
          <option value="out_of_stock">Out of Stock</option>
        </select>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {products.length === 0 ? (
          <div className="p-10 text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Database className="w-6 h-6" />
            </div>
            <div className="max-w-md mx-auto">
              <h3 className="text-base font-bold text-slate-900">Supabase Database Connected</h3>
              <p className="text-xs text-slate-500 mt-1">
                Your <span className="font-mono font-bold text-slate-700">products</span> table is ready in Supabase. You can record your own custom wholesale inventory directly, or populate sample catalog shoes to test the system.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleOpenCreateModal}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Your First Product</span>
              </button>

              <button
                type="button"
                onClick={() => seedDatabaseToSupabase()}
                disabled={isSupabaseLoading}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer disabled:opacity-50"
              >
                <Zap className={`w-4 h-4 text-amber-500 ${isSupabaseLoading ? 'animate-spin' : ''}`} />
                <span>Seed Sample Wholesale Shoes</span>
              </button>

              <button
                type="button"
                onClick={() => refreshDataFromSupabase()}
                disabled={isSupabaseLoading}
                className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl transition-all cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSupabaseLoading ? 'animate-spin' : ''}`} />
                <span>Sync with Supabase</span>
              </button>
            </div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Package className="w-10 h-10 mx-auto mb-2 opacity-40 text-slate-300" />
            <p className="text-sm font-semibold text-slate-700">No products match your criteria.</p>
            <p className="text-xs text-slate-500 mt-1">Try resetting filters or clear search query.</p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setStockStatusFilter('all');
              }}
              className="mt-3 px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-700 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Product Name & SKU</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3 text-right">Quantity (Pairs)</th>
                  <th className="py-3 px-3 text-right">Dozens (Pairs/12)</th>
                  <th className="py-3 px-3 text-right">Cost / Doz</th>
                  <th className="py-3 px-3 text-right">
                    <span className="text-indigo-700 flex items-center justify-end gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Last Price / Doz
                    </span>
                  </th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredProducts.map(product => {
                  const isOutOfStock = product.quantityPairs <= 0;
                  const isLowStock =
                    product.quantityPairs > 0 &&
                    product.quantityPairs <= settings.lowStockThresholdPairs;
                  const calculatedDozens = product.quantityPairs / 12;

                  return (
                    <tr
                      key={product.id}
                      className={`transition-colors ${
                        isOutOfStock
                          ? 'bg-slate-50/60 opacity-80'
                          : isLowStock
                          ? 'bg-amber-50/30 hover:bg-amber-50/60'
                          : 'hover:bg-slate-50/80'
                      }`}
                    >
                      {/* Product Name & SKU */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 line-clamp-1">{product.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          SKU: {product.sku}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium">
                          {categories.find(c => c.id === product.categoryId)?.name || 'General'}
                        </span>
                      </td>

                      {/* Stock in Pairs (PRD requirement) */}
                      <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-900">
                        {product.quantityPairs} pairs
                      </td>

                      {/* Calculated Dozens (PRD requirement: read-only Quantity / 12) */}
                      <td className="py-3.5 px-3 text-right font-mono text-indigo-700 font-semibold">
                        {calculatedDozens.toFixed(2)} doz
                      </td>

                      {/* Cost per Dozen */}
                      <td className="py-3.5 px-3 text-right font-mono text-slate-600">
                        {formatCurrency(product.costPerDozen, settings.currencySymbol, settings.currencyCode)}
                      </td>

                      {/* Last Price per Dozen (Strict Floor) */}
                      <td className="py-3.5 px-3 text-right font-mono">
                        <div className="inline-flex flex-col items-end">
                          <span className="font-bold text-indigo-700 text-xs">
                            {formatCurrency(product.lastPrice, settings.currencySymbol, settings.currencyCode)}
                          </span>
                          <span className="text-[10px] text-slate-400 font-sans">Floor Price</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3 text-center">
                        {isOutOfStock ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-200 text-slate-800">
                            Out of Stock
                          </span>
                        ) : isLowStock ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-800 border border-amber-300">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                            In Stock
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Floor price adjust button */}
                          <button
                            type="button"
                            onClick={() => handleOpenPriceModal(product)}
                            className="px-2 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-50 rounded-lg border border-indigo-200 transition-colors"
                            title="Adjust Last Price Floor (Logs Reason)"
                          >
                            Floor Price
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(product)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Edit Product Details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(product.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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

      {/* Product Add / Edit Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95">
            <form onSubmit={handleSaveProduct}>
              <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-base font-bold">
                    {editingProductId ? 'Edit Wholesale Product' : 'Add New Wholesale Product'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                {formError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
                    {formError}
                  </div>
                )}

                {/* Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Product Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AirSprint Pro Running Sneakers"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>

                {/* SKU and Category */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      SKU / UPC Code
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. ASP-RUN-01"
                      value={formData.sku}
                      onChange={e => setFormData({ ...formData, sku: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Category
                    </label>
                    <select
                      value={formData.categoryId}
                      onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-700"
                    >
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Quantity in Pairs & Calculated Dozens */}
                <div className="p-3.5 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                        Stock Quantity in Pairs <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        required
                        value={formData.quantityPairs}
                        onChange={e =>
                          setFormData({ ...formData, quantityPairs: parseInt(e.target.value) || 0 })
                        }
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl font-mono font-bold focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                      />
                      <span className="text-[10px] text-slate-500 mt-1 block">
                        Stored in warehouse as individual pairs
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                        Calculated Dozens (Read-Only)
                      </label>
                      <div className="px-3 py-2 text-xs font-bold font-mono bg-indigo-100/70 border border-indigo-200 rounded-xl text-indigo-900">
                        {(formData.quantityPairs / 12).toFixed(2)} Dozens
                      </div>
                      <span className="text-[10px] text-indigo-700 mt-1 block">
                        1 Dozen = 12 Pairs (Formula: Pairs / 12)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Pricing: Cost per Dozen & Last Price */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Cost per Dozen ({settings.currencySymbol})
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      value={formData.costPerDozen}
                      onChange={e =>
                        setFormData({ ...formData, costPerDozen: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      What the company pays per dozen
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-indigo-900 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                      Last Price Floor ({settings.currencySymbol})
                    </label>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      required
                      value={formData.lastPrice}
                      onChange={e =>
                        setFormData({ ...formData, lastPrice: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full px-3 py-2 text-xs bg-indigo-50/50 border border-indigo-300 rounded-xl font-mono font-bold text-indigo-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                    />
                    <span className="text-[10px] text-indigo-700 mt-1 block">
                      Minimum permitted selling price per dozen
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Product Description & Packaging Notes
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Assorted sizes, master carton packing specs, etc..."
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
              </div>

              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-xs"
                >
                  {editingProductId ? 'Save Product Changes' : 'Create Wholesale Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Adjust Last Price Floor Modal (Audited Admin Workflow) */}
      {isPriceModalOpen && priceModalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <form onSubmit={handleSubmitPriceChange}>
              <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-base font-bold">Adjust Last Price Floor</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPriceModalOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <p className="font-bold text-slate-900">{priceModalProduct.name}</p>
                  <p className="text-slate-500 font-mono mt-0.5">SKU: {priceModalProduct.sku}</p>
                  <div className="mt-2 pt-2 border-t border-slate-200 flex justify-between items-center">
                    <span className="text-slate-500">Current Last Price Floor:</span>
                    <span className="font-bold font-mono text-slate-900">
                      {formatCurrency(priceModalProduct.lastPrice, settings.currencySymbol)}/doz
                    </span>
                  </div>
                </div>

                {priceError && (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
                    {priceError}
                  </div>
                )}

                <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 text-xs text-indigo-900 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">PRD Audit Enforcement:</p>
                    <p className="text-[11px] text-indigo-800 mt-0.5">
                      Admins can lower or modify Last Price floors. This action is permanently logged to the audit trail and triggers an in-app notification.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    New Last Price Floor ({settings.currencySymbol} / Dozen) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    required
                    value={newLastPrice}
                    onChange={e => setNewLastPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm font-bold font-mono bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Reason / Business Explanation <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="e.g. Seasonal clearance discount approved, container supply cost renegotiation..."
                    value={priceReason}
                    onChange={e => setPriceReason(e.target.value)}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
              </div>

              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPriceModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-xs"
                >
                  Confirm & Log Price Floor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Manager Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold">Manage Product Categories</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="New Category Name..."
                  value={newCategoryName}
                  onChange={e => setNewCategoryName(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newCategoryName.trim()) {
                      addCategory(newCategoryName);
                      setNewCategoryName('');
                    }
                  }}
                  className="px-3 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl"
                >
                  Add
                </button>
              </div>

              <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                {categories.map(cat => {
                  const count = products.filter(p => p.categoryId === cat.id).length;
                  return (
                    <div key={cat.id} className="py-2.5 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-800">{cat.name}</p>
                        <p className="text-[10px] text-slate-400">{count} products assigned</p>
                      </div>
                      {categories.length > 1 && (
                        <button
                          type="button"
                          onClick={() => deleteCategory(cat.id)}
                          className="text-slate-300 hover:text-rose-600 p-1"
                          title="Delete category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-right">
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-xl"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4">
            <div className="p-2.5 rounded-xl bg-rose-100 text-rose-600 w-fit">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Delete Product</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to delete this product? Historical sales orders referencing this product will still be preserved.
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleConfirmDelete(deleteConfirmId)}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
