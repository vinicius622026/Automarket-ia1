/**
 * Store Analytics Functions
 * 
 * Provides analytics data for store owners
 */

import { getDb } from "./db";
import { cars, messages, reviews } from "../drizzle/schema";
import { eq, and, gte, sql, desc } from "drizzle-orm";

/**
 * Get analytics overview for a store
 */
export async function getStoreAnalytics(storeId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Total vehicles
  const totalVehicles = await db
    .select({ count: sql<number>`count(*)` })
    .from(cars)
    .where(eq(cars.storeId, storeId));

  // Active vehicles
  const activeVehicles = await db
    .select({ count: sql<number>`count(*)` })
    .from(cars)
    .where(and(eq(cars.storeId, storeId), eq(cars.status, "ACTIVE")));

  // Sold vehicles
  const soldVehicles = await db
    .select({ count: sql<number>`count(*)` })
    .from(cars)
    .where(and(eq(cars.storeId, storeId), eq(cars.status, "SOLD")));

  // Total messages received (messages sent to store's vehicles)
  const storeVehicles = await db
    .select({ id: cars.id })
    .from(cars)
    .where(eq(cars.storeId, storeId));
  
  const vehicleIds = storeVehicles.map(v => v.id);
  
  let totalMessages = 0;
  if (vehicleIds.length > 0) {
    const messagesCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(messages)
      .where(sql`${messages.carId} IN (${sql.join(vehicleIds.map(id => sql`${id}`), sql`, `)})`);
    totalMessages = Number(messagesCount[0]?.count || 0);
  }

  // Average rating
  const avgRating = await db
    .select({ avg: sql<number>`AVG(${reviews.rating})` })
    .from(reviews)
    .where(sql`${reviews.sellerId} IN (SELECT "ownerId" FROM stores WHERE id = ${storeId})`);

  // Total reviews
  const totalReviews = await db
    .select({ count: sql<number>`count(*)` })
    .from(reviews)
    .where(sql`${reviews.sellerId} IN (SELECT "ownerId" FROM stores WHERE id = ${storeId})`);

  return {
    totalVehicles: Number(totalVehicles[0]?.count || 0),
    activeVehicles: Number(activeVehicles[0]?.count || 0),
    soldVehicles: Number(soldVehicles[0]?.count || 0),
    totalMessages,
    averageRating: Number(avgRating[0]?.avg || 0),
    totalReviews: Number(totalReviews[0]?.count || 0),
  };
}

/**
 * Get vehicles created per day for the last 30 days
 */
export async function getVehiclesCreatedTrend(storeId: number, days = 30) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const result = await db
    .select({
      date: sql<string>`DATE(${cars.createdAt})`,
      count: sql<number>`count(*)`,
    })
    .from(cars)
    .where(and(eq(cars.storeId, storeId), gte(cars.createdAt, startDate)))
    .groupBy(sql`DATE(${cars.createdAt})`)
    .orderBy(sql`DATE(${cars.createdAt})`);

  return result.map(r => ({
    date: r.date,
    count: Number(r.count),
  }));
}

/**
 * Get most viewed vehicles (mock - in production, track views in a separate table)
 */
export async function getMostViewedVehicles(storeId: number, limit = 5) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // For now, return most recent vehicles
  // In production, you would have a views table to track actual views
  const result = await db
    .select()
    .from(cars)
    .where(eq(cars.storeId, storeId))
    .orderBy(desc(cars.createdAt))
    .limit(limit);

  return result.map(car => ({
    id: car.id,
    title: `${car.brand} ${car.model} ${car.version}`,
    views: Math.floor(Math.random() * 1000) + 100, // Mock data
    price: car.price,
    status: car.status,
  }));
}

/**
 * Get messages received per day for the last 30 days
 */
export async function getMessagesReceivedTrend(storeId: number, days = 30) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Get all vehicle IDs for this store
  const storeVehicles = await db
    .select({ id: cars.id })
    .from(cars)
    .where(eq(cars.storeId, storeId));
  
  const vehicleIds = storeVehicles.map(v => v.id);
  
  if (vehicleIds.length === 0) {
    return [];
  }

  const result = await db
    .select({
      date: sql<string>`DATE(${messages.createdAt})`,
      count: sql<number>`count(*)`,
    })
    .from(messages)
    .where(
      and(
        sql`${messages.carId} IN (${sql.join(vehicleIds.map(id => sql`${id}`), sql`, `)})`,
        gte(messages.createdAt, startDate)
      )
    )
    .groupBy(sql`DATE(${messages.createdAt})`)
    .orderBy(sql`DATE(${messages.createdAt})`);

  return result.map(r => ({
    date: r.date,
    count: Number(r.count),
  }));
}
