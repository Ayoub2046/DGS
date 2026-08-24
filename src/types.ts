export type UserRole = 'admin' | 'seller';

export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  avatarUrl?: string;
  phone?: string;
  password?: string;
  pin?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  categoryId: string;
  quantityPairs: number; // Total stock in Pairs
  costPerDozen: number;  // What company pays per dozen
  lastPrice: number;     // Floor selling price per dozen (manually set by Admin)
  createdAt: string;
  imageUrl?: string;
  description?: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  sku: string;
  quantityDozens: number; // Decimals allowed (e.g., 0.5, 1.5)
  quantityPairs: number;  // Calculated: quantityDozens * 12
  costPerDozen: number;   // Cost snapshot at time of sale
  pricePerDozen: number;  // Must be >= lastPrice
  lastPriceSnapshot: number; // Last price floor snapshot
  subtotal: number;       // quantityDozens * pricePerDozen
}

export type OrderStatus = 'completed' | 'cancelled';

export interface Order {
  id: string;
  receiptNumber: string;
  sellerId: string;
  sellerName: string;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  totalDozens: number;
  totalPairs: number;
  totalCost: number;
  totalAmount: number;
  totalProfit: number;
  date: string; // ISO String
  status: OrderStatus;
  notes?: string;
}

export interface CancellationLog {
  id: string;
  orderId: string;
  receiptNumber: string;
  cancelledByUserId: string;
  cancelledByName: string;
  cancelledByRole: UserRole;
  reason: string;
  timestamp: string;
  itemsRestored: {
    productId: string;
    productName: string;
    pairsRestored: number;
  }[];
}

export interface PriceChangeLog {
  id: string;
  productId: string;
  productName: string;
  changedByUserId: string;
  changedByName: string;
  oldPrice: number;
  newPrice: number;
  reason: string;
  timestamp: string;
}

export type NotificationType = 'low_stock' | 'price_change' | 'order_cancelled' | 'system' | 'security';

export interface InAppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  linkTab?: string;
  metadata?: Record<string, any>;
}

export interface CompanySettings {
  companyName: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  taxId?: string;
  currencySymbol: string;
  currencyCode: string;
  timezone: string;
  lowStockThresholdPairs: number; // e.g. 50 pairs
  receiptFooterNote: string;
  adminPin?: string;
  sessionTimeoutMinutes?: number;
}
