/**
 * Admin Analytics Functions
 * 
 * Provides analytics data for administrators
 */

import { getDb } from "./db";
import { users, cars } from "../drizzle/schema";
import { gte, sql } from "drizzle-orm";

/**
 * Get new users registered per day for the last N days
 */
export async function getNewUsersPerDay(days = 30) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const result = await db
    .select({
      date: sql<string>`DATE(${users.createdAt})`,
      count: sql<number>`count(*)`,
    })
    .from(users)
    .where(gte(users.createdAt, startDate))
    .groupBy(sql`DATE(${users.createdAt})`)
    .orderBy(sql`DATE(${users.createdAt})`);

  return result.map(r => ({
    date: r.date,
    count: Number(r.count),
  }));
}

/**
 * Get cars created per day for the last N days
 */
export async function getCarsCreatedPerDay(days = 30) {
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
    .where(gte(cars.createdAt, startDate))
    .groupBy(sql`DATE(${cars.createdAt})`)
    .orderBy(sql`DATE(${cars.createdAt})`);

  return result.map(r => ({
    date: r.date,
    count: Number(r.count),
  }));
}

/**
 * Get distribution of cars by brand
 */
export async function getCarsByBrand(limit = 10) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select({
      brand: cars.brand,
      count: sql<number>`count(*)`,
    })
    .from(cars)
    .groupBy(cars.brand)
    .orderBy(sql`count(*) DESC`)
    .limit(limit);

  return result.map(r => ({
    brand: r.brand,
    count: Number(r.count),
  }));
}

/**
 * Get distribution of cars by fuel type
 */
export async function getCarsByFuel() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select({
      fuel: cars.fuel,
      count: sql<number>`count(*)`,
    })
    .from(cars)
    .groupBy(cars.fuel)
    .orderBy(sql`count(*) DESC`);

  return result.map(r => ({
    fuel: r.fuel,
    count: Number(r.count),
  }));
}
