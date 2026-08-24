import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Package,
  Layers,
  ArrowRight,
  User as UserIcon,
  Phone,
  DollarSign,
  Info,
  Sparkles,
  ShieldAlert,
  Database,
  Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import {
  formatCurrency,
  formatDozens,
  formatPairs,
  formatDozensAndPairs,
} from '../../utils/formatters';

interface CartItem {
  product: Product;
  quantityDozens: number;
  pricePerDozen: number;
}

interface SellerSalesDashboardProps {
  onOrderCreated?: (order: any) => void;
}

export const SellerSalesDashboard: React.FC<SellerSalesDashboardProps> = ({ onOrderCreated }) => {
  const {
    products,
    categories,
    settings,
    currentUser,
    createOrder,
    setRecentActiveReceipt,
    orders,
    preloadedPosProduct,
    setPreloadedPosProduct,
    navigateTo,
    seedDatabaseToSupabase,
    isSupabaseLoading,
  } = useApp();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'out_of_stock'>('all');

  // Customer Info State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [orderNotes, setOrderNotes] = useState('');

  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Listen to preloaded product from Catalog
  React.useEffect(() => {
    if (preloadedPosProduct) {
      handleAddToCart(preloadedPosProduct);
      setPreloadedPosProduct(null);
    }
  }, [preloadedPosProduct]);

  // Existing customer auto-suggest
  const pastCustomers = useMemo(() => {
    const map = new Map<string, string>();
    orders.forEach(o => {
      if (o.customerName && o.customerPhone) {
        map.set(o.customerName, o.customerPhone);
      }
    });
    return Array.from(map.entries()).map(([name, phone]) => ({ name, phone }));
  }, [orders]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCat =
        selectedCategory === 'all' || p.categoryId === selectedCategory;

      const isOutOfStock = p.quantityPairs <= 0;
      const matchesStock =
        stockFilter === 'all' ||
        (stockFilter === 'in_stock' && !isOutOfStock) ||
        (stockFilter === 'out_of_stock' && isOutOfStock);

      return matchesSearch && matchesCat && matchesStock;
    });
  }, [products, searchQuery, selectedCategory, stockFilter]);

  // Add Product to Cart
  const handleAddToCart = (product: Product) => {
    setErrorMessage(null);
    if (product.quantityPairs <= 0) {
      setErrorMessage(`Cannot add "${product.name}" because it is currently Out of Stock.`);
      return;
    }

    const existingIndex = cart.findIndex(item => item.product.id === product.id);
    if (existingIndex !== -1) {
      // Increase by 1 dozen if stock permits
      const current = cart[existingIndex];
      const newDozens = current.quantityDozens + 1;
      const requiredPairs = Math.round(newDozens * 12);

      if (requiredPairs > product.quantityPairs) {
        setErrorMessage(`Cannot exceed available stock of ${product.quantityPairs} pairs (${(product.quantityPairs / 12).toFixed(2)} doz) for ${product.name}.`);
        return;
      }

      const updated = [...cart];
      updated[existingIndex] = {
        ...current,
        quantityDozens: newDozens,
      };
      setCart(updated);
    } else {
      // Add new item with default quantity = 1 dozen and selling price = Last Price
      setCart(prev => [
        ...prev,
        {
          product,
          quantityDozens: 1,
          pricePerDozen: product.lastPrice,
        },
      ]);
    }
  };

  // Update Cart Item Dozens (decimals allowed)
  const handleUpdateDozens = (productId: string, newDozens: number) => {
    setErrorMessage(null);
    if (newDozens <= 0) {
      handleRemoveItem(productId);
      return;
    }

    const item = cart.find(i => i.product.id === productId);
    if (!item) return;

    const pairsNeeded = Math.round(newDozens * 12);
    if (pairsNeeded > item.product.quantityPairs) {
      setErrorMessage(`Stock Limit: Only ${item.product.quantityPairs} pairs (${(item.product.quantityPairs / 12).toFixed(2)} doz) available for ${item.product.name}.`);
      return;
    }

    setCart(prev =>
      prev.map(i =>
        i.product.id === productId ? { ...i, quantityDozens: Number(newDozens.toFixed(2)) } : i
      )
    );
  };

  // Quick increment/decrement helper for half-dozens (0.5)
  const handleStepDozens = (productId: string, delta: number) => {
    const item = cart.find(i => i.product.id === productId);
    if (!item) return;
    const newQty = Math.max(0.5, item.quantityDozens + delta);
    handleUpdateDozens(productId, newQty);
  };

  // Update Selling Price Per Dozen
  const handleUpdatePrice = (productId: string, newPrice: number) => {
    setErrorMessage(null);
    setCart(prev =>
      prev.map(i =>
        i.product.id === productId ? { ...i, pricePerDozen: newPrice } : i
      )
    );
  };

  // Remove from Cart
  const handleRemoveItem = (productId: string) => {
    setCart(prev => prev.filter(i => i.product.id !== productId));
  };

  // Check if any cart item violates Last Price floor
  const priceViolations = useMemo(() => {
    return cart.filter(item => item.pricePerDozen < item.product.lastPrice);
  }, [cart]);

  // Check if any cart item violates Stock limits
  const stockViolations = useMemo(() => {
    return cart.filter(
      item => Math.round(item.quantityDozens * 12) > item.product.quantityPairs
    );
  }, [cart]);

  // Cart Calculations
  const cartSummary = useMemo(() => {
    let totalDozens = 0;
    let totalPairs = 0;
    let totalAmount = 0;

    cart.forEach(item => {
      totalDozens += item.quantityDozens;
      totalPairs += Math.round(item.quantityDozens * 12);
      totalAmount += item.quantityDozens * item.pricePerDozen;
    });

    return {
      totalDozens: Number(totalDozens.toFixed(2)),
      totalPairs,
      totalAmount: Number(totalAmount.toFixed(2)),
    };
  }, [cart]);

  // Handle Order Submit
  const handleCheckout = () => {
    setErrorMessage(null);
    if (cart.length === 0) {
      setErrorMessage('Please add at least one product to the order.');
      return;
    }

    // STRICT PRD ENFORCEMENT
    if (priceViolations.length > 0) {
      const bad = priceViolations[0];
      setErrorMessage(
        `BLOCKED: Price for "${bad.product.name}" ($${bad.pricePerDozen.toFixed(2)}/doz) is BELOW the Last Price floor ($${bad.product.lastPrice.toFixed(2)}/doz). The system does not permit sales below Last Price.`
      );
      return;
    }

    if (stockViolations.length > 0) {
      const bad = stockViolations[0];
      setErrorMessage(
        `BLOCKED: Insufficient stock for "${bad.product.name}". Requested: ${Math.round(bad.quantityDozens * 12)} pairs, Available: ${bad.product.quantityPairs} pairs.`
      );
      return;
    }

    const itemsInput = cart.map(item => ({
      productId: item.product.id,
      quantityDozens: item.quantityDozens,
      pricePerDozen: item.pricePerDozen,
    }));

    const result = createOrder({
      customerName: customerName || 'Walk-in Wholesale Customer',
      customerPhone,
      items: itemsInput,
      notes: orderNotes,
    });

    if (result.success && result.order) {
      // Clear form
      setCart([]);
      setCustomerName('');
      setCustomerPhone('');
      setOrderNotes('');
      setSuccessMessage(`Order ${result.order.receiptNumber} successfully created and stock updated!`);
      if (onOrderCreated) {
        onOrderCreated(result.order);
      }
      setTimeout(() => setSuccessMessage(null), 5000);
    } else {
      setErrorMessage(result.error || 'Failed to create order. Please check inputs.');
    }
  };

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl lg:text-2xl font-bold text-slate-900 tracking-tight">
              Wholesale Sales POS Terminal
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              Active Seller: {currentUser.fullName}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Create wholesale sales in <strong>Dozens (12 pairs)</strong>. Half-dozens permitted. Strict <strong>Last Price</strong> floor enforced.
          </p>
        </div>

        {/* Units Reminder Chip */}
        <div className="flex items-center gap-3 px-3.5 py-2 bg-slate-100/90 rounded-xl border border-slate-200 text-xs text-slate-700">
          <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
          <span>
            <strong>Unit Rule:</strong> 1 Dozen = 12 Pairs | Stock deducted in exact pairs
          </span>
        </div>
      </div>

      {/* Alert Messages */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3 animate-in fade-in duration-150">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Pricing or Stock Rule Blocked</p>
            <p className="text-xs mt-0.5 text-rose-700">{errorMessage}</p>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-xs text-rose-500 hover:text-rose-800 font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between animate-in fade-in duration-150">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="font-semibold">{successMessage}</p>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="text-xs text-emerald-600 hover:text-emerald-900 font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Grid: Catalog on Left (60%), Cart / Checkout on Right (40%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Product Selection Catalog */}
        <div className="lg:col-span-7 space-y-4">
          {/* Search & Filters Card */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  id="input-pos-search"
                  type="text"
                  placeholder="Search products by name, SKU, keywords..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                />
              </div>

              <select
                id="select-pos-category"
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="py-2 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-700"
              >
                <option value="all">All Categories ({products.length})</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <select
                id="select-pos-stock-filter"
                value={stockFilter}
                onChange={e => setStockFilter(e.target.value as any)}
                className="py-2 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-700"
              >
                <option value="all">All Stock Status</option>
                <option value="in_stock">In Stock Only</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>
          </div>

          {/* Product Cards List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
            {products.length === 0 ? (
              <div className="col-span-2 p-10 bg-white rounded-2xl border border-slate-200 text-center space-y-3.5">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">Supabase Database Connected (0 Products)</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Your database has no products yet. Add products in Admin Inventory or seed sample wholesale shoes to start making sales.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => navigateTo('products')}
                    className="px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl cursor-pointer shadow-xs"
                  >
                    Go to Products & Inventory
                  </button>
                  <button
                    type="button"
                    onClick={() => seedDatabaseToSupabase()}
                    disabled={isSupabaseLoading}
                    className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
                  >
                    <Zap className={`w-3.5 h-3.5 text-amber-500 ${isSupabaseLoading ? 'animate-spin' : ''}`} />
                    <span>Seed Sample Catalog</span>
                  </button>
                </div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="col-span-2 p-12 bg-white rounded-2xl border border-slate-200 text-center text-slate-400">
                <Package className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm font-semibold text-slate-600">No products match your search.</p>
                <p className="text-xs mt-1">Try changing category filters or clear search.</p>
              </div>
            ) : (
              filteredProducts.map(product => {
                const isOutOfStock = product.quantityPairs <= 0;
                const isLowStock =
                  product.quantityPairs > 0 &&
                  product.quantityPairs <= settings.lowStockThresholdPairs;
                const inCart = cart.find(i => i.product.id === product.id);

                return (
                  <div
                    key={product.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                      isOutOfStock
                        ? 'bg-slate-50 border-slate-200 opacity-75'
                        : inCart
                        ? 'bg-indigo-50/40 border-indigo-300 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                    }`}
                  >
                    <div>
                      {/* Category & Status badges */}
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <span className="text-[11px] font-semibold text-indigo-600 truncate max-w-[130px]">
                          {categories.find(c => c.id === product.categoryId)?.name || 'General'}
                        </span>
                        {isOutOfStock ? (
                          <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-slate-200 text-slate-700">
                            Out of Stock
                          </span>
                        ) : isLowStock ? (
                          <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                            Low Stock
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-emerald-100 text-emerald-800">
                            In Stock
                          </span>
                        )}
                      </div>

                      {/* Name & SKU */}
                      <h3 className="text-sm font-bold text-slate-900 line-clamp-1 leading-snug">
                        {product.name}
                      </h3>
                      <p className="text-xs font-mono text-slate-400 mt-0.5">SKU: {product.sku}</p>

                      {/* Stock & Dozens Info */}
                      <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">Available Stock:</span>
                          <span className={`font-bold font-mono ${isOutOfStock ? 'text-rose-600' : 'text-slate-900'}`}>
                            {product.quantityPairs} pairs ({formatDozens(product.quantityPairs / 12)})
                          </span>
                        </div>
                        <div className="flex justify-between text-xs items-center pt-1 border-t border-slate-200/60">
                          <span className="text-slate-600 font-medium">Floor (Last Price):</span>
                          <span className="font-bold text-indigo-700 font-mono">
                            {formatCurrency(product.lastPrice, settings.currencySymbol)}/doz
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="mt-3 pt-2">
                      <button
                        type="button"
                        disabled={isOutOfStock}
                        onClick={() => handleAddToCart(product)}
                        className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                          isOutOfStock
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            : inCart
                            ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                            : 'bg-slate-900 hover:bg-slate-800 text-white'
                        }`}
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>
                          {isOutOfStock
                            ? 'Out of Stock (Not Sellable)'
                            : inCart
                            ? `In Order (${inCart.quantityDozens} doz) • Add +1`
                            : 'Add to Wholesale Order'}
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Order Builder & Cart */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-5 sticky top-20">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                <ShoppingCart className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Current Sales Order</h2>
                <p className="text-xs text-slate-400">{cart.length} item(s) in active cart</p>
              </div>
            </div>
            {cart.length > 0 && (
              <button
                type="button"
                onClick={() => setCart([])}
                className="text-xs text-slate-400 hover:text-rose-600 transition-colors"
              >
                Clear Cart
              </button>
            )}
          </div>

          {/* Customer Details Form */}
          <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-2.5">
            <p className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <UserIcon className="w-3.5 h-3.5 text-indigo-600" />
              Customer Information
            </p>
            <div>
              <input
                id="input-customer-name"
                type="text"
                list="past-customer-names"
                placeholder="Customer or Store Name (e.g. Metro Retailers)"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
              <datalist id="past-customer-names">
                {pastCustomers.map((c, i) => (
                  <option key={i} value={c.name} />
                ))}
              </datalist>
            </div>
            <div>
              <input
                id="input-customer-phone"
                type="text"
                placeholder="Customer Phone Number (e.g. +1 555 782-9011)"
                value={customerPhone}
                onChange={e => setCustomerPhone(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {cart.length === 0 ? (
              <div className="py-8 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-xs font-semibold text-slate-600">Your order is empty.</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Click "Add to Wholesale Order" on any product from the catalog.
                </p>
              </div>
            ) : (
              cart.map(item => {
                const isUnderLastPrice = item.pricePerDozen < item.product.lastPrice;
                const totalPairs = Math.round(item.quantityDozens * 12);
                const isOverStock = totalPairs > item.product.quantityPairs;
                const subtotal = item.quantityDozens * item.pricePerDozen;

                return (
                  <div
                    key={item.product.id}
                    className={`p-3 rounded-xl border transition-all ${
                      isUnderLastPrice || isOverStock
                        ? 'bg-rose-50/70 border-rose-300 ring-1 ring-rose-200'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    {/* Item Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                          {item.product.name}
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono mt-0.5">
                          <span>SKU: {item.product.sku}</span>
                          <span>•</span>
                          <span>Stock: {item.product.quantityPairs} pairs</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.product.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Quantity & Price Controls */}
                    <div className="mt-2.5 grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                      {/* Quantity in Dozens */}
                      <div>
                        <div className="flex justify-between items-center text-[10px] font-semibold text-slate-500 mb-1">
                          <span>Qty (Dozens):</span>
                          <span className="font-mono text-indigo-700 font-bold">
                            = {totalPairs} pairs
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleStepDozens(item.product.id, -0.5)}
                            className="w-6 h-7 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-bold text-xs"
                            title="Decrease 0.5 dozen"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            step="0.1"
                            min="0.1"
                            value={item.quantityDozens}
                            onChange={e =>
                              handleUpdateDozens(item.product.id, parseFloat(e.target.value) || 0)
                            }
                            className="w-full text-center py-1 text-xs font-bold font-mono bg-slate-50 border border-slate-200 rounded-md focus:bg-white"
                          />
                          <button
                            type="button"
                            onClick={() => handleStepDozens(item.product.id, 0.5)}
                            className="w-6 h-7 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-bold text-xs"
                            title="Increase 0.5 dozen"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Selling Price / Dozen */}
                      <div>
                        <div className="flex justify-between items-center text-[10px] font-semibold text-slate-500 mb-1">
                          <span>Price / Dozen:</span>
                          <span className="font-mono text-slate-400">
                            Min: ${item.product.lastPrice.toFixed(2)}
                          </span>
                        </div>
                        <div className="relative">
                          <span className="absolute left-2 top-1.5 text-[11px] text-slate-400">
                            {settings.currencySymbol}
                          </span>
                          <input
                            type="number"
                            step="1"
                            value={item.pricePerDozen}
                            onChange={e =>
                              handleUpdatePrice(item.product.id, parseFloat(e.target.value) || 0)
                            }
                            className={`w-full pl-5 pr-2 py-1 text-xs font-bold font-mono rounded-md border focus:bg-white ${
                              isUnderLastPrice
                                ? 'bg-rose-100 border-rose-400 text-rose-900'
                                : 'bg-slate-50 border-slate-200 text-slate-900'
                            }`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Floor Price Warning or Subtotal */}
                    <div className="mt-2 flex items-center justify-between text-xs pt-1.5 border-t border-slate-100">
                      {isUnderLastPrice ? (
                        <span className="text-[10px] font-bold text-rose-700 flex items-center gap-1">
                          <ShieldAlert className="w-3 h-3" />
                          Cannot sell below ${item.product.lastPrice.toFixed(2)}!
                        </span>
                      ) : isOverStock ? (
                        <span className="text-[10px] font-bold text-rose-700 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Exceeds available {item.product.quantityPairs} pairs!
                        </span>
                      ) : (
                        <span className="text-[10px] text-emerald-700 font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Valid Price & Stock
                        </span>
                      )}
                      <span className="font-bold text-slate-900 font-mono">
                        {formatCurrency(subtotal, settings.currencySymbol)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Order Notes */}
          <div>
            <textarea
              rows={2}
              placeholder="Optional order notes / terms (e.g. Net 15, Warehouse pickup dock B)..."
              value={orderNotes}
              onChange={e => setOrderNotes(e.target.value)}
              className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden"
            />
          </div>

          {/* Cart Totals Summary */}
          <div className="p-4 rounded-xl bg-slate-900 text-white space-y-2">
            <div className="flex justify-between items-center text-xs text-slate-300">
              <span>Total Volume:</span>
              <span className="font-bold font-mono">
                {cartSummary.totalDozens} Dozens ({cartSummary.totalPairs} Pairs)
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-sm">
              <span className="font-semibold text-slate-200">Total Sale Amount:</span>
              <span className="font-bold text-emerald-400 text-lg font-mono">
                {formatCurrency(cartSummary.totalAmount, settings.currencySymbol, settings.currencyCode)}
              </span>
            </div>
          </div>

          {/* Pricing Floor Warning Banner if invalid */}
          {priceViolations.length > 0 && (
            <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-rose-900 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
              <span>
                <strong>System Floor Protection:</strong> 1 or more items are priced below the required Last Price. Adjust prices to proceed.
              </span>
            </div>
          )}

          {/* Complete Order Button */}
          <button
            id="btn-pos-complete-sale"
            type="button"
            disabled={cart.length === 0 || priceViolations.length > 0 || stockViolations.length > 0}
            onClick={handleCheckout}
            className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-sm ${
              cart.length === 0 || priceViolations.length > 0 || stockViolations.length > 0
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-900/30'
            }`}
          >
            <span>Complete Wholesale Sale & Issue Receipt</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
