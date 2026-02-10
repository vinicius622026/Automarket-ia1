import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, json, boolean, index, unique } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 * Extended with AutoMarket AI specific fields following PRD specifications.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "store_owner"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

/**
 * Profiles table - Extension of auth.users with AutoMarket specific fields
 * Following PRD Section 3.1
 */
export const profiles = mysqlTable("profiles", {
  id: int("id").primaryKey(),
  fullName: text("fullName").notNull(),
  avatarUrl: text("avatarUrl"),
  phone: varchar("phone", { length: 20 }),
  location: json("location").$type<{ city?: string; state?: string; zip?: string }>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/**
 * Stores table - For STORE_OWNER users
 * Following PRD Section 3.2
 */
export const stores = mysqlTable("stores", {
  id: int("id").autoincrement().primaryKey(),
  ownerId: int("ownerId").notNull(),
  name: text("name").notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  logoUrl: text("logoUrl"),
  document: varchar("document", { length: 20 }).notNull(),
  apiKey: varchar("apiKey", { length: 64 }).notNull().unique(),
  isVerified: boolean("isVerified").default(false).notNull(),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 320 }),
  location: json("location").$type<{ city?: string; state?: string; zip?: string }>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  ownerIdx: index("owner_idx").on(table.ownerId),
  slugIdx: index("slug_idx").on(table.slug),
}));

/**
 * Cars table - Vehicle listings/ads
 * Following PRD Section 3.3
 */
export const cars = mysqlTable("cars", {
  id: int("id").autoincrement().primaryKey(),
  sellerId: int("sellerId").notNull(),
  storeId: int("storeId"),
  brand: varchar("brand", { length: 100 }).notNull(),
  model: varchar("model", { length: 100 }).notNull(),
  version: varchar("version", { length: 100 }).notNull(),
  yearFab: int("yearFab").notNull(),
  yearModel: int("yearModel").notNull(),
  price: decimal("price", { precision: 12, scale: 2 }).notNull(),
  mileage: int("mileage").notNull(),
  transmission: mysqlEnum("transmission", ["MANUAL", "AUTOMATIC", "CVT"]).notNull(),
  fuel: mysqlEnum("fuel", ["FLEX", "GASOLINE", "DIESEL", "ELECTRIC", "HYBRID"]).notNull(),
  color: varchar("color", { length: 50 }).notNull(),
  description: text("description"),
  features: json("features").$type<string[]>(),
  status: mysqlEnum("status", ["DRAFT", "ACTIVE", "SOLD", "BANNED"]).default("DRAFT").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  sellerIdx: index("seller_idx").on(table.sellerId),
  storeIdx: index("store_idx").on(table.storeId),
  statusIdx: index("status_idx").on(table.status),
  brandModelIdx: index("brand_model_idx").on(table.brand, table.model),
  priceIdx: index("price_idx").on(table.price),
  yearIdx: index("year_idx").on(table.yearModel),
}));

/**
 * Car Photos table - Images for vehicle listings
 * Following PRD Section 3.4
 */
export const carPhotos = mysqlTable("car_photos", {
  id: int("id").autoincrement().primaryKey(),
  carId: int("carId").notNull(),
  urls: json("urls").$type<{ thumb: string; medium: string; large: string }>().notNull(),
  orderIndex: int("orderIndex").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  carIdx: index("car_idx").on(table.carId),
  orderIdx: index("order_idx").on(table.carId, table.orderIndex),
}));

/**
 * Messages table - Real-time messaging between buyers and sellers
 */
export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  carId: int("carId").notNull(),
  senderId: int("senderId").notNull(),
  receiverId: int("receiverId").notNull(),
  content: text("content").notNull(),
  isRead: boolean("isRead").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  carIdx: index("car_idx").on(table.carId),
  senderIdx: index("sender_idx").on(table.senderId),
  receiverIdx: index("receiver_idx").on(table.receiverId),
  conversationIdx: index("conversation_idx").on(table.carId, table.senderId, table.receiverId),
}));

/**
 * Reviews table - Seller ratings and reviews
 */
export const reviews = mysqlTable("reviews", {
  id: int("id").autoincrement().primaryKey(),
  sellerId: int("sellerId").notNull(),
  reviewerId: int("reviewerId").notNull(),
  carId: int("carId"),
  rating: int("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  sellerIdx: index("seller_idx").on(table.sellerId),
  reviewerIdx: index("reviewer_idx").on(table.reviewerId),
  uniqueReview: unique("unique_review").on(table.sellerId, table.reviewerId, table.carId),
}));

/**
 * Transactions table - Track sales and proposals
 */
export const transactions = mysqlTable("transactions", {
  id: int("id").autoincrement().primaryKey(),
  carId: int("carId").notNull(),
  buyerId: int("buyerId").notNull(),
  sellerId: int("sellerId").notNull(),
  proposedPrice: decimal("proposedPrice", { precision: 12, scale: 2 }),
  status: mysqlEnum("status", ["PENDING", "ACCEPTED", "REJECTED", "COMPLETED", "CANCELLED"]).default("PENDING").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  carIdx: index("car_idx").on(table.carId),
  buyerIdx: index("buyer_idx").on(table.buyerId),
  sellerIdx: index("seller_idx").on(table.sellerId),
  statusIdx: index("status_idx").on(table.status),
}));

/**
 * Bulk Import Jobs table - Track bulk import operations for stores
 */
export const bulkImportJobs = mysqlTable("bulk_import_jobs", {
  id: int("id").autoincrement().primaryKey(),
  storeId: int("storeId").notNull(),
  status: mysqlEnum("status", ["PENDING", "PROCESSING", "COMPLETED", "FAILED"]).default("PENDING").notNull(),
  totalRecords: int("totalRecords").notNull(),
  processedRecords: int("processedRecords").default(0).notNull(),
  failedRecords: int("failedRecords").default(0).notNull(),
  errorLog: json("errorLog").$type<Array<{ index: number; error: string }>>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
}, (table) => ({
  storeIdx: index("store_idx").on(table.storeId),
  statusIdx: index("status_idx").on(table.status),
}));

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [users.id],
    references: [profiles.id],
  }),
  stores: many(stores),
  cars: many(cars),
  sentMessages: many(messages, { relationName: "sentMessages" }),
  receivedMessages: many(messages, { relationName: "receivedMessages" }),
  givenReviews: many(reviews, { relationName: "givenReviews" }),
  receivedReviews: many(reviews, { relationName: "receivedReviews" }),
  purchases: many(transactions, { relationName: "purchases" }),
  sales: many(transactions, { relationName: "sales" }),
}));

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, {
    fields: [profiles.id],
    references: [users.id],
  }),
}));

export const storesRelations = relations(stores, ({ one, many }) => ({
  owner: one(users, {
    fields: [stores.ownerId],
    references: [users.id],
  }),
  cars: many(cars),
  bulkImportJobs: many(bulkImportJobs),
}));

export const carsRelations = relations(cars, ({ one, many }) => ({
  seller: one(users, {
    fields: [cars.sellerId],
    references: [users.id],
  }),
  store: one(stores, {
    fields: [cars.storeId],
    references: [stores.id],
  }),
  photos: many(carPhotos),
  messages: many(messages),
  reviews: many(reviews),
  transactions: many(transactions),
}));

export const carPhotosRelations = relations(carPhotos, ({ one }) => ({
  car: one(cars, {
    fields: [carPhotos.carId],
    references: [cars.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  car: one(cars, {
    fields: [messages.carId],
    references: [cars.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
  receiver: one(users, {
    fields: [messages.receiverId],
    references: [users.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  seller: one(users, {
    fields: [reviews.sellerId],
    references: [users.id],
  }),
  reviewer: one(users, {
    fields: [reviews.reviewerId],
    references: [users.id],
  }),
  car: one(cars, {
    fields: [reviews.carId],
    references: [cars.id],
  }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  car: one(cars, {
    fields: [transactions.carId],
    references: [cars.id],
  }),
  buyer: one(users, {
    fields: [transactions.buyerId],
    references: [users.id],
  }),
  seller: one(users, {
    fields: [transactions.sellerId],
    references: [users.id],
  }),
}));

export const bulkImportJobsRelations = relations(bulkImportJobs, ({ one }) => ({
  store: one(stores, {
    fields: [bulkImportJobs.storeId],
    references: [stores.id],
  }),
}));

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = typeof profiles.$inferInsert;
export type Store = typeof stores.$inferSelect;
export type InsertStore = typeof stores.$inferInsert;
export type Car = typeof cars.$inferSelect;
export type InsertCar = typeof cars.$inferInsert;
export type CarPhoto = typeof carPhotos.$inferSelect;
export type InsertCarPhoto = typeof carPhotos.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;
export type BulkImportJob = typeof bulkImportJobs.$inferSelect;
export type InsertBulkImportJob = typeof bulkImportJobs.$inferInsert;
