import React, { useState, useMemo } from 'react';
import {
  Package,
  Search,
  Filter,
  ShoppingCart,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Layers,
  ArrowRight,
  Calculator,
  Info,
  DollarSign,
  Tag,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import {
  formatCurrency,
  formatDozens,
  formatPairs,
  formatDozensAndPairs,
} from '../../utils/formatters';

export const ProductCatalogView: React.FC = () => {
  const { products, categories, settings, navigateTo, setPreloadedPosProduct } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');

  // Calculator modal state
  const [calcProduct, setCalcProduct] = useState<Product | null>(null);
  const [calcInputDozens, setCalcInputDozens] = useState<string>('1');
  const [calcInputPrice, setCalcInputPrice] = useState<string>('');

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCat = selectedCategory === 'all' || product.categoryId === selectedCategory;

      let matchesStock = true;
      if (stockFilter === 'in_stock') {
        matchesStock = product.quantityPairs > settings.lowStockThresholdPairs;
      } else if (stockFilter === 'low_stock') {
        matchesStock = product.quantityPairs > 0 && product.quantityPairs <= settings.lowStockThresholdPairs;
      } else if (stockFilter === 'out_of_stock') {
        matchesStock = product.quantityPairs === 0;
      }

      return matchesSearch && matchesCat && matchesStock;
    });
  }, [products, searchQuery, selectedCategory, stockFilter, settings.lowStockThresholdPairs]);

  const handleStartSale = (product: Product) => {
    setPreloadedPosProduct(product);
    navigateTo('sales-pos');
  };

  const getCategoryName = (catId: string) => {
    return categories.find(c => c.id === catId)?.name || 'General Wholesale';
  };

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Package className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Wholesale Product Catalog & Stock</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Browse live warehouse inventory in Dozens & Pairs, check price floors, and launch instant sales.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigateTo('sales-pos')}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-md transition-all cursor-pointer"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Go to Sales POS</span>
        </button>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Items</span>
          <p className="text-xl font-bold text-slate-900 mt-1">{products.length} products</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Warehouse Stock</span>
          <p className="text-xl font-bold text-emerald-600 mt-1">
            {formatDozens(products.reduce((acc, p) => acc + p.quantityPairs / 12, 0))}
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Pairs</span>
          <p className="text-xl font-bold text-indigo-600 mt-1">
            {formatPairs(products.reduce((acc, p) => acc + p.quantityPairs, 0))}
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Low Stock Alert</span>
          <p className="text-xl font-bold text-amber-600 mt-1">
            {products.filter(p => p.quantityPairs <= settings.lowStockThresholdPairs).length} items
          </p>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by product name, SKU or keyword..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>

          {/* Category Dropdown */}
          <div className="sm:w-56">
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-medium text-slate-700"
            >
              <option value="all">All Categories ({categories.length})</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Stock Filter */}
          <div className="sm:w-44">
            <select
              value={stockFilter}
              onChange={e => setStockFilter(e.target.value as any)}
              className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-medium text-slate-700"
            >
              <option value="all">All Stock Levels</option>
              <option value="in_stock">In Stock</option>
              <option value="low_stock">Low Stock (≤{settings.lowStockThresholdPairs} pairs)</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
          </div>
        </div>
      </div>

      {/* Product Catalog Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No matching products found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search terms or filters to view wholesale inventory.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredProducts.map(product => {
            const isOutOfStock = product.quantityPairs === 0;
            const isLowStock = product.quantityPairs > 0 && product.quantityPairs <= settings.lowStockThresholdPairs;
            const stockDozens = product.quantityPairs / 12;

            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 p-5 shadow-xs transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      {getCategoryName(product.categoryId)}
                    </span>
                    {isOutOfStock ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                        <XCircle className="w-3 h-3" /> Out of Stock
                      </span>
                    ) : isLowStock ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                        <AlertTriangle className="w-3 h-3" /> Low Stock
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" /> In Stock
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 mt-2.5 line-clamp-1">{product.name}</h3>
                  <p className="text-[11px] font-mono text-slate-400 mt-0.5">SKU: {product.sku}</p>

                  {product.description && (
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  )}

                  {/* Stock & Pricing Details Box */}
                  <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">Available Stock</span>
                      <p className="text-xs font-bold text-slate-800 mt-0.5">
                        {formatDozens(stockDozens)}
                      </p>
                      <span className="text-[10px] text-slate-500 font-medium">({formatPairs(product.quantityPairs)})</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">Last Price (Floor)</span>
                      <p className="text-xs font-bold text-emerald-600 mt-0.5">
                        {formatCurrency(product.lastPrice, settings.currencySymbol)} / doz
                      </p>
                      <span className="text-[10px] text-slate-500 font-medium">
                        ({formatCurrency(product.lastPrice / 12, settings.currencySymbol)}/pair)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCalcProduct(product);
                      setCalcInputDozens('1');
                      setCalcInputPrice(product.lastPrice.toString());
                    }}
                    className="p-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
                    title="Open Dozen Converter"
                  >
                    <Calculator className="w-3.5 h-3.5" />
                    <span>Calc</span>
                  </button>

                  <button
                    type="button"
                    disabled={isOutOfStock}
                    onClick={() => handleStartSale(product)}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      isOutOfStock
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                    }`}
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>{isOutOfStock ? 'Unavailable' : 'Add to POS Sale'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Dozen Calculator Modal */}
      {calcProduct && (
        <div
          id="calc-modal-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
        >
          <div className="w-full max-w-md bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                  <Calculator className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{calcProduct.name}</h3>
                  <p className="text-[11px] text-slate-400">Dozen & Price Floor Calculator</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCalcProduct(null)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Quantity in Dozens (1 doz = 12 pairs)
                </label>
                <input
                  type="number"
                  step="0.25"
                  min="0.25"
                  value={calcInputDozens}
                  onChange={e => setCalcInputDozens(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 text-sm"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  = <strong>{Math.round((parseFloat(calcInputDozens) || 0) * 12)}</strong> individual pairs
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Proposed Price per Dozen (Minimum Floor: {formatCurrency(calcProduct.lastPrice, settings.currencySymbol)})
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={calcInputPrice}
                  onChange={e => setCalcInputPrice(e.target.value)}
                  className={`w-full p-2 bg-slate-50 border rounded-xl font-bold text-sm ${
                    parseFloat(calcInputPrice) < calcProduct.lastPrice
                      ? 'border-rose-300 text-rose-700 bg-rose-50'
                      : 'border-slate-200 text-slate-900'
                  }`}
                />
                {parseFloat(calcInputPrice) < calcProduct.lastPrice && (
                  <p className="text-[10px] text-rose-600 font-bold mt-1">
                    ⚠️ Price is below the Last Price floor! Sale will be blocked.
                  </p>
                )}
              </div>

              {/* Calculated Totals Box */}
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-1.5 mt-2">
                <div className="flex justify-between">
                  <span className="text-slate-600">Total Order Volume:</span>
                  <span className="font-bold text-slate-900">
                    {parseFloat(calcInputDozens) || 0} doz ({Math.round((parseFloat(calcInputDozens) || 0) * 12)} pairs)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Total Sale Amount:</span>
                  <span className="font-bold text-emerald-700 text-sm">
                    {formatCurrency(
                      (parseFloat(calcInputDozens) || 0) * (parseFloat(calcInputPrice) || 0),
                      settings.currencySymbol
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCalcProduct(null)}
                className="flex-1 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  handleStartSale(calcProduct);
                  setCalcProduct(null);
                }}
                className="flex-1 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
              >
                Load to POS Sale
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
