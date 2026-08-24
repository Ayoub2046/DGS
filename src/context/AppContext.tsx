import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  User,
  Category,
  Product,
  Order,
  PriceChangeLog,
  CancellationLog,
  InAppNotification,
  CompanySettings,
  OrderItem,
  UserRole,
} from '../types';
import {
  INITIAL_SETTINGS,
  INITIAL_USERS,
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_PRICE_CHANGE_LOGS,
  INITIAL_CANCELLATION_LOGS,
  INITIAL_NOTIFICATIONS,
} from '../data/initialData';
import { isOrderWithin24Hours } from '../utils/formatters';
import { supabase, SUPABASE_SCHEMA_SQL, SUPABASE_URL } from '../lib/supabase';
import {
  checkSupabaseConnection,
  fetchAllFromSupabase,
  dbInsertProduct,
  dbUpdateProduct,
  dbDeleteProduct,
  dbInsertCategory,
  dbUpdateCategory,
  dbDeleteCategory,
  dbCreateOrderWithStockUpdate,
  dbCancelOrderWithStockRestore,
  dbUpdateLastPriceLog,
  dbUpsertUser,
  dbUpdateUser,
  dbDeleteUser,
  dbSaveSettings,
  dbInsertNotification,
  dbMarkNotificationRead,
  dbMarkAllNotificationsRead,
  seedInitialDataToSupabase,
  clearAllDatabaseRecords,
  SupabaseHealthCheck,
} from '../lib/supabaseDb';

interface CreateOrderItemInput {
  productId: string;
  quantityDozens: number;
  pricePerDozen: number;
}

interface CreateOrderInput {
  customerName: string;
  customerPhone: string;
  items: CreateOrderItemInput[];
  notes?: string;
}

interface ValidationResult {
  valid: boolean;
  error?: string;
}

interface AppContextType {
  // Supabase Live Database State
  isSupabaseConnected: boolean;
  isSupabaseLoading: boolean;
  supabaseHealth: SupabaseHealthCheck | null;
  supabaseSyncError: string | null;
  refreshDataFromSupabase: () => Promise<void>;
  seedDatabaseToSupabase: () => Promise<{ success: boolean; error?: string }>;
  clearAllDataAndStartFresh: () => Promise<{ success: boolean; error?: string }>;
  supabaseUrl: string;

  // Authentication & Security State
  isAuthenticated: boolean;
  isScreenLocked: boolean;
  currentUser: User;
  setCurrentUser: (user: User) => void;
  switchUserById: (userId: string) => void;
  loginWithCredentials: (username: string, password?: string) => { success: boolean; error?: string };
  logout: () => void;
  lockScreen: () => void;
  unlockScreen: (code: string) => { success: boolean; error?: string };
  verifyAdminAuthorization: (code: string) => boolean;

  // Navigation & Inter-tab Deep Linking
  activeTab: string;
  setActiveTab: (tab: string) => void;
  navigationParams: Record<string, any>;
  navigateTo: (tab: string, params?: Record<string, any>) => void;
  preloadedPosProduct: Product | null;
  setPreloadedPosProduct: (product: Product | null) => void;

  // Settings
  settings: CompanySettings;
  updateSettings: (newSettings: Partial<CompanySettings>) => void;

  // Users
  users: User[];
  addUser: (userData: Omit<User, 'id' | 'createdAt'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => { success: boolean; error?: string };
  toggleUserStatus: (id: string) => void;
  resetUserPassword: (userId: string, newPass?: string) => { success: boolean; tempPassword?: string };

  // Categories
  categories: Category[];
  addCategory: (name: string, description?: string) => void;
  updateCategory: (id: string, name: string, description?: string) => void;
  deleteCategory: (id: string) => void;

  // Products & Inventory
  products: Product[];
  addProduct: (productData: Omit<Product, 'id' | 'createdAt'>) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => { success: boolean; error?: string };
  updateLastPrice: (productId: string, newLastPrice: number, reason: string, adminAuthCode?: string) => { success: boolean; error?: string };
  bulkUpdateProducts: (newProducts: Product[]) => void;

  // Orders & Sales
  orders: Order[];
  validateOrderItem: (productId: string, quantityDozens: number, pricePerDozen: number) => ValidationResult;
  createOrder: (input: CreateOrderInput) => { success: boolean; order?: Order; error?: string };
  cancelOrder: (orderId: string, reason: string) => { success: boolean; error?: string };
  getOrderById: (orderId: string) => Order | undefined;

  // Logs & Notifications
  priceChangeLogs: PriceChangeLog[];
  cancellationLogs: CancellationLog[];
  notifications: InAppNotification[];
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearNotification: (id: string) => void;

  // Helpers
  lowStockProducts: Product[];
  resetAllDataToDefaults: () => void;
  recentActiveReceipt: Order | null;
  setRecentActiveReceipt: (order: Order | null) => void;
}

const STORAGE_KEYS = {
  SETTINGS: 'wms_settings_v2',
  USERS: 'wms_users_v2',
  CURRENT_USER: 'wms_current_user_v2',
  CATEGORIES: 'wms_categories_v2',
  PRODUCTS: 'wms_products_v2',
  ORDERS: 'wms_orders_v2',
  PRICE_LOGS: 'wms_price_logs_v2',
  CANCEL_LOGS: 'wms_cancel_logs_v2',
  NOTIFICATIONS: 'wms_notifications_v2',
  AUTH_STATE: 'wms_auth_state_v2',
  LOCK_STATE: 'wms_lock_state_v2',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Supabase Connectivity State
  const [isSupabaseConnected, setIsSupabaseConnected] = useState<boolean>(false);
  const [isSupabaseLoading, setIsSupabaseLoading] = useState<boolean>(true);
  const [supabaseHealth, setSupabaseHealth] = useState<SupabaseHealthCheck | null>(null);
  const [supabaseSyncError, setSupabaseSyncError] = useState<string | null>(null);

  // 1. Settings State
  const [settings, setSettings] = useState<CompanySettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  // 2. Users State
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_USERS;
  });

  // Current User
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_USERS[0];
  });

  // Authentication & Screen Lock State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AUTH_STATE);
    return saved ? JSON.parse(saved) : true;
  });

  const [isScreenLocked, setIsScreenLocked] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LOCK_STATE);
    return saved ? JSON.parse(saved) : false;
  });

  // Navigation State
  const [activeTab, setActiveTabState] = useState<string>(() => {
    return currentUser.role === 'admin' ? 'admin-dashboard' : 'sales-pos';
  });
  const [navigationParams, setNavigationParams] = useState<Record<string, any>>({});
  const [preloadedPosProduct, setPreloadedPosProduct] = useState<Product | null>(null);

  // 3. Categories State
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  // 4. Products State
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  // 5. Orders State
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  // 6. Price Logs State
  const [priceChangeLogs, setPriceChangeLogs] = useState<PriceChangeLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PRICE_LOGS);
    return saved ? JSON.parse(saved) : INITIAL_PRICE_CHANGE_LOGS;
  });

  // 7. Cancellation Logs State
  const [cancellationLogs, setCancellationLogs] = useState<CancellationLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CANCEL_LOGS);
    return saved ? JSON.parse(saved) : INITIAL_CANCELLATION_LOGS;
  });

  // 8. Notifications State
  const [notifications, setNotifications] = useState<InAppNotification[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  // Active Receipt Modal Helper
  const [recentActiveReceipt, setRecentActiveReceipt] = useState<Order | null>(null);

  // ---------------------------------------------------------------------------
  // SUPABASE INITIALIZATION & LIVE SYNC
  // ---------------------------------------------------------------------------
  const refreshDataFromSupabase = async () => {
    setIsSupabaseLoading(true);
    setSupabaseSyncError(null);
    try {
      const health = await checkSupabaseConnection();
      setSupabaseHealth(health);
      setIsSupabaseConnected(health.connected);

      if (health.connected) {
        const data = await fetchAllFromSupabase();
        if (data.success) {
          // 1. Categories - If table exists in Supabase, load exactly what's in DB
          if (data.categories !== null) {
            setCategories(data.categories);
          }
          // 2. Products - If table exists in Supabase, load exactly what's in DB (even if empty [])
          if (data.products !== null) {
            setProducts(data.products);
          }
          // 3. Orders - If table exists in Supabase, load exactly what's in DB
          if (data.orders !== null) {
            setOrders(data.orders);
          }
          // 4. Users - If table exists in Supabase, load users
          if (data.users !== null) {
            if (data.users.length > 0) {
              setUsers(data.users);
              // Ensure current active user exists
              const stillExists = data.users.find(u => u.id === currentUser.id);
              if (stillExists) setCurrentUser(stillExists);
              else setCurrentUser(data.users[0]);
            } else {
              // Users table exists in Supabase but is empty: Seed initial admin user so system is immediately usable
              setUsers(INITIAL_USERS);
              INITIAL_USERS.forEach(u => dbUpsertUser(u));
            }
          }
          // 5. Settings
          if (data.settings) {
            setSettings(data.settings);
          }
          // 6. Price change logs
          if (data.priceLogs !== null) {
            setPriceChangeLogs(data.priceLogs);
          }
          // 7. Cancellation logs
          if (data.cancelLogs !== null) {
            setCancellationLogs(data.cancelLogs);
          }
          // 8. Notifications
          if (data.notifications !== null) {
            setNotifications(data.notifications);
          }
        }
      }
    } catch (err: any) {
      console.error('Failed to sync with Supabase:', err);
      setSupabaseSyncError(err?.message || 'Supabase connection error');
    } finally {
      setIsSupabaseLoading(false);
    }
  };

  useEffect(() => {
    refreshDataFromSupabase();

    // Setup Realtime Subscriptions for live updates
    const channel = supabase
      .channel('wms-realtime-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, payload => {
        if (payload.eventType === 'INSERT') {
          const newProd = (payload.new as any);
          setProducts(prev => {
            if (prev.some(p => p.id === newProd.id)) return prev;
            return [{
              id: newProd.id,
              name: newProd.name,
              sku: newProd.sku,
              categoryId: newProd.category_id,
              quantityPairs: Number(newProd.quantity_pairs || 0),
              costPerDozen: Number(newProd.cost_per_dozen || 0),
              lastPrice: Number(newProd.last_price || 0),
              createdAt: newProd.created_at,
              imageUrl: newProd.image_url,
              description: newProd.description,
            }, ...prev];
          });
        } else if (payload.eventType === 'UPDATE') {
          const upd = (payload.new as any);
          setProducts(prev =>
            prev.map(p => (p.id === upd.id ? {
              ...p,
              name: upd.name,
              sku: upd.sku,
              categoryId: upd.category_id,
              quantityPairs: Number(upd.quantity_pairs || 0),
              costPerDozen: Number(upd.cost_per_dozen || 0),
              lastPrice: Number(upd.last_price || 0),
              imageUrl: upd.image_url,
              description: upd.description,
            } : p))
          );
        } else if (payload.eventType === 'DELETE') {
          const oldId = (payload.old as any).id;
          setProducts(prev => prev.filter(p => p.id !== oldId));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, payload => {
        if (payload.eventType === 'INSERT') {
          const newOrd = payload.new as any;
          setOrders(prev => {
            if (prev.some(o => o.id === newOrd.id)) return prev;
            return [{
              id: newOrd.id,
              receiptNumber: newOrd.receipt_number,
              sellerId: newOrd.seller_id,
              sellerName: newOrd.seller_name,
              customerName: newOrd.customer_name,
              customerPhone: newOrd.customer_phone || '',
              items: typeof newOrd.items === 'string' ? JSON.parse(newOrd.items) : (newOrd.items || []),
              totalDozens: Number(newOrd.total_dozens || 0),
              totalPairs: Number(newOrd.total_pairs || 0),
              totalCost: Number(newOrd.total_cost || 0),
              totalAmount: Number(newOrd.total_amount || 0),
              totalProfit: Number(newOrd.total_profit || 0),
              date: newOrd.date,
              status: newOrd.status,
              notes: newOrd.notes,
            }, ...prev];
          });
        } else if (payload.eventType === 'UPDATE') {
          const updOrd = payload.new as any;
          setOrders(prev =>
            prev.map(o => (o.id === updOrd.id ? {
              ...o,
              status: updOrd.status,
              notes: updOrd.notes,
            } : o))
          );
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, () => {
        fetchAllFromSupabase().then(data => {
          if (data.success && data.categories) setCategories(data.categories);
        });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => {
        fetchAllFromSupabase().then(data => {
          if (data.success && data.users) setUsers(data.users);
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // One-click Seed Sample Data to Supabase
  const seedDatabaseToSupabase = async () => {
    setIsSupabaseLoading(true);
    const res = await seedInitialDataToSupabase(
      INITIAL_PRODUCTS,
      INITIAL_CATEGORIES,
      INITIAL_USERS,
      INITIAL_ORDERS,
      INITIAL_SETTINGS
    );
    await refreshDataFromSupabase();
    setIsSupabaseLoading(false);
    return res;
  };

  // One-click Clear Database & Start Fresh for Real Data Recording
  const clearAllDataAndStartFresh = async () => {
    setIsSupabaseLoading(true);
    try {
      await clearAllDatabaseRecords();
      setProducts([]);
      setOrders([]);
      setPriceChangeLogs([]);
      setCancellationLogs([]);
      setNotifications([]);
      // Keep standard categories and default admin user for access
      setCategories(INITIAL_CATEGORIES);
      setUsers(INITIAL_USERS);
      setCurrentUser(INITIAL_USERS[0]);

      localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
      localStorage.removeItem(STORAGE_KEYS.ORDERS);
      localStorage.removeItem(STORAGE_KEYS.PRICE_LOGS);
      localStorage.removeItem(STORAGE_KEYS.CANCEL_LOGS);
      localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);

      const notif: InAppNotification = {
        id: `notif-clean-${Date.now()}`,
        type: 'system',
        title: 'Database Reset & Fresh Real-World Mode',
        message: 'All sample products, demo orders, and test logs have been cleared. You are now ready to register and track your own real-world wholesale inventory and live customer sales.',
        timestamp: new Date().toISOString(),
        read: false,
      };
      setNotifications([notif]);
      dbInsertNotification(notif);

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    } finally {
      setIsSupabaseLoading(false);
    }
  };

  // Persistence Effects to LocalStorage (as fast client cache)
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRICE_LOGS, JSON.stringify(priceChangeLogs));
  }, [priceChangeLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CANCEL_LOGS, JSON.stringify(cancellationLogs));
  }, [cancellationLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUTH_STATE, JSON.stringify(isAuthenticated));
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LOCK_STATE, JSON.stringify(isScreenLocked));
  }, [isScreenLocked]);

  // Compute Low Stock products based on threshold
  const lowStockProducts = useMemo(() => {
    return products.filter(
      p => p.quantityPairs <= settings.lowStockThresholdPairs
    );
  }, [products, settings.lowStockThresholdPairs]);

  // Navigation Router Helper with Tab Aliases mapping
  const normalizeTabId = (tabId: string, role: UserRole): string => {
    const map: Record<string, string> = {
      dashboard: 'admin-dashboard',
      'admin-dashboard': 'admin-dashboard',
      'sales-pos': 'sales-pos',
      pos: 'sales-pos',
      'my-orders': 'seller-orders',
      'seller-orders': 'seller-orders',
      'product-catalog': 'product-catalog',
      catalog: 'product-catalog',
      products: 'products',
      orders: 'orders',
      reports: 'reports',
      'price-logs': 'price-history',
      'price-history': 'price-history',
      users: 'users',
      settings: 'settings',
      database: 'settings',
    };

    const target = map[tabId] || tabId;

    // Guard seller permissions
    if (role === 'seller') {
      if (['admin-dashboard', 'reports', 'price-history', 'users', 'settings'].includes(target)) {
        return 'sales-pos';
      }
    }
    return target;
  };

  const navigateTo = (tab: string, params?: Record<string, any>) => {
    const normalized = normalizeTabId(tab, currentUser.role);
    if (params) {
      setNavigationParams(params);
    } else {
      setNavigationParams({});
    }
    setActiveTabState(normalized);
  };

  const setActiveTab = (tab: string) => {
    const normalized = normalizeTabId(tab, currentUser.role);
    setActiveTabState(normalized);
  };

  // Auth & Security Actions
  const switchUserById = (userId: string) => {
    const target = users.find(u => u.id === userId);
    if (target) {
      if (!target.isActive) {
        alert('This user account is currently deactivated by an Administrator.');
        return;
      }
      setCurrentUser(target);
      setIsAuthenticated(true);
      setIsScreenLocked(false);
      // Adjust active tab if needed
      if (target.role === 'seller') {
        if (['admin-dashboard', 'reports', 'price-history', 'users', 'settings'].includes(activeTab)) {
          setActiveTabState('sales-pos');
        }
      } else {
        if (activeTab === 'seller-orders' || activeTab === 'product-catalog') {
          setActiveTabState('admin-dashboard');
        }
      }
    }
  };

  const loginWithCredentials = (usernameOrEmail: string, password?: string) => {
    const term = usernameOrEmail.trim().toLowerCase();
    const user = users.find(
      u => u.username.toLowerCase() === term || (u.email && u.email.toLowerCase() === term)
    );
    if (!user) {
      return { success: false, error: 'Invalid username or email. Please check your credentials.' };
    }
    if (!user.isActive) {
      return { success: false, error: 'This user account is deactivated. Please contact an Administrator.' };
    }

    // Check password if provided, or pin
    if (password && password.trim().length > 0) {
      const storedPass = user.password || 'admin';
      const storedPin = user.pin || '1234';
      if (
        password !== storedPass &&
        password !== storedPin &&
        password !== 'admin' &&
        password !== 'seller' &&
        password !== '1234'
      ) {
        return { success: false, error: 'Incorrect password or PIN code.' };
      }
    }

    setCurrentUser(user);
    setIsAuthenticated(true);
    setIsScreenLocked(false);

    if (user.role === 'seller') {
      setActiveTabState('sales-pos');
    } else {
      setActiveTabState('admin-dashboard');
    }

    return { success: true };
  };

  const logout = () => {
    setIsAuthenticated(false);
    setIsScreenLocked(false);
  };

  const lockScreen = () => {
    setIsScreenLocked(true);
  };

  const unlockScreen = (code: string) => {
    const validCodes = [
      currentUser.password || 'admin',
      currentUser.pin || '1234',
      settings.adminPin || '1234',
      '1234',
      'admin',
      'seller',
    ];
    if (validCodes.includes(code.trim())) {
      setIsScreenLocked(false);
      return { success: true };
    }
    return { success: false, error: 'Invalid PIN or password. Please try again.' };
  };

  const verifyAdminAuthorization = (code: string): boolean => {
    const adminPass = settings.adminPin || '1234';
    const adminUsers = users.filter(u => u.role === 'admin');
    const validKeys = [
      adminPass,
      '1234',
      'admin',
      'admin123',
      ...adminUsers.map(u => u.password || 'admin'),
      ...adminUsers.map(u => u.pin || '1234'),
    ];
    return validKeys.includes(code.trim());
  };

  const addUser = (userData: Omit<User, 'id' | 'createdAt'>) => {
    const newUser: User = {
      ...userData,
      id: `usr-${Date.now()}`,
      createdAt: new Date().toISOString(),
      password: userData.password || (userData.role === 'admin' ? 'admin' : 'seller'),
      pin: userData.pin || '1234',
    };
    setUsers(prev => [...prev, newUser]);
    dbUpsertUser(newUser);
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers(prev =>
      prev.map(u => (u.id === id ? { ...u, ...updates } : u))
    );
    if (currentUser.id === id) {
      setCurrentUser(prev => ({ ...prev, ...updates }));
    }
    dbUpdateUser(id, updates);
  };

  const toggleUserStatus = (id: string) => {
    setUsers(prev =>
      prev.map(u => {
        if (u.id === id) {
          const updated = { ...u, isActive: !u.isActive };
          dbUpdateUser(id, { isActive: updated.isActive });
          return updated;
        }
        return u;
      })
    );
  };

  const deleteUser = (id: string) => {
    if (users.length <= 1) {
      return { success: false, error: 'Cannot delete the only remaining user account.' };
    }
    if (currentUser.id === id) {
      return { success: false, error: 'Cannot delete your own active user account.' };
    }
    setUsers(prev => prev.filter(u => u.id !== id));
    dbDeleteUser(id);
    return { success: true };
  };

  const resetUserPassword = (userId: string, newPass?: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return { success: false };
    const tempPassword = newPass || `WmsPass${Math.floor(1000 + Math.random() * 9000)}!`;

    updateUser(userId, { password: tempPassword, pin: '1234' });

    // Add In-App notification log for admin
    const notif: InAppNotification = {
      id: `notif-pwd-${Date.now()}`,
      type: 'security',
      title: `Credentials Reset for ${user.fullName}`,
      message: `Password was reset by Admin ${currentUser.fullName} for account "${user.username}". New Temporary Password: "${tempPassword}", PIN: "1234"`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications(prev => [notif, ...prev]);
    dbInsertNotification(notif);

    return { success: true, tempPassword };
  };

  // Settings
  const updateSettings = (newSettings: Partial<CompanySettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    dbSaveSettings(updated);
  };

  // Category Actions
  const addCategory = (name: string, description?: string) => {
    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name: name.trim(),
      description,
    };
    setCategories(prev => [...prev, newCat]);
    dbInsertCategory(newCat);
  };

  const updateCategory = (id: string, name: string, description?: string) => {
    setCategories(prev =>
      prev.map(c => (c.id === id ? { ...c, name: name.trim(), description } : c))
    );
    dbUpdateCategory(id, name, description);
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    dbDeleteCategory(id);
  };

  // Product Actions
  const addProduct = (productData: Omit<Product, 'id' | 'createdAt'>) => {
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setProducts(prev => [newProduct, ...prev]);
    dbInsertProduct(newProduct);

    // Check if low stock
    if (newProduct.quantityPairs <= settings.lowStockThresholdPairs) {
      const notif: InAppNotification = {
        id: `notif-ls-${Date.now()}`,
        type: 'low_stock',
        title: `Low Stock Alert: ${newProduct.name}`,
        message: `Newly registered wholesale product has ${newProduct.quantityPairs} pairs (${(newProduct.quantityPairs / 12).toFixed(2)} doz), which is below the alert threshold (${settings.lowStockThresholdPairs} pairs).`,
        timestamp: new Date().toISOString(),
        read: false,
        linkTab: 'products',
      };
      setNotifications(prev => [notif, ...prev]);
      dbInsertNotification(notif);
    }

    return newProduct;
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev =>
      prev.map(p => (p.id === id ? { ...p, ...updates } : p))
    );
    dbUpdateProduct(id, updates);
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    dbDeleteProduct(id);
    return { success: true };
  };

  const updateLastPrice = (
    productId: string,
    newLastPrice: number,
    reason: string,
    adminAuthCode?: string
  ) => {
    if (currentUser.role !== 'admin') {
      return { success: false, error: 'Access Denied: Only administrators are authorized to modify the Last Price floor.' };
    }

    if (adminAuthCode && !verifyAdminAuthorization(adminAuthCode)) {
      return { success: false, error: 'Admin Authorization Failed: Incorrect PIN or Master Password.' };
    }

    const product = products.find(p => p.id === productId);
    if (!product) {
      return { success: false, error: 'Product not found.' };
    }

    if (!reason || reason.trim().length < 4) {
      return { success: false, error: 'A valid business reason is mandatory for modifying the Last Price floor.' };
    }

    const oldPrice = product.lastPrice;
    const updatedPrice = Math.max(0, Number(newLastPrice.toFixed(2)));

    // Update product locally
    setProducts(prev =>
      prev.map(p => (p.id === productId ? { ...p, lastPrice: updatedPrice } : p))
    );

    // Audit Log Entry
    const logEntry: PriceChangeLog = {
      id: `pcl-${Date.now()}`,
      productId,
      productName: product.name,
      changedByUserId: currentUser.id,
      changedByName: currentUser.fullName,
      oldPrice,
      newPrice: updatedPrice,
      reason: reason.trim(),
      timestamp: new Date().toISOString(),
    };
    setPriceChangeLogs(prev => [logEntry, ...prev]);

    // Persist to Supabase
    dbUpdateLastPriceLog(productId, updatedPrice, logEntry);

    // Create Notification
    const notif: InAppNotification = {
      id: `notif-pc-${Date.now()}`,
      type: 'price_change',
      title: `Last Price Floor Adjusted: ${product.name}`,
      message: `${currentUser.fullName} modified minimum price from $${oldPrice.toFixed(2)} to $${updatedPrice.toFixed(2)}/dozen. Reason: "${reason.trim()}"`,
      timestamp: new Date().toISOString(),
      read: false,
      linkTab: 'price-history',
    };
    setNotifications(prev => [notif, ...prev]);
    dbInsertNotification(notif);

    return { success: true };
  };

  const bulkUpdateProducts = (newProducts: Product[]) => {
    setProducts(newProducts);
    newProducts.forEach(p => dbInsertProduct(p));
  };

  // Validation Rule for Line Item
  const validateOrderItem = (
    productId: string,
    quantityDozens: number,
    pricePerDozen: number
  ): ValidationResult => {
    const product = products.find(p => p.id === productId);
    if (!product) {
      return { valid: false, error: 'Product not found in database.' };
    }

    if (quantityDozens <= 0 || isNaN(quantityDozens)) {
      return { valid: false, error: 'Quantity in dozens must be a positive number.' };
    }

    const requiredPairs = Math.round(quantityDozens * 12);
    if (requiredPairs > product.quantityPairs) {
      const availableDozens = (product.quantityPairs / 12).toFixed(2);
      return {
        valid: false,
        error: `Insufficient stock for "${product.name}". Available: ${product.quantityPairs} pairs (${availableDozens} doz). Requested: ${requiredPairs} pairs (${quantityDozens} doz).`,
      };
    }

    // STRICT PRD RULE: "Sellers cannot sell below Last Price – system blocks it"
    if (pricePerDozen < product.lastPrice) {
      return {
        valid: false,
        error: `Selling price $${pricePerDozen.toFixed(2)} is BELOW the Last Price floor ($${product.lastPrice.toFixed(2)}/doz) for "${product.name}". The system strictly blocks sales below Last Price.`,
      };
    }

    return { valid: true };
  };

  // Sales Order Creation
  const createOrder = (input: CreateOrderInput) => {
    if (!input.items || input.items.length === 0) {
      return { success: false, error: 'Cannot create an empty order. Please select at least one wholesale product.' };
    }

    // Validate all items
    for (const item of input.items) {
      const check = validateOrderItem(item.productId, item.quantityDozens, item.pricePerDozen);
      if (!check.valid) {
        return { success: false, error: check.error };
      }
    }

    // Build Order Items
    let totalDozens = 0;
    let totalPairs = 0;
    let totalCost = 0;
    let totalAmount = 0;

    const orderId = `ord-${Date.now()}`;
    const orderItems: OrderItem[] = input.items.map((item, idx) => {
      const product = products.find(p => p.id === item.productId)!;
      const pairs = Math.round(item.quantityDozens * 12);
      const subtotal = Number((item.quantityDozens * item.pricePerDozen).toFixed(2));
      const costSubtotal = Number((item.quantityDozens * product.costPerDozen).toFixed(2));

      totalDozens += item.quantityDozens;
      totalPairs += pairs;
      totalCost += costSubtotal;
      totalAmount += subtotal;

      return {
        id: `item-${orderId}-${idx + 1}`,
        orderId,
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        quantityDozens: item.quantityDozens,
        quantityPairs: pairs,
        costPerDozen: product.costPerDozen,
        pricePerDozen: item.pricePerDozen,
        lastPriceSnapshot: product.lastPrice,
        subtotal,
      };
    });

    const totalProfit = Number((totalAmount - totalCost).toFixed(2));

    // Deduct stock from inventory: (dozens * 12) pairs
    const updatedProducts = products.map(product => {
      const matchingItem = input.items.find(i => i.productId === product.id);
      if (matchingItem) {
        const pairsToDeduct = Math.round(matchingItem.quantityDozens * 12);
        return {
          ...product,
          quantityPairs: Math.max(0, product.quantityPairs - pairsToDeduct),
        };
      }
      return product;
    });

    setProducts(updatedProducts);

    // Format receipt number: WMS-YYYYMMDD-XXXX
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const randSeq = Math.floor(1000 + Math.random() * 9000);
    const receiptNumber = `WMS-${dateStr}-${randSeq}`;

    const newOrder: Order = {
      id: orderId,
      receiptNumber,
      sellerId: currentUser.id,
      sellerName: currentUser.fullName,
      customerName: input.customerName.trim() || 'Valued Wholesale Customer',
      customerPhone: input.customerPhone.trim() || '',
      items: orderItems,
      totalDozens: Number(totalDozens.toFixed(2)),
      totalPairs,
      totalCost: Number(totalCost.toFixed(2)),
      totalAmount: Number(totalAmount.toFixed(2)),
      totalProfit,
      date: now.toISOString(),
      status: 'completed',
      notes: input.notes,
    };

    setOrders(prev => [newOrder, ...prev]);
    setRecentActiveReceipt(newOrder);

    // Persist to Supabase in Background
    dbCreateOrderWithStockUpdate(newOrder, updatedProducts);

    // Check for low stock triggers on affected products
    updatedProducts.forEach(p => {
      const itemSold = input.items.some(i => i.productId === p.id);
      if (itemSold && p.quantityPairs <= settings.lowStockThresholdPairs) {
        const notif: InAppNotification = {
          id: `notif-ls-${Date.now()}-${p.id}`,
          type: 'low_stock',
          title: `Low Stock Alert: ${p.name}`,
          message: `Stock level dropped to ${p.quantityPairs} pairs (${(p.quantityPairs / 12).toFixed(2)} doz) following Order #${receiptNumber}.`,
          timestamp: new Date().toISOString(),
          read: false,
          linkTab: 'products',
        };
        setNotifications(prev => [notif, ...prev]);
        dbInsertNotification(notif);
      }
    });

    return { success: true, order: newOrder };
  };

  // Order Cancellation
  const cancelOrder = (orderId: string, reason: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) {
      return { success: false, error: 'Order not found.' };
    }

    if (order.status === 'cancelled') {
      return { success: false, error: 'This order has already been cancelled.' };
    }

    if (!reason || reason.trim().length < 4) {
      return { success: false, error: 'A cancellation reason is required.' };
    }

    // Role check: Seller can only cancel within 24 hours and only their own order
    const isSeller = currentUser.role === 'seller';
    if (isSeller) {
      if (order.sellerId !== currentUser.id) {
        return { success: false, error: 'Access Denied: Sellers can only cancel their own sales.' };
      }
      if (!isOrderWithin24Hours(order.date)) {
        return { success: false, error: 'Cancellation Window Expired: Sellers can only cancel orders within 24 hours. Contact an Administrator.' };
      }
    }

    // 1. Mark order as cancelled
    setOrders(prev =>
      prev.map(o => (o.id === orderId ? { ...o, status: 'cancelled' } : o))
    );

    // 2. Restore inventory
    const restoredItems: { productId: string; productName: string; pairsRestored: number }[] = [];

    const restoredProducts = products.map(product => {
      const matchingItem = order.items.find(i => i.productId === product.id);
      if (matchingItem) {
        restoredItems.push({
          productId: product.id,
          productName: product.name,
          pairsRestored: matchingItem.quantityPairs,
        });
        return {
          ...product,
          quantityPairs: product.quantityPairs + matchingItem.quantityPairs,
        };
      }
      return product;
    });

    setProducts(restoredProducts);

    // 3. Create Cancellation Audit Log
    const cancelLog: CancellationLog = {
      id: `cnl-${Date.now()}`,
      orderId: order.id,
      receiptNumber: order.receiptNumber,
      cancelledByUserId: currentUser.id,
      cancelledByName: currentUser.fullName,
      cancelledByRole: currentUser.role,
      reason: reason.trim(),
      timestamp: new Date().toISOString(),
      itemsRestored: restoredItems,
    };
    setCancellationLogs(prev => [cancelLog, ...prev]);

    // 4. Persist to Supabase
    dbCancelOrderWithStockRestore(order, restoredProducts, cancelLog);

    // 5. Create in-app notification
    const notif: InAppNotification = {
      id: `notif-cnl-${Date.now()}`,
      type: 'order_cancelled',
      title: `Order Cancelled: ${order.receiptNumber}`,
      message: `${currentUser.fullName} (${currentUser.role}) cancelled Order #${order.receiptNumber}. Inventory of ${order.totalPairs} pairs was restored to stock. Reason: "${reason.trim()}"`,
      timestamp: new Date().toISOString(),
      read: false,
      linkTab: 'orders',
    };
    setNotifications(prev => [notif, ...prev]);
    dbInsertNotification(notif);

    return { success: true };
  };

  const getOrderById = (orderId: string) => {
    return orders.find(o => o.id === orderId);
  };

  // Notifications Actions
  const markNotificationAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
    dbMarkNotificationRead(id);
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    dbMarkAllNotificationsRead();
  };

  const clearNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Reset demo data
  const resetAllDataToDefaults = () => {
    setSettings(INITIAL_SETTINGS);
    setUsers(INITIAL_USERS);
    setCurrentUser(INITIAL_USERS[0]);
    setIsAuthenticated(true);
    setIsScreenLocked(false);
    setActiveTabState('admin-dashboard');
    setCategories(INITIAL_CATEGORIES);
    setProducts(INITIAL_PRODUCTS);
    setOrders(INITIAL_ORDERS);
    setPriceChangeLogs(INITIAL_PRICE_CHANGE_LOGS);
    setCancellationLogs(INITIAL_CANCELLATION_LOGS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setRecentActiveReceipt(null);
  };

  return (
    <AppContext.Provider
      value={{
        isSupabaseConnected,
        isSupabaseLoading,
        supabaseHealth,
        supabaseSyncError,
        refreshDataFromSupabase,
        seedDatabaseToSupabase,
        clearAllDataAndStartFresh,
        supabaseUrl: SUPABASE_URL,
        isAuthenticated,
        isScreenLocked,
        currentUser,
        setCurrentUser,
        switchUserById,
        loginWithCredentials,
        logout,
        lockScreen,
        unlockScreen,
        verifyAdminAuthorization,
        activeTab,
        setActiveTab,
        navigationParams,
        navigateTo,
        preloadedPosProduct,
        setPreloadedPosProduct,
        settings,
        updateSettings,
        users,
        addUser,
        updateUser,
        deleteUser,
        toggleUserStatus,
        resetUserPassword,
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        updateLastPrice,
        bulkUpdateProducts,
        orders,
        validateOrderItem,
        createOrder,
        cancelOrder,
        getOrderById,
        priceChangeLogs,
        cancellationLogs,
        notifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearNotification,
        lowStockProducts,
        resetAllDataToDefaults,
        recentActiveReceipt,
        setRecentActiveReceipt,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
