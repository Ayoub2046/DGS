import {
  supabase,
  mapProductFromDb,
  mapProductToDb,
  mapCategoryFromDb,
  mapCategoryToDb,
  mapOrderFromDb,
  mapOrderToDb,
  mapUserFromDb,
  mapUserToDb,
  mapPriceLogFromDb,
  mapPriceLogToDb,
  mapCancellationLogFromDb,
  mapCancellationLogToDb,
  mapNotificationFromDb,
  mapNotificationToDb,
  mapSettingsFromDb,
  mapSettingsToDb,
} from './supabase';
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

export interface SupabaseHealthCheck {
  connected: boolean;
  tableStatus: {
    products: boolean;
    categories: boolean;
    orders: boolean;
    users: boolean;
    settings: boolean;
    price_change_logs: boolean;
    cancellation_logs: boolean;
    notifications: boolean;
  };
  rowCounts: {
    products: number;
    categories: number;
    orders: number;
    users: number;
  };
  error?: string;
}

// Track unavailable tables in session to prevent repeated failed network calls
const unavailableTables = new Set<string>();

export function isMissingTableError(error: any): boolean {
  if (!error) return false;
  const msg = (error.message || '').toLowerCase();
  const code = error.code || '';
  return (
    code === 'PGRST205' ||
    code === '42P01' ||
    msg.includes('could not find the table') ||
    msg.includes('schema cache') ||
    msg.includes('relation') && msg.includes('does not exist')
  );
}

// Check connection and verify tables in Supabase
export async function checkSupabaseConnection(): Promise<SupabaseHealthCheck> {
  const result: SupabaseHealthCheck = {
    connected: false,
    tableStatus: {
      products: false,
      categories: false,
      orders: false,
      users: false,
      settings: false,
      price_change_logs: false,
      cancellation_logs: false,
      notifications: false,
    },
    rowCounts: {
      products: 0,
      categories: 0,
      orders: 0,
      users: 0,
    },
  };

  try {
    // 1. Check products
    const { data: prodData, error: prodErr } = await supabase.from('products').select('id', { count: 'exact' }).limit(1);
    if (!prodErr) {
      result.tableStatus.products = true;
      result.connected = true;
      result.rowCounts.products = prodData?.length || 0;
      unavailableTables.delete('products');
    } else if (isMissingTableError(prodErr)) {
      unavailableTables.add('products');
    }

    // 2. Check categories
    const { data: catData, error: catErr } = await supabase.from('categories').select('id', { count: 'exact' }).limit(1);
    if (!catErr) {
      result.tableStatus.categories = true;
      result.connected = true;
      result.rowCounts.categories = catData?.length || 0;
      unavailableTables.delete('categories');
    } else if (isMissingTableError(catErr)) {
      unavailableTables.add('categories');
    }

    // 3. Check orders
    const { data: ordData, error: ordErr } = await supabase.from('orders').select('id', { count: 'exact' }).limit(1);
    if (!ordErr) {
      result.tableStatus.orders = true;
      result.connected = true;
      result.rowCounts.orders = ordData?.length || 0;
      unavailableTables.delete('orders');
    } else if (isMissingTableError(ordErr)) {
      unavailableTables.add('orders');
    }

    // 4. Check users
    const { data: usrData, error: usrErr } = await supabase.from('users').select('id', { count: 'exact' }).limit(1);
    if (!usrErr) {
      result.tableStatus.users = true;
      result.connected = true;
      result.rowCounts.users = usrData?.length || 0;
      unavailableTables.delete('users');
    } else if (isMissingTableError(usrErr)) {
      unavailableTables.add('users');
    }

    // 5. Check other tables
    const { error: setErr } = await supabase.from('settings').select('id').limit(1);
    if (!setErr) {
      result.tableStatus.settings = true;
      unavailableTables.delete('settings');
    } else if (isMissingTableError(setErr)) {
      unavailableTables.add('settings');
    }

    const { error: pclErr } = await supabase.from('price_change_logs').select('id').limit(1);
    if (!pclErr) {
      result.tableStatus.price_change_logs = true;
      unavailableTables.delete('price_change_logs');
    } else if (isMissingTableError(pclErr)) {
      unavailableTables.add('price_change_logs');
    }

    const { error: cnlErr } = await supabase.from('cancellation_logs').select('id').limit(1);
    if (!cnlErr) {
      result.tableStatus.cancellation_logs = true;
      unavailableTables.delete('cancellation_logs');
    } else if (isMissingTableError(cnlErr)) {
      unavailableTables.add('cancellation_logs');
    }

    const { error: notifErr } = await supabase.from('notifications').select('id').limit(1);
    if (!notifErr) {
      result.tableStatus.notifications = true;
      unavailableTables.delete('notifications');
    } else if (isMissingTableError(notifErr)) {
      unavailableTables.add('notifications');
    }

    return result;
  } catch (err: any) {
    return {
      ...result,
      connected: false,
      error: err?.message || 'Failed to connect to Supabase database',
    };
  }
}

// ---------------------------------------------------------------------------
// FETCH ALL DATA FROM SUPABASE
// ---------------------------------------------------------------------------
export async function fetchAllFromSupabase() {
  try {
    const [
      productsRes,
      categoriesRes,
      ordersRes,
      usersRes,
      settingsRes,
      priceLogsRes,
      cancelLogsRes,
      notifsRes,
    ] = await Promise.allSettled([
      supabase.from('products').select('*').order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('name', { ascending: true }),
      supabase.from('orders').select('*').order('date', { ascending: false }),
      supabase.from('users').select('*').order('created_at', { ascending: true }),
      supabase.from('settings').select('*').limit(1).maybeSingle(),
      supabase.from('price_change_logs').select('*').order('timestamp', { ascending: false }),
      supabase.from('cancellation_logs').select('*').order('timestamp', { ascending: false }),
      supabase.from('notifications').select('*').order('timestamp', { ascending: false }),
    ]);

    const products = productsRes.status === 'fulfilled' && productsRes.value.data
      ? productsRes.value.data.map(mapProductFromDb)
      : null;

    const categories = categoriesRes.status === 'fulfilled' && categoriesRes.value.data
      ? categoriesRes.value.data.map(mapCategoryFromDb)
      : null;

    const orders = ordersRes.status === 'fulfilled' && ordersRes.value.data
      ? ordersRes.value.data.map(mapOrderFromDb)
      : null;

    const users = usersRes.status === 'fulfilled' && usersRes.value.data
      ? usersRes.value.data.map(mapUserFromDb)
      : null;

    const settings = settingsRes.status === 'fulfilled' && settingsRes.value.data
      ? mapSettingsFromDb(settingsRes.value.data)
      : null;

    const priceLogs = priceLogsRes.status === 'fulfilled' && priceLogsRes.value.data
      ? priceLogsRes.value.data.map(mapPriceLogFromDb)
      : null;

    const cancelLogs = cancelLogsRes.status === 'fulfilled' && cancelLogsRes.value.data
      ? cancelLogsRes.value.data.map(mapCancellationLogFromDb)
      : null;

    const notifications = notifsRes.status === 'fulfilled' && notifsRes.value.data
      ? notifsRes.value.data.map(mapNotificationFromDb)
      : null;

    return {
      success: true,
      products,
      categories,
      orders,
      users,
      settings,
      priceLogs,
      cancelLogs,
      notifications,
    };
  } catch (error: any) {
    return { success: false, error: error?.message };
  }
}

// ---------------------------------------------------------------------------
// WRITE OPERATIONS (PERSIST DIRECTLY TO SUPABASE WITH SAFE FALLBACK)
// ---------------------------------------------------------------------------

// 1. Products
export async function dbInsertProduct(product: Product) {
  if (unavailableTables.has('products')) return { success: false, tableMissing: true };
  try {
    const dbPayload = mapProductToDb(product);
    const { error } = await supabase.from('products').upsert(dbPayload);
    if (error) {
      if (isMissingTableError(error)) {
        unavailableTables.add('products');
        return { success: false, tableMissing: true };
      }
      throw error;
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

export async function dbUpdateProduct(id: string, updates: Partial<Product>) {
  if (unavailableTables.has('products')) return { success: false, tableMissing: true };
  try {
    const payload: any = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.sku !== undefined) payload.sku = updates.sku;
    if (updates.categoryId !== undefined) payload.category_id = updates.categoryId;
    if (updates.quantityPairs !== undefined) payload.quantity_pairs = updates.quantityPairs;
    if (updates.costPerDozen !== undefined) payload.cost_per_dozen = updates.costPerDozen;
    if (updates.lastPrice !== undefined) payload.last_price = updates.lastPrice;
    if (updates.imageUrl !== undefined) payload.image_url = updates.imageUrl;
    if (updates.description !== undefined) payload.description = updates.description;

    const { error } = await supabase.from('products').update(payload).eq('id', id);
    if (error) {
      if (isMissingTableError(error)) {
        unavailableTables.add('products');
        return { success: false, tableMissing: true };
      }
      throw error;
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

export async function dbDeleteProduct(id: string) {
  if (unavailableTables.has('products')) return { success: false, tableMissing: true };
  try {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      if (isMissingTableError(error)) {
        unavailableTables.add('products');
        return { success: false, tableMissing: true };
      }
      throw error;
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

// 2. Categories
export async function dbInsertCategory(category: Category) {
  if (unavailableTables.has('categories')) return { success: false, tableMissing: true };
  try {
    const { error } = await supabase.from('categories').upsert(mapCategoryToDb(category));
    if (error) {
      if (isMissingTableError(error)) {
        unavailableTables.add('categories');
        return { success: false, tableMissing: true };
      }
      throw error;
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

export async function dbUpdateCategory(id: string, name: string, description?: string) {
  if (unavailableTables.has('categories')) return { success: false, tableMissing: true };
  try {
    const { error } = await supabase
      .from('categories')
      .update({ name, description: description || null })
      .eq('id', id);
    if (error) {
      if (isMissingTableError(error)) {
        unavailableTables.add('categories');
        return { success: false, tableMissing: true };
      }
      throw error;
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

export async function dbDeleteCategory(id: string) {
  if (unavailableTables.has('categories')) return { success: false, tableMissing: true };
  try {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) {
      if (isMissingTableError(error)) {
        unavailableTables.add('categories');
        return { success: false, tableMissing: true };
      }
      throw error;
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

// 3. Orders & Inventory Sync
export async function dbCreateOrderWithStockUpdate(order: Order, updatedProducts: Product[]) {
  if (unavailableTables.has('orders')) return { success: false, tableMissing: true };
  try {
    // 1. Insert order
    const { error: orderErr } = await supabase.from('orders').upsert(mapOrderToDb(order));
    if (orderErr) {
      if (isMissingTableError(orderErr)) {
        unavailableTables.add('orders');
        return { success: false, tableMissing: true };
      }
      throw orderErr;
    }

    // 2. Update stock for ordered products
    if (!unavailableTables.has('products')) {
      for (const item of order.items) {
        const product = updatedProducts.find(p => p.id === item.productId);
        if (product) {
          await supabase
            .from('products')
            .update({ quantity_pairs: product.quantityPairs })
            .eq('id', product.id);
        }
      }
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

export async function dbCancelOrderWithStockRestore(
  order: Order,
  restoredProducts: Product[],
  cancellationLog: CancellationLog
) {
  if (unavailableTables.has('orders')) return { success: false, tableMissing: true };
  try {
    // 1. Mark order as cancelled
    const { error: orderErr } = await supabase
      .from('orders')
      .update({ status: 'cancelled' })
      .eq('id', order.id);
    if (orderErr) {
      if (isMissingTableError(orderErr)) {
        unavailableTables.add('orders');
        return { success: false, tableMissing: true };
      }
      throw orderErr;
    }

    // 2. Restore stock in database
    if (!unavailableTables.has('products')) {
      for (const item of cancellationLog.itemsRestored) {
        const product = restoredProducts.find(p => p.id === item.productId);
        if (product) {
          await supabase
            .from('products')
            .update({ quantity_pairs: product.quantityPairs })
            .eq('id', product.id);
        }
      }
    }

    // 3. Insert cancellation log
    if (!unavailableTables.has('cancellation_logs')) {
      const { error: logErr } = await supabase
        .from('cancellation_logs')
        .upsert(mapCancellationLogToDb(cancellationLog));
      if (logErr && isMissingTableError(logErr)) {
        unavailableTables.add('cancellation_logs');
      }
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

// 4. Price Floor Update & Audit Log
export async function dbUpdateLastPriceLog(
  productId: string,
  newLastPrice: number,
  priceLog: PriceChangeLog
) {
  try {
    if (!unavailableTables.has('products')) {
      // Update product last_price
      const { error: prodErr } = await supabase
        .from('products')
        .update({ last_price: newLastPrice })
        .eq('id', productId);
      if (prodErr && isMissingTableError(prodErr)) {
        unavailableTables.add('products');
      }
    }

    if (!unavailableTables.has('price_change_logs')) {
      // Insert log
      const { error: logErr } = await supabase
        .from('price_change_logs')
        .upsert(mapPriceLogToDb(priceLog));
      if (logErr && isMissingTableError(logErr)) {
        unavailableTables.add('price_change_logs');
      }
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

// 5. Users
export async function dbUpsertUser(user: User) {
  if (unavailableTables.has('users')) return { success: false, tableMissing: true };
  try {
    const { error } = await supabase.from('users').upsert(mapUserToDb(user));
    if (error) {
      if (isMissingTableError(error)) {
        unavailableTables.add('users');
        return { success: false, tableMissing: true };
      }
      throw error;
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

export async function dbUpdateUser(id: string, updates: Partial<User>) {
  if (unavailableTables.has('users')) return { success: false, tableMissing: true };
  try {
    const payload: any = {};
    if (updates.username !== undefined) payload.username = updates.username;
    if (updates.fullName !== undefined) payload.full_name = updates.fullName;
    if (updates.email !== undefined) payload.email = updates.email;
    if (updates.role !== undefined) payload.role = updates.role;
    if (updates.isActive !== undefined) payload.is_active = updates.isActive;
    if (updates.password !== undefined) payload.password = updates.password;
    if (updates.pin !== undefined) payload.pin = updates.pin;
    if (updates.phone !== undefined) payload.phone = updates.phone;
    if (updates.avatarUrl !== undefined) payload.avatar_url = updates.avatarUrl;

    const { error } = await supabase.from('users').update(payload).eq('id', id);
    if (error) {
      if (isMissingTableError(error)) {
        unavailableTables.add('users');
        return { success: false, tableMissing: true };
      }
      throw error;
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

export async function dbDeleteUser(id: string) {
  if (unavailableTables.has('users')) return { success: false, tableMissing: true };
  try {
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) {
      if (isMissingTableError(error)) {
        unavailableTables.add('users');
        return { success: false, tableMissing: true };
      }
      throw error;
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

// 6. Settings
export async function dbSaveSettings(settings: CompanySettings) {
  if (unavailableTables.has('settings')) return { success: false, tableMissing: true };
  try {
    const { error } = await supabase.from('settings').upsert(mapSettingsToDb(settings));
    if (error) {
      if (isMissingTableError(error)) {
        unavailableTables.add('settings');
        return { success: false, tableMissing: true };
      }
      throw error;
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

// 7. Notifications (Safely ignores if notifications table hasn't been created in Supabase yet)
export async function dbInsertNotification(notif: InAppNotification) {
  if (unavailableTables.has('notifications')) return { success: false, tableMissing: true };
  try {
    const { error } = await supabase.from('notifications').upsert(mapNotificationToDb(notif));
    if (error) {
      if (isMissingTableError(error)) {
        unavailableTables.add('notifications');
        return { success: false, tableMissing: true };
      }
      throw error;
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

export async function dbMarkNotificationRead(id: string) {
  if (unavailableTables.has('notifications')) return { success: false, tableMissing: true };
  try {
    const { error } = await supabase.from('notifications').update({ read: true }).eq('id', id);
    if (error) {
      if (isMissingTableError(error)) {
        unavailableTables.add('notifications');
        return { success: false, tableMissing: true };
      }
      throw error;
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

export async function dbMarkAllNotificationsRead() {
  if (unavailableTables.has('notifications')) return { success: false, tableMissing: true };
  try {
    const { error } = await supabase.from('notifications').update({ read: true }).neq('id', '');
    if (error) {
      if (isMissingTableError(error)) {
        unavailableTables.add('notifications');
        return { success: false, tableMissing: true };
      }
      throw error;
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

// 8. Bulk Seed / Synchronize Initial Applet Data to Supabase
export async function seedInitialDataToSupabase(
  products: Product[],
  categories: Category[],
  users: User[],
  orders: Order[],
  settings: CompanySettings
) {
  try {
    // 1. Categories
    if (categories.length > 0 && !unavailableTables.has('categories')) {
      await supabase.from('categories').upsert(categories.map(mapCategoryToDb));
    }
    // 2. Users
    if (users.length > 0 && !unavailableTables.has('users')) {
      await supabase.from('users').upsert(users.map(mapUserToDb));
    }
    // 3. Products
    if (products.length > 0 && !unavailableTables.has('products')) {
      await supabase.from('products').upsert(products.map(mapProductToDb));
    }
    // 4. Orders
    if (orders.length > 0 && !unavailableTables.has('orders')) {
      await supabase.from('orders').upsert(orders.map(mapOrderToDb));
    }
    // 5. Settings
    if (!unavailableTables.has('settings')) {
      await supabase.from('settings').upsert(mapSettingsToDb(settings));
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

// 9. Clear All Records in Database (Clear Demo Data so user can record their own real-world data)
export async function clearAllDatabaseRecords() {
  try {
    if (!unavailableTables.has('cancellation_logs')) {
      await supabase.from('cancellation_logs').delete().neq('id', '___non_existent___');
    }
    if (!unavailableTables.has('price_change_logs')) {
      await supabase.from('price_change_logs').delete().neq('id', '___non_existent___');
    }
    if (!unavailableTables.has('notifications')) {
      await supabase.from('notifications').delete().neq('id', '___non_existent___');
    }
    if (!unavailableTables.has('orders')) {
      await supabase.from('orders').delete().neq('id', '___non_existent___');
    }
    if (!unavailableTables.has('products')) {
      await supabase.from('products').delete().neq('id', '___non_existent___');
    }
    if (!unavailableTables.has('categories')) {
      await supabase.from('categories').delete().neq('id', '___non_existent___');
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}
