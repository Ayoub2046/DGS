import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  Product,
  Category,
  Order,
  User,
  PriceChangeLog,
  CancellationLog,
  InAppNotification,
  CompanySettings,
} from '../types';

// Default Supabase project configuration provided by the user
export const SUPABASE_URL =
  (typeof import.meta !== 'undefined' && ((import.meta as any).env?.VITE_SUPABASE_URL || (import.meta as any).env?.NEXT_PUBLIC_SUPABASE_URL)) ||
  'https://ghhldisvneqoxlmyapcx.supabase.co';

export const SUPABASE_ANON_KEY =
  (typeof import.meta !== 'undefined' && ((import.meta as any).env?.VITE_SUPABASE_ANON_KEY || (import.meta as any).env?.NEXT_PUBLIC_SUPABASE_ANON_KEY)) ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdoaGxkaXN2bmVxb3hsbXlhcGN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1NjAxMDQsImV4cCI6MjEwMzEzNjEwNH0.fmKPsEvezZZFgSzs4tXOzC7RPJT4GRu0E0KxmB1SDcQ';

// Create singleton client
export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  db: {
    schema: 'public',
  },
});

// Database Migration SQL for Supabase Table schema setup
export const SUPABASE_SCHEMA_SQL = `-- Wholesale Management System (WMS) Complete Database Schema
-- Run this in your Supabase SQL Editor if tables are not yet created.

-- 1. Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    sku TEXT UNIQUE NOT NULL,
    category_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
    quantity_pairs INTEGER NOT NULL DEFAULT 0,
    cost_per_dozen NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    last_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    image_url TEXT,
    description TEXT
);

-- 3. Users Table
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT,
    role TEXT NOT NULL CHECK (role IN ('admin', 'seller')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    avatar_url TEXT,
    phone TEXT,
    password TEXT,
    pin TEXT
);

-- 4. Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    receipt_number TEXT UNIQUE NOT NULL,
    seller_id TEXT,
    seller_name TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT,
    total_dozens NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total_pairs INTEGER NOT NULL DEFAULT 0,
    total_cost NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total_profit NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    date TIMESTAMPTZ DEFAULT NOW(),
    status TEXT NOT NULL CHECK (status IN ('completed', 'cancelled')),
    notes TEXT,
    items JSONB NOT NULL DEFAULT '[]'::jsonb
);

-- 5. Price Change Logs
CREATE TABLE IF NOT EXISTS public.price_change_logs (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    changed_by_user_id TEXT NOT NULL,
    changed_by_name TEXT NOT NULL,
    old_price NUMERIC(10, 2) NOT NULL,
    new_price NUMERIC(10, 2) NOT NULL,
    reason TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Cancellation Logs
CREATE TABLE IF NOT EXISTS public.cancellation_logs (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    receipt_number TEXT NOT NULL,
    cancelled_by_user_id TEXT NOT NULL,
    cancelled_by_name TEXT NOT NULL,
    cancelled_by_role TEXT NOT NULL,
    reason TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    items_restored JSONB NOT NULL DEFAULT '[]'::jsonb
);

-- 7. In-App Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    read BOOLEAN NOT NULL DEFAULT false,
    link_tab TEXT,
    metadata JSONB
);

-- 8. Company Settings
CREATE TABLE IF NOT EXISTS public.settings (
    id TEXT PRIMARY KEY DEFAULT 'default_company_settings',
    company_name TEXT NOT NULL,
    tagline TEXT,
    address TEXT,
    phone TEXT,
    email TEXT,
    tax_id TEXT,
    currency_symbol TEXT DEFAULT '$',
    currency_code TEXT DEFAULT 'USD',
    timezone TEXT DEFAULT 'America/New_York',
    low_stock_threshold_pairs INTEGER DEFAULT 50,
    receipt_footer_note TEXT,
    admin_pin TEXT DEFAULT '1234',
    session_timeout_minutes INTEGER DEFAULT 30
);

-- Enable Row Level Security (RLS) and allow public read/write for API access
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_change_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cancellation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Allow anon key access policies (idempotent)
DROP POLICY IF EXISTS "Allow anon all on categories" ON public.categories;
CREATE POLICY "Allow anon all on categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon all on products" ON public.products;
CREATE POLICY "Allow anon all on products" ON public.products FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon all on users" ON public.users;
CREATE POLICY "Allow anon all on users" ON public.users FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon all on orders" ON public.orders;
CREATE POLICY "Allow anon all on orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon all on price_change_logs" ON public.price_change_logs;
CREATE POLICY "Allow anon all on price_change_logs" ON public.price_change_logs FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon all on cancellation_logs" ON public.cancellation_logs;
CREATE POLICY "Allow anon all on cancellation_logs" ON public.cancellation_logs FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon all on notifications" ON public.notifications;
CREATE POLICY "Allow anon all on notifications" ON public.notifications FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon all on settings" ON public.settings;
CREATE POLICY "Allow anon all on settings" ON public.settings FOR ALL USING (true) WITH CHECK (true);
`;

// Helper: Transform Database Row <-> App Types
export const mapProductFromDb = (row: any): Product => ({
  id: row.id,
  name: row.name,
  sku: row.sku,
  categoryId: row.category_id || row.categoryId || '',
  quantityPairs: Number(row.quantity_pairs ?? row.quantityPairs ?? 0),
  costPerDozen: Number(row.cost_per_dozen ?? row.costPerDozen ?? 0),
  lastPrice: Number(row.last_price ?? row.lastPrice ?? 0),
  createdAt: row.created_at || row.createdAt || new Date().toISOString(),
  imageUrl: row.image_url || row.imageUrl,
  description: row.description,
});

export const mapProductToDb = (p: Product) => ({
  id: p.id,
  name: p.name,
  sku: p.sku,
  category_id: p.categoryId,
  quantity_pairs: p.quantityPairs,
  cost_per_dozen: p.costPerDozen,
  last_price: p.lastPrice,
  created_at: p.createdAt,
  image_url: p.imageUrl || null,
  description: p.description || null,
});

export const mapCategoryFromDb = (row: any): Category => ({
  id: row.id,
  name: row.name,
  description: row.description,
});

export const mapCategoryToDb = (c: Category) => ({
  id: c.id,
  name: c.name,
  description: c.description || null,
});

export const mapUserFromDb = (row: any): User => ({
  id: row.id,
  username: row.username,
  fullName: row.full_name || row.fullName || row.username,
  email: row.email || '',
  role: (row.role as any) || 'seller',
  isActive: row.is_active ?? row.isActive ?? true,
  createdAt: row.created_at || row.createdAt || new Date().toISOString(),
  avatarUrl: row.avatar_url || row.avatarUrl,
  phone: row.phone,
  password: row.password || '1234',
  pin: row.pin || '1234',
});

export const mapUserToDb = (u: User) => ({
  id: u.id,
  username: u.username,
  full_name: u.fullName,
  email: u.email || null,
  role: u.role,
  is_active: u.isActive,
  created_at: u.createdAt,
  avatar_url: u.avatarUrl || null,
  phone: u.phone || null,
  password: u.password || '1234',
  pin: u.pin || '1234',
});

export const mapOrderFromDb = (row: any): Order => ({
  id: row.id,
  receiptNumber: row.receipt_number || row.receiptNumber,
  sellerId: row.seller_id || row.sellerId,
  sellerName: row.seller_name || row.sellerName,
  customerName: row.customer_name || row.customerName,
  customerPhone: row.customer_phone || row.customerPhone || '',
  items: typeof row.items === 'string' ? JSON.parse(row.items) : (row.items || []),
  totalDozens: Number(row.total_dozens ?? row.totalDozens ?? 0),
  totalPairs: Number(row.total_pairs ?? row.totalPairs ?? 0),
  totalCost: Number(row.total_cost ?? row.totalCost ?? 0),
  totalAmount: Number(row.total_amount ?? row.totalAmount ?? 0),
  totalProfit: Number(row.total_profit ?? row.totalProfit ?? 0),
  date: row.date || row.created_at || new Date().toISOString(),
  status: row.status || 'completed',
  notes: row.notes,
});

export const mapOrderToDb = (o: Order) => ({
  id: o.id,
  receipt_number: o.receiptNumber,
  seller_id: o.sellerId,
  seller_name: o.sellerName,
  customer_name: o.customerName,
  customer_phone: o.customerPhone || null,
  items: o.items,
  total_dozens: o.totalDozens,
  total_pairs: o.totalPairs,
  total_cost: o.totalCost,
  total_amount: o.totalAmount,
  total_profit: o.totalProfit,
  date: o.date,
  status: o.status,
  notes: o.notes || null,
});

export const mapPriceLogFromDb = (row: any): PriceChangeLog => ({
  id: row.id,
  productId: row.product_id || row.productId,
  productName: row.product_name || row.productName,
  changedByUserId: row.changed_by_user_id || row.changedByUserId,
  changedByName: row.changed_by_name || row.changedByName,
  oldPrice: Number(row.old_price ?? row.oldPrice ?? 0),
  newPrice: Number(row.new_price ?? row.newPrice ?? 0),
  reason: row.reason,
  timestamp: row.timestamp || row.created_at || new Date().toISOString(),
});

export const mapPriceLogToDb = (l: PriceChangeLog) => ({
  id: l.id,
  product_id: l.productId,
  product_name: l.productName,
  changed_by_user_id: l.changedByUserId,
  changed_by_name: l.changedByName,
  old_price: l.oldPrice,
  new_price: l.newPrice,
  reason: l.reason,
  timestamp: l.timestamp,
});

export const mapCancellationLogFromDb = (row: any): CancellationLog => ({
  id: row.id,
  orderId: row.order_id || row.orderId,
  receiptNumber: row.receipt_number || row.receiptNumber,
  cancelledByUserId: row.cancelled_by_user_id || row.cancelledByUserId,
  cancelledByName: row.cancelled_by_name || row.cancelledByName,
  cancelledByRole: row.cancelled_by_role || row.cancelledByRole || 'seller',
  reason: row.reason,
  timestamp: row.timestamp || row.created_at || new Date().toISOString(),
  itemsRestored: typeof row.items_restored === 'string' ? JSON.parse(row.items_restored) : (row.items_restored || []),
});

export const mapCancellationLogToDb = (c: CancellationLog) => ({
  id: c.id,
  order_id: c.orderId,
  receipt_number: c.receiptNumber,
  cancelled_by_user_id: c.cancelledByUserId,
  cancelled_by_name: c.cancelledByName,
  cancelled_by_role: c.cancelledByRole,
  reason: c.reason,
  timestamp: c.timestamp,
  items_restored: c.itemsRestored,
});

export const mapNotificationFromDb = (row: any): InAppNotification => ({
  id: row.id,
  type: row.type || 'system',
  title: row.title,
  message: row.message,
  timestamp: row.timestamp || row.created_at || new Date().toISOString(),
  read: row.read ?? false,
  linkTab: row.link_tab || row.linkTab,
  metadata: row.metadata,
});

export const mapNotificationToDb = (n: InAppNotification) => ({
  id: n.id,
  type: n.type,
  title: n.title,
  message: n.message,
  timestamp: n.timestamp,
  read: n.read,
  link_tab: n.linkTab || null,
  metadata: n.metadata || null,
});

export const mapSettingsFromDb = (row: any): CompanySettings => ({
  companyName: row.company_name || row.companyName || 'Wholesale Distribution Corp',
  tagline: row.tagline || '',
  address: row.address || '',
  phone: row.phone || '',
  email: row.email || '',
  taxId: row.tax_id || row.taxId,
  currencySymbol: row.currency_symbol || row.currencySymbol || '$',
  currencyCode: row.currency_code || row.currencyCode || 'USD',
  timezone: row.timezone || 'America/New_York',
  lowStockThresholdPairs: Number(row.low_stock_threshold_pairs ?? row.lowStockThresholdPairs ?? 50),
  receiptFooterNote: row.receipt_footer_note || row.receiptFooterNote || '',
  adminPin: row.admin_pin || row.adminPin || '1234',
  sessionTimeoutMinutes: Number(row.session_timeout_minutes ?? row.sessionTimeoutMinutes ?? 30),
});

export const mapSettingsToDb = (s: CompanySettings) => ({
  id: 'default_company_settings',
  company_name: s.companyName,
  tagline: s.tagline || null,
  address: s.address || null,
  phone: s.phone || null,
  email: s.email || null,
  tax_id: s.taxId || null,
  currency_symbol: s.currencySymbol,
  currency_code: s.currencyCode,
  timezone: s.timezone,
  low_stock_threshold_pairs: s.lowStockThresholdPairs,
  receipt_footer_note: s.receiptFooterNote,
  admin_pin: s.adminPin || '1234',
  session_timeout_minutes: s.sessionTimeoutMinutes || 30,
});
