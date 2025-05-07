import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Player schema
export const players = pgTable("players", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  isActive: boolean("is_active").notNull().default(false),
  discoveries: integer("discoveries").notNull().default(0),
});

export const insertPlayerSchema = createInsertSchema(players).pick({
  name: true,
  isActive: true,
  discoveries: true,
});

// Discovery schema
export const discoveries = pgTable("discoveries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  hint: text("hint").notNull(),
  discovered: boolean("discovered").notNull().default(false),
});

export const insertDiscoverySchema = createInsertSchema(discoveries).pick({
  name: true,
  description: true,
  hint: true,
  discovered: true,
});

// Player-Discovery relationship schema
export const playerDiscoveries = pgTable("player_discoveries", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id").notNull(),
  discoveryId: integer("discovery_id").notNull(),
  discoveredAt: text("discovered_at").notNull(), // ISO date string
});

export const insertPlayerDiscoverySchema = createInsertSchema(playerDiscoveries).pick({
  playerId: true,
  discoveryId: true,
  discoveredAt: true,
});

// Define types for frontend use
export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
export type Player = typeof players.$inferSelect;

export type InsertDiscovery = z.infer<typeof insertDiscoverySchema>;
export type Discovery = typeof discoveries.$inferSelect;

export type InsertPlayerDiscovery = z.infer<typeof insertPlayerDiscoverySchema>;
export type PlayerDiscovery = typeof playerDiscoveries.$inferSelect;

// Users schema (keeping the existing schema)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
