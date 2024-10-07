import {
  integer,
  varchar,
  pgTable,
  serial,
  text,
  timestamp,
  jsonb,
  boolean,
} from "drizzle-orm/pg-core";

export const Users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  timeCreate: timestamp("time_create").defaultNow().notNull(),
});

export const Reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => Users.id)
    .notNull(),
  location: text("location").notNull(),
  wasteType: varchar("waste_type", { length: 255 }).notNull(),
  amount: varchar("amount", { length: 255 }).notNull(),
  imageUrl: text("image_url"),
  verificationResult: jsonb("verification_result"),
  status: varchar("status", { length: 255 }).notNull().default("pending"),
  timeCreate: timestamp("time_create").defaultNow().notNull(),
  collectorId: integer("collector_id").references(() => Users.id),
});

export const Rewards = pgTable("rewards", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => Users.id)
    .notNull(),
  points: integer("points").notNull().default(0),
  level: integer("level").notNull().default(1),
  timeCreate: timestamp("time_create").defaultNow().notNull(),
  timeUpdate: timestamp("time_update").defaultNow().notNull(),
  isAvailable: boolean("is_available").notNull().default(true),
  description: text("description"),
  name: varchar("name", { length: 255 }).notNull(),
  collectionInfo: text("collection_info").notNull(),
});

export const CollectedWastes = pgTable("collected_wasted", {
  id: serial("id").primaryKey(),
  reportId: integer("report_id")
    .references(() => Reports.id)
    .notNull(),
  collectedId: integer("collected_id")
    .references(() => Users.id)
    .notNull(),
  collectionDate: timestamp("collection_date").notNull(),
  status: varchar("status", { length: 255 }).default("collected "),
});

export const Notifications = pgTable("notification", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => Users.id)
    .notNull(),
  message: text("message").notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  isRead: boolean("is_read").notNull().default(false),
  timeCreate: timestamp("time_create").defaultNow().notNull(),
});

export const Transactions = pgTable("transaction", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => Users.id)
    .notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  amount: integer("amount").notNull(),
  description: text("description").notNull(),
  date: timestamp("date").defaultNow().notNull(),
});
