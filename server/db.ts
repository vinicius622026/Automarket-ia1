import { eq, and, or, desc, asc, sql, like, gte, lte, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, profiles, InsertProfile, stores, InsertStore, 
  cars, InsertCar, carPhotos, InsertCarPhoto, messages, InsertMessage,
  reviews, InsertReview, transactions, InsertTransaction, bulkImportJobs, InsertBulkImportJob
} from "../drizzle/schema";
import { ENV } from './_core/env';
import { nanoid } from 'nanoid';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============= USER & PROFILE OPERATIONS =============

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createProfile(data: InsertProfile) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(profiles).values(data);
}

export async function getProfileById(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(profiles).where(eq(profiles.id, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateProfile(userId: number, data: Partial<InsertProfile>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(profiles).set(data).where(eq(profiles.id, userId));
}

// ============= STORE OPERATIONS =============

export async function createStore(data: Omit<InsertStore, 'apiKey'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const apiKey = nanoid(32);
  const storeData: InsertStore = { ...data, apiKey };
  
  await db.insert(stores).values(storeData);
  const inserted = await getStoreBySlug(data.slug);
  return inserted!;
}

export async function getStoreById(storeId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(stores).where(eq(stores.id, storeId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getStoreBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(stores).where(eq(stores.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getStoreByApiKey(apiKey: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(stores).where(eq(stores.apiKey, apiKey)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getStoresByOwnerId(ownerId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(stores).where(eq(stores.ownerId, ownerId));
}

export async function updateStore(storeId: number, data: Partial<InsertStore>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(stores).set(data).where(eq(stores.id, storeId));
}

export async function getAllStores(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(stores).limit(limit).offset(offset).orderBy(desc(stores.createdAt));
}

// ============= CAR OPERATIONS =============

export async function createCar(data: InsertCar) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(cars).values(data);
  const inserted = await db.select().from(cars).where(eq(cars.sellerId, data.sellerId)).orderBy(desc(cars.createdAt)).limit(1);
  return inserted[0]!;
}

export async function getCarById(carId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(cars).where(eq(cars.id, carId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateCar(carId: number, data: Partial<InsertCar>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(cars).set(data).where(eq(cars.id, carId));
}

export async function deleteCar(carId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(cars).where(eq(cars.id, carId));
}

export async function getCarsBySellerId(sellerId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(cars).where(eq(cars.sellerId, sellerId)).orderBy(desc(cars.createdAt));
}

export async function getCarsByStoreId(storeId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(cars).where(eq(cars.storeId, storeId)).orderBy(desc(cars.createdAt));
}

export async function getActiveCarsBySellerId(sellerId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(cars).where(
    and(
      eq(cars.sellerId, sellerId),
      eq(cars.status, 'ACTIVE')
    )
  );
}

export interface CarFilters {
  brand?: string;
  model?: string;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  transmission?: string;
  fuel?: string;
  status?: string;
  sellerId?: number;
  storeId?: number;
  search?: string;
}

export async function searchCars(filters: CarFilters, limit = 20, offset = 0) {
  const db = await getDb();
  if (!db) return { data: [], total: 0 };
  
  const conditions = [];
  
  if (filters.brand) {
    conditions.push(eq(cars.brand, filters.brand));
  }
  if (filters.model) {
    conditions.push(eq(cars.model, filters.model));
  }
  if (filters.minPrice) {
    conditions.push(gte(cars.price, filters.minPrice.toString()));
  }
  if (filters.maxPrice) {
    conditions.push(lte(cars.price, filters.maxPrice.toString()));
  }
  if (filters.minYear) {
    conditions.push(gte(cars.yearModel, filters.minYear));
  }
  if (filters.maxYear) {
    conditions.push(lte(cars.yearModel, filters.maxYear));
  }
  if (filters.transmission) {
    conditions.push(eq(cars.transmission, filters.transmission as any));
  }
  if (filters.fuel) {
    conditions.push(eq(cars.fuel, filters.fuel as any));
  }
  if (filters.status) {
    conditions.push(eq(cars.status, filters.status as any));
  }
  if (filters.sellerId) {
    conditions.push(eq(cars.sellerId, filters.sellerId));
  }
  if (filters.storeId) {
    conditions.push(eq(cars.storeId, filters.storeId));
  }
  if (filters.search) {
    conditions.push(
      or(
        like(cars.brand, `%${filters.search}%`),
        like(cars.model, `%${filters.search}%`),
        like(cars.version, `%${filters.search}%`),
        like(cars.description, `%${filters.search}%`)
      )!
    );
  }
  
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  
  const data = await db.select()
    .from(cars)
    .where(whereClause)
    .limit(limit)
    .offset(offset)
    .orderBy(desc(cars.createdAt));
  
  const countResult = await db.select({ count: sql<number>`count(*)` })
    .from(cars)
    .where(whereClause);
  
  const total = countResult[0]?.count || 0;
  
  return { data, total };
}

// ============= CAR PHOTOS OPERATIONS =============

export async function createCarPhoto(data: InsertCarPhoto) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(carPhotos).values(data);
  const inserted = await db.select().from(carPhotos).where(eq(carPhotos.carId, data.carId)).orderBy(desc(carPhotos.id)).limit(1);
  return inserted[0]!;
}

export async function getCarPhotos(carId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select()
    .from(carPhotos)
    .where(eq(carPhotos.carId, carId))
    .orderBy(asc(carPhotos.orderIndex));
}

export async function deleteCarPhoto(photoId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(carPhotos).where(eq(carPhotos.id, photoId));
}

export async function updatePhotoOrder(photoId: number, orderIndex: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(carPhotos).set({ orderIndex }).where(eq(carPhotos.id, photoId));
}

// ============= MESSAGE OPERATIONS =============

export async function createMessage(data: InsertMessage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(messages).values(data);
  const inserted = await db.select().from(messages).where(eq(messages.senderId, data.senderId)).orderBy(desc(messages.createdAt)).limit(1);
  return inserted[0]!;
}

export async function getConversation(carId: number, userId1: number, userId2: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select()
    .from(messages)
    .where(
      and(
        eq(messages.carId, carId),
        or(
          and(eq(messages.senderId, userId1), eq(messages.receiverId, userId2)),
          and(eq(messages.senderId, userId2), eq(messages.receiverId, userId1))
        )
      )
    )
    .orderBy(asc(messages.createdAt));
}

export async function getUserConversations(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select()
    .from(messages)
    .where(
      or(
        eq(messages.senderId, userId),
        eq(messages.receiverId, userId)
      )
    )
    .orderBy(desc(messages.createdAt));
}

export async function markMessagesAsRead(messageIds: number[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(messages)
    .set({ isRead: true })
    .where(inArray(messages.id, messageIds));
}

// ============= REVIEW OPERATIONS =============

export async function createReview(data: InsertReview) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(reviews).values(data);
  const inserted = await db.select().from(reviews).where(eq(reviews.reviewerId, data.reviewerId)).orderBy(desc(reviews.createdAt)).limit(1);
  return inserted[0]!;
}

export async function getSellerReviews(sellerId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select()
    .from(reviews)
    .where(eq(reviews.sellerId, sellerId))
    .orderBy(desc(reviews.createdAt));
}

export async function getSellerAverageRating(sellerId: number) {
  const db = await getDb();
  if (!db) return 0;
  
  const result = await db.select({
    avg: sql<number>`AVG(${reviews.rating})`,
    count: sql<number>`COUNT(*)`
  })
  .from(reviews)
  .where(eq(reviews.sellerId, sellerId));
  
  return {
    average: result[0]?.avg || 0,
    count: result[0]?.count || 0
  };
}

// ============= TRANSACTION OPERATIONS =============

export async function createTransaction(data: InsertTransaction) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(transactions).values(data);
  const inserted = await db.select().from(transactions).where(eq(transactions.buyerId, data.buyerId)).orderBy(desc(transactions.createdAt)).limit(1);
  return inserted[0]!;
}

export async function getTransactionById(transactionId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select()
    .from(transactions)
    .where(eq(transactions.id, transactionId))
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

export async function updateTransaction(transactionId: number, data: Partial<InsertTransaction>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(transactions).set(data).where(eq(transactions.id, transactionId));
}

export async function getUserTransactions(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select()
    .from(transactions)
    .where(
      or(
        eq(transactions.buyerId, userId),
        eq(transactions.sellerId, userId)
      )
    )
    .orderBy(desc(transactions.createdAt));
}

// ============= BULK IMPORT OPERATIONS =============

export async function createBulkImportJob(data: InsertBulkImportJob) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(bulkImportJobs).values(data);
  const inserted = await db.select().from(bulkImportJobs).where(eq(bulkImportJobs.storeId, data.storeId)).orderBy(desc(bulkImportJobs.createdAt)).limit(1);
  return inserted[0]!;
}

export async function getBulkImportJob(jobId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select()
    .from(bulkImportJobs)
    .where(eq(bulkImportJobs.id, jobId))
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

export async function updateBulkImportJob(jobId: number, data: Partial<InsertBulkImportJob>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(bulkImportJobs).set(data).where(eq(bulkImportJobs.id, jobId));
}

// ============= ADMIN OPERATIONS =============

export async function getAdminDashboardStats() {
  const db = await getDb();
  if (!db) return null;
  
  const [totalUsers] = await db.select({ count: sql<number>`count(*)` }).from(users);
  const [totalCars] = await db.select({ count: sql<number>`count(*)` }).from(cars);
  const [activeCars] = await db.select({ count: sql<number>`count(*)` })
    .from(cars)
    .where(eq(cars.status, 'ACTIVE'));
  const [totalStores] = await db.select({ count: sql<number>`count(*)` }).from(stores);
  const [totalTransactions] = await db.select({ count: sql<number>`count(*)` }).from(transactions);
  
  return {
    totalUsers: totalUsers?.count || 0,
    totalCars: totalCars?.count || 0,
    activeCars: activeCars?.count || 0,
    totalStores: totalStores?.count || 0,
    totalTransactions: totalTransactions?.count || 0,
  };
}

export async function getAllCarsForModeration(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select()
    .from(cars)
    .limit(limit)
    .offset(offset)
    .orderBy(desc(cars.createdAt));
}

// ============= ADMIN & MODERATION OPERATIONS =============

export async function getAllUsersForModeration(limit = 50, offset = 0, role?: 'user' | 'store_owner' | 'admin') {
  const db = await getDb();
  if (!db) return { data: [], total: 0 };
  
  let query = db.select().from(users);
  
  if (role) {
    query = query.where(eq(users.role, role)) as any;
  }
  
  const data = await query.limit(limit).offset(offset).orderBy(desc(users.createdAt));
  const [countResult] = await db.select({ count: sql<number>`count(*)` }).from(users);
  
  return {
    data,
    total: countResult?.count || 0,
  };
}

export async function updateUserRole(userId: number, role: 'user' | 'store_owner' | 'admin') {
  const db = await getDb();
  if (!db) return;
  
  await db.update(users).set({ role }).where(eq(users.id, userId));
}

export async function banUserCars(userId: number) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(cars).set({ status: 'BANNED' }).where(eq(cars.sellerId, userId));
}

export async function getAllStoresForModeration(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return { data: [], total: 0 };
  
  const data = await db.select()
    .from(stores)
    .limit(limit)
    .offset(offset)
    .orderBy(desc(stores.createdAt));
  
  const [countResult] = await db.select({ count: sql<number>`count(*)` }).from(stores);
  
  return {
    data,
    total: countResult?.count || 0,
  };
}

export async function createModerationLog(data: {
  adminId: number;
  targetType: string;
  targetId: number;
  action: string;
  reason?: string;
}) {
  const db = await getDb();
  if (!db) return;
  
  // For now, just log to console
  // In production, you would store this in a moderation_logs table
  console.log('[Moderation Log]', {
    timestamp: new Date().toISOString(),
    ...data,
  });
}

export async function getModerationLogs(limit = 100, offset = 0) {
  // For now, return empty array
  // In production, you would query the moderation_logs table
  return {
    data: [],
    total: 0,
  };
}

export async function getAllCarsForModerationWithStatus(limit = 50, offset = 0, status?: 'ACTIVE' | 'DRAFT' | 'SOLD' | 'BANNED') {
  const db = await getDb();
  if (!db) return { data: [], total: 0 };
  
  let query = db.select().from(cars);
  
  if (status) {
    query = query.where(eq(cars.status, status)) as any;
  }
  
  const data = await query.limit(limit).offset(offset).orderBy(desc(cars.createdAt));
  const [countResult] = await db.select({ count: sql<number>`count(*)` }).from(cars);
  
  return {
    data,
    total: countResult?.count || 0,
  };
}


export async function getConversationMessages(userId: number, otherUserId: number, carId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(messages)
    .where(
      and(
        eq(messages.carId, carId),
        or(
          and(eq(messages.senderId, userId), eq(messages.receiverId, otherUserId)),
          and(eq(messages.senderId, otherUserId), eq(messages.receiverId, userId))
        )
      )
    )
    .orderBy(asc(messages.createdAt));
}

export async function getReviews(filters: {
  sellerId?: number;
  storeId?: number;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return { data: [], total: 0, avgRating: 0 };
  
  const conditions = [];
  if (filters.sellerId) {
    conditions.push(eq(reviews.sellerId, filters.sellerId));
  }
  // Note: storeId filter removed as reviews table doesn't have storeId column
  
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  
  const allReviews = await db.select().from(reviews).where(whereClause);
  const total = allReviews.length;
  const avgRating = total > 0
    ? allReviews.reduce((sum, r) => sum + r.rating, 0) / total
    : 0;
  
  const data = allReviews
    .slice(filters.offset || 0, (filters.offset || 0) + (filters.limit || 10));
  
  return { data, total, avgRating };
}

export async function getReviewById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(reviews).where(eq(reviews.id, id)).limit(1);
  return result[0] || null;
}

export async function updateReview(id: number, data: { rating: number; comment?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(reviews).set(data).where(eq(reviews.id, id));
  return { success: true };
}

export async function deleteReview(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(reviews).where(eq(reviews.id, id));
  return { success: true };
}
