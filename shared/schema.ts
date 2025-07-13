import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const tokens = pgTable("tokens", {
  id: serial("id").primaryKey(),
  tokenName: text("token_name").notNull(),
  tokenAddress: text("token_address").notNull(),
  chain: text("chain").notNull(),
  logoUrl: text("logo_url"),
  theme: text("theme").notNull().default("dark"),
  buttonStyle: text("button_style").notNull().default("rounded"),
  fontStyle: text("font_style").notNull().default("sans"),
  viewCount: integer("view_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertTokenSchema = createInsertSchema(tokens).pick({
  tokenName: true,
  tokenAddress: true,
  chain: true,
  logoUrl: true,
  theme: true,
  buttonStyle: true,
  fontStyle: true,
});

export const updateTokenThemeSchema = createInsertSchema(tokens).pick({
  theme: true,
  buttonStyle: true,
  fontStyle: true,
});

// MemeDrop entries table
export const memeDropEntries = pgTable("meme_drop_entries", {
  id: serial("id").primaryKey(),
  walletAddress: text("wallet_address").notNull(),
  tokenName: text("token_name").notNull(),
  chain: text("chain").notNull(),
  twitter: text("twitter"),
  email: text("email"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMemeDropEntrySchema = createInsertSchema(memeDropEntries).pick({
  walletAddress: true,
  tokenName: true,
  chain: true,
  twitter: true,
  email: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertToken = z.infer<typeof insertTokenSchema>;
export type Token = typeof tokens.$inferSelect;
export type UpdateTokenTheme = z.infer<typeof updateTokenThemeSchema>;
export type InsertMemeDropEntry = z.infer<typeof insertMemeDropEntrySchema>;
export type MemeDropEntry = typeof memeDropEntries.$inferSelect;
