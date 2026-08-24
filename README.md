# DUBUGAAS

# DUBUGAAS - Wholesale Footwear ERP & Seller Point of Sale (POS)

**DUBUGAAS** is a wholesale footwear inventory and point-of-sale management system built with React, TypeScript, Tailwind CSS, and Supabase (PostgreSQL). It is designed specifically for wholesale shoe distributors, cashiers, and travelling sales representatives.

---

## 🌟 Key Features

1. **Wholesale Dozen & Pairs Dual-Unit Architecture**:
   - Inventory tracking in pairs with automatic conversion to dozens (e.g., 60 pairs = 5.00 dozens).
   - Dynamic selling unit selector: Cashiers can sell by whole dozens or individual pairs.
   - Cost-per-dozen and cost-per-pair margins automatically calculated.

2. **Strict Last Price Floor Protection**:
   - Every wholesale SKU has a minimum selling price floor (`lastPrice`).
   - Sellers cannot complete a sale below the last price without Admin approval code or explicit override.
   - Every price floor change is logged to an immutable audit log table (`price_change_logs`).

3. **Installable Progressive Web App (PWA)**:
   - Installable on Android, iOS, Windows, macOS, and Chrome/Edge with offline shell caching.
   - Cashiers can install the terminal app directly onto their phone, tablet, or desktop with 1-tap from the header or sidebar.
   - Supports standalone full-screen cashier experience.

4. **Multi-Role Security & Clean Login**:
   - **Admin Role**: Full inventory control, price adjustment, staff management, financial analytics, CSV imports, and audit log inspection.
   - **Seller Role**: Cashier POS terminal, receipt printing, daily sales overview, and own sales history.
   - **Direct User Creation**: Admins can register new staff accounts with custom username, email, phone, and password/PIN saved directly to Supabase.
   - Clean production login portal with demo account shortcuts hidden for security.

5. **Live Supabase Real-Time Database**:
   - 8 synchronized PostgreSQL tables (`products`, `orders`, `categories`, `users`, `price_change_logs`, `cancellation_logs`, `notifications`, `settings`).
   - Real-time stock decrement upon sale and instant replenishment upon order cancellation.
   - 24-hour grace period for receipt cancellation with audit logging.

---

## 🚀 Quick Start & Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file or use the provided `.env.example`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Start Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:3000`.

### 4. Build for Production
```bash
npm run build
```

---

## 📱 PWA Installation Instructions

- **Android / Chrome / Edge**: Click the **"Install App"** button in the header or sidebar, or open the browser menu (⋮) and tap **"Install DUBUGAAS"**.
- **iOS Safari**: Tap the **Share** button in Safari's bottom toolbar, scroll down, and select **"Add to Home Screen"**.
- **Desktop (Mac / Windows / Linux)**: Click the install icon in the address bar or the **"Install App"** button in the top navigation.

---

## 🗄️ Database Schema Setup (Supabase)

To set up the database tables in your Supabase SQL editor:

```sql
-- 1. Products Table
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  sku TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  brand TEXT,
  color TEXT,
  sizes TEXT,
  "quantityPairs" INTEGER NOT NULL DEFAULT 0,
  "costPerDozen" NUMERIC(10,2) NOT NULL DEFAULT 0,
  "lastPrice" NUMERIC(10,2) NOT NULL DEFAULT 0,
  "lowStockThreshold" INTEGER DEFAULT 24,
  "imageUrl" TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  "receiptNumber" TEXT UNIQUE NOT NULL,
  "customerName" TEXT NOT NULL,
  "customerPhone" TEXT,
  "sellerId" TEXT NOT NULL,
  "sellerName" TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  "totalAmount" NUMERIC(10,2) NOT NULL DEFAULT 0,
  "totalCost" NUMERIC(10,2) NOT NULL DEFAULT 0,
  "totalProfit" NUMERIC(10,2) NOT NULL DEFAULT 0,
  "paymentMethod" TEXT NOT NULL DEFAULT 'cash',
  status TEXT NOT NULL DEFAULT 'completed',
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT
);

-- 4. Users Table
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  "fullName" TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'seller',
  email TEXT,
  phone TEXT,
  password TEXT,
  pin TEXT,
  "isActive" BOOLEAN DEFAULT TRUE,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Price Change Audit Logs Table
CREATE TABLE IF NOT EXISTS public.price_change_logs (
  id TEXT PRIMARY KEY,
  "productId" TEXT NOT NULL,
  "productName" TEXT NOT NULL,
  "sku" TEXT NOT NULL,
  "oldPrice" NUMERIC(10,2) NOT NULL,
  "newPrice" NUMERIC(10,2) NOT NULL,
  "changedBy" TEXT NOT NULL,
  "changedByRole" TEXT NOT NULL,
  reason TEXT,
  "timestamp" TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Order Cancellation Logs Table
CREATE TABLE IF NOT EXISTS public.cancellation_logs (
  id TEXT PRIMARY KEY,
  "orderId" TEXT NOT NULL,
  "receiptNumber" TEXT NOT NULL,
  "cancelledBy" TEXT NOT NULL,
  "cancelledByRole" TEXT NOT NULL,
  reason TEXT NOT NULL,
  "timestamp" TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  "targetRole" TEXT,
  read BOOLEAN DEFAULT FALSE,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Company Settings Table
CREATE TABLE IF NOT EXISTS public.settings (
  id TEXT PRIMARY KEY,
  "companyName" TEXT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  "currencySymbol" TEXT NOT NULL DEFAULT '$',
  phone TEXT,
  address TEXT,
  "receiptFooter" TEXT,
  "adminPin" TEXT,
  "defaultLowStockThreshold" INTEGER DEFAULT 24,
  timezone TEXT DEFAULT 'Africa/Mogadishu'
);
```

---

## 🛠️ GitHub Push Commands

To push this codebase to your GitHub repository (`https://github.com/Ayoub2046/DUBUGAAS.git`):

```bash
git init
git add .
git commit -m "feat: DUBUGAAS wholesale ERP, seller POS, PWA installability, and Supabase integration"
git branch -M main
git remote add origin https://github.com/Ayoub2046/DUBUGAAS.git
git push -u origin main
```

---

*Built for wholesale footwear distribution and seller operations.*
