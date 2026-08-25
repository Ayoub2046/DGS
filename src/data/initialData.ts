import { User, Category, Product, Order, PriceChangeLog, InAppNotification, CompanySettings, CancellationLog } from '../types';

export const INITIAL_SETTINGS: CompanySettings = {
  companyName: 'HantiFlow',
  tagline: 'Smart Business. Clear Numbers. (Business & Accounting)',
  address: '450 Commercial Financial Hub, Suite 100',
  phone: '+1 (800) 555-4268',
  email: 'contact@hantiflow.com',
  taxId: 'HF-88492019-TAX',
  currencySymbol: '$',
  currencyCode: 'USD',
  timezone: 'America/New_York',
  lowStockThresholdPairs: 50, // 50 pairs threshold (~4.16 dozens)
  receiptFooterNote: 'Thank you for choosing HantiFlow! Smart Business. Clear Numbers. All claims must be made within 7 business days.',
  adminPin: '1234',
  sessionTimeoutMinutes: 30,
};

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-admin-1',
    username: 'admin',
    fullName: 'Marcus Vance (Admin)',
    email: 'admin@apexwholesale.com',
    role: 'admin',
    isActive: true,
    createdAt: '2023-01-15T08:00:00.000Z',
    phone: '+1 (555) 019-2834',
    password: 'admin',
    pin: '1234',
  },
  {
    id: 'usr-seller-1',
    username: 'sarah_j',
    fullName: 'Sarah Jenkins',
    email: 'sarah@apexwholesale.com',
    role: 'seller',
    isActive: true,
    createdAt: '2023-03-10T09:30:00.000Z',
    phone: '+1 (555) 012-3456',
    password: 'seller',
    pin: '1234',
  },
  {
    id: 'usr-seller-2',
    username: 'michael_c',
    fullName: 'Michael Chen',
    email: 'michael@apexwholesale.com',
    role: 'seller',
    isActive: true,
    createdAt: '2023-04-01T11:00:00.000Z',
    phone: '+1 (555) 014-7890',
    password: 'seller',
    pin: '1234',
  },
  {
    id: 'usr-seller-3',
    username: 'alex_r',
    fullName: 'Alex Rivera',
    email: 'alex@apexwholesale.com',
    role: 'seller',
    isActive: true,
    createdAt: '2023-06-20T14:15:00.000Z',
    phone: '+1 (555) 018-9922',
    password: 'seller',
    pin: '1234',
  },
  {
    id: 'usr-seller-4',
    username: 'lisa_k',
    fullName: 'Lisa Kramer',
    email: 'lisa@apexwholesale.com',
    role: 'seller',
    isActive: false, // Disabled demo user
    createdAt: '2023-08-05T10:00:00.000Z',
    phone: '+1 (555) 011-8844',
    password: 'seller',
    pin: '1234',
  },
];

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Athletic Sneakers', description: 'Performance running and training footwear' },
  { id: 'cat-2', name: 'Formal & Dress Shoes', description: 'Men and women classic leather dress shoes' },
  { id: 'cat-3', name: 'Casual Canvas & Loafers', description: 'Everyday slip-ons, canvas and boat shoes' },
  { id: 'cat-4', name: 'Work & Safety Boots', description: 'Steel-toe and heavy-duty industrial boots' },
  { id: 'cat-5', name: 'Bulk Athletic Socks', description: 'Cushioned crew and ankle athletic socks in bulk dozens' },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'AirSprint Pro Running Sneakers',
    sku: 'ASP-RUN-01',
    categoryId: 'cat-1',
    quantityPairs: 360, // 30.00 Dozens
    costPerDozen: 240.00, // $20/pair
    lastPrice: 310.00,    // Min selling price $25.83/pair ($310/dozen)
    createdAt: '2023-09-01T10:00:00.000Z',
    description: 'High-rebound cushioning athletic shoes, assorted sizes 7-12 per dozen carton.',
  },
  {
    id: 'prod-2',
    name: 'Velocity Prime Knit Trainers',
    sku: 'VEL-KNT-02',
    categoryId: 'cat-1',
    quantityPairs: 288, // 24.00 Dozens
    costPerDozen: 210.00,
    lastPrice: 275.00,
    createdAt: '2023-09-05T11:30:00.000Z',
    description: 'Lightweight breathable flyknit trainers for gym and fitness stores.',
  },
  {
    id: 'prod-3',
    name: 'Royal Oxford Leather Derbys',
    sku: 'ROX-LEA-03',
    categoryId: 'cat-2',
    quantityPairs: 144, // 12.00 Dozens
    costPerDozen: 480.00, // $40/pair
    lastPrice: 620.00,    // $51.67/pair
    createdAt: '2023-09-10T14:00:00.000Z',
    description: 'Hand-burnished genuine leather formal dress shoes in rich mahogany and black.',
  },
  {
    id: 'prod-4',
    name: 'Monarch Classic Wingtip Brogues',
    sku: 'MON-BRG-04',
    categoryId: 'cat-2',
    quantityPairs: 36, // 3.00 Dozens - Low stock alert (<50 pairs)
    costPerDozen: 520.00,
    lastPrice: 680.00,
    createdAt: '2023-09-12T09:00:00.000Z',
    description: 'Traditional perforated dress shoes with durable rubber-injected leather soles.',
  },
  {
    id: 'prod-5',
    name: 'Harbor Classic Canvas Low-Tops',
    sku: 'HRB-CNV-05',
    categoryId: 'cat-3',
    quantityPairs: 540, // 45.00 Dozens
    costPerDozen: 120.00, // $10/pair
    lastPrice: 165.00,
    createdAt: '2023-09-15T15:20:00.000Z',
    description: 'Vulcanized rubber sole casual canvas sneakers in assorted neutral color packs.',
  },
  {
    id: 'prod-6',
    name: 'Coastal Penny Slip-On Loafers',
    sku: 'CST-PNY-06',
    categoryId: 'cat-3',
    quantityPairs: 192, // 16.00 Dozens
    costPerDozen: 260.00,
    lastPrice: 340.00,
    createdAt: '2023-09-18T12:00:00.000Z',
    description: 'Suede finish moccasin stitch loafers with memory foam insoles.',
  },
  {
    id: 'prod-7',
    name: 'IronTitan Steel-Toe Safety Boots',
    sku: 'ITN-STL-07',
    categoryId: 'cat-4',
    quantityPairs: 120, // 10.00 Dozens
    costPerDozen: 600.00, // $50/pair
    lastPrice: 790.00,
    createdAt: '2023-09-20T10:45:00.000Z',
    description: 'OSHA compliant ASTM F2413 puncture resistant steel safety work boots.',
  },
  {
    id: 'prod-8',
    name: 'TimberGuard Waterproof Trekker',
    sku: 'TBG-WTR-08',
    categoryId: 'cat-4',
    quantityPairs: 24, // 2.00 Dozens - Low stock alert (<50 pairs)
    costPerDozen: 450.00,
    lastPrice: 590.00,
    createdAt: '2023-09-22T08:30:00.000Z',
    description: 'Nubuck leather insulated outdoor waterproof utility work boots.',
  },
  {
    id: 'prod-9',
    name: 'Heavy-Duty Ultra Cushion Crew Socks',
    sku: 'SCK-CRW-09',
    categoryId: 'cat-5',
    quantityPairs: 1200, // 100.00 Dozens
    costPerDozen: 24.00, // $2/pair
    lastPrice: 36.00,
    createdAt: '2023-09-25T13:00:00.000Z',
    description: 'Reinforced heel and toe moisture-wicking athletic crew socks pack.',
  },
  {
    id: 'prod-10',
    name: 'Performance Low-Cut Ankle Socks',
    sku: 'SCK-ANK-10',
    categoryId: 'cat-5',
    quantityPairs: 0, // OUT OF STOCK (Shows in catalog with Out of Stock badge)
    costPerDozen: 18.00,
    lastPrice: 28.00,
    createdAt: '2023-09-28T16:00:00.000Z',
    description: 'Arch support seamless toe athletic low cut socks (currently awaiting container arrival).',
  },
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-1001',
    receiptNumber: 'WMS-20231024-001',
    sellerId: 'usr-seller-1',
    sellerName: 'Sarah Jenkins',
    customerName: 'Metro Boutique & Retailers',
    customerPhone: '+1 (555) 782-9011',
    date: new Date(Date.now() - 36 * 3600 * 1000).toISOString(), // ~36 hours ago (cancellation expired for seller)
    status: 'completed',
    items: [
      {
        id: 'item-1',
        orderId: 'ord-1001',
        productId: 'prod-1',
        productName: 'AirSprint Pro Running Sneakers',
        sku: 'ASP-RUN-01',
        quantityDozens: 5,
        quantityPairs: 60,
        costPerDozen: 240.00,
        pricePerDozen: 330.00,
        lastPriceSnapshot: 310.00,
        subtotal: 1650.00,
      },
      {
        id: 'item-2',
        orderId: 'ord-1001',
        productId: 'prod-5',
        productName: 'Harbor Classic Canvas Low-Tops',
        sku: 'HRB-CNV-05',
        quantityDozens: 10,
        quantityPairs: 120,
        costPerDozen: 120.00,
        pricePerDozen: 180.00,
        lastPriceSnapshot: 165.00,
        subtotal: 1800.00,
      },
    ],
    totalDozens: 15,
    totalPairs: 180,
    totalCost: 2400.00,
    totalAmount: 3450.00,
    totalProfit: 1050.00,
    notes: 'Paid via Wholesale Bank Wire. Net 15 terms.',
  },
  {
    id: 'ord-1002',
    receiptNumber: 'WMS-20231025-002',
    sellerId: 'usr-seller-2',
    sellerName: 'Michael Chen',
    customerName: 'Downtown Department Outlets',
    customerPhone: '+1 (555) 431-2900',
    date: new Date(Date.now() - 12 * 3600 * 1000).toISOString(), // 12 hours ago (within 24h)
    status: 'completed',
    items: [
      {
        id: 'item-3',
        orderId: 'ord-1002',
        productId: 'prod-3',
        productName: 'Royal Oxford Leather Derbys',
        sku: 'ROX-LEA-03',
        quantityDozens: 3.5, // 42 pairs
        quantityPairs: 42,
        costPerDozen: 480.00,
        pricePerDozen: 650.00,
        lastPriceSnapshot: 620.00,
        subtotal: 2275.00,
      },
    ],
    totalDozens: 3.5,
    totalPairs: 42,
    totalCost: 1680.00,
    totalAmount: 2275.00,
    totalProfit: 595.00,
    notes: 'Pickup at loading dock B.',
  },
  {
    id: 'ord-1003',
    receiptNumber: 'WMS-20231025-003',
    sellerId: 'usr-seller-1',
    sellerName: 'Sarah Jenkins',
    customerName: 'Highland Sports Emporium',
    customerPhone: '+1 (555) 902-8812',
    date: new Date(Date.now() - 4 * 3600 * 1000).toISOString(), // 4 hours ago
    status: 'completed',
    items: [
      {
        id: 'item-4',
        orderId: 'ord-1003',
        productId: 'prod-2',
        productName: 'Velocity Prime Knit Trainers',
        sku: 'VEL-KNT-02',
        quantityDozens: 4,
        quantityPairs: 48,
        costPerDozen: 210.00,
        pricePerDozen: 290.00,
        lastPriceSnapshot: 275.00,
        subtotal: 1160.00,
      },
      {
        id: 'item-5',
        orderId: 'ord-1003',
        productId: 'prod-9',
        productName: 'Heavy-Duty Ultra Cushion Crew Socks',
        sku: 'SCK-CRW-09',
        quantityDozens: 20,
        quantityPairs: 240,
        costPerDozen: 24.00,
        pricePerDozen: 38.00,
        lastPriceSnapshot: 36.00,
        subtotal: 760.00,
      },
    ],
    totalDozens: 24,
    totalPairs: 288,
    totalCost: 1320.00,
    totalAmount: 1920.00,
    totalProfit: 600.00,
    notes: 'Bulk combo offer negotiated above Last Price.',
  },
];

export const INITIAL_PRICE_CHANGE_LOGS: PriceChangeLog[] = [
  {
    id: 'pcl-1',
    productId: 'prod-1',
    productName: 'AirSprint Pro Running Sneakers',
    changedByUserId: 'usr-admin-1',
    changedByName: 'Marcus Vance (Admin)',
    oldPrice: 325.00,
    newPrice: 310.00,
    reason: 'Vendor container shipment volume discount adjusted our baseline landed cost.',
    timestamp: '2023-10-15T10:30:00.000Z',
  },
  {
    id: 'pcl-2',
    productId: 'prod-5',
    productName: 'Harbor Classic Canvas Low-Tops',
    changedByUserId: 'usr-admin-1',
    changedByName: 'Marcus Vance (Admin)',
    oldPrice: 175.00,
    newPrice: 165.00,
    reason: 'End-of-season inventory clearance clearance target floor lowered.',
    timestamp: '2023-10-20T14:10:00.000Z',
  },
];

export const INITIAL_CANCELLATION_LOGS: CancellationLog[] = [];

export const INITIAL_NOTIFICATIONS: InAppNotification[] = [
  {
    id: 'notif-1',
    type: 'low_stock',
    title: 'Low Stock Alert: Monarch Brogues',
    message: 'Monarch Classic Wingtip Brogues has dropped to 36 pairs (3.00 dozens), below the 50-pair threshold.',
    timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    read: false,
    linkTab: 'products',
  },
  {
    id: 'notif-2',
    type: 'low_stock',
    title: 'Low Stock Alert: TimberGuard Trekker',
    message: 'TimberGuard Waterproof Trekker has only 24 pairs (2.00 dozens) remaining.',
    timestamp: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    read: false,
    linkTab: 'products',
  },
  {
    id: 'notif-3',
    type: 'price_change',
    title: 'Floor Price Adjusted: Harbor Canvas',
    message: 'Admin Marcus Vance lowered Last Price of Harbor Classic Canvas from $175.00 to $165.00/dozen.',
    timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    read: true,
    linkTab: 'price-logs',
  },
];
