import { z } from "zod";

// User types
export interface User {
  id: number;
  username: string;
  password: string;
  created_at: Date;
}

export interface InsertUser {
  username: string;
  password: string;
}

// Token types
export interface Token {
  id: number;
  token_name: string;
  token_address: string;
  chain: string;
  logo_url: string | null;
  theme: string;
  button_style: string;
  font_style: string;
  view_count: number;
  created_at: Date;
}

export interface InsertToken {
  tokenName: string;
  tokenAddress: string;
  chain: string;
  logoUrl?: string | null;
  theme?: string;
  buttonStyle?: string;
  fontStyle?: string;
}

export interface UpdateTokenTheme {
  theme?: string;
  buttonStyle?: string;
  fontStyle?: string;
}

// MemeDrop types
export interface MemeDropEntry {
  id: number;
  wallet_address: string;
  token_name: string;
  chain: string;
  twitter: string | null;
  email: string | null;
  created_at: Date;
}

export interface InsertMemeDropEntry {
  walletAddress: string;
  tokenName: string;
  chain: string;
  twitter?: string | null;
  email?: string | null;
}

// Zod schemas
export const insertTokenSchema = z.object({
  tokenName: z.string().min(2, "Token name must be at least 2 characters"),
  tokenAddress: z.string().min(8, "Token address must be at least 8 characters"),
  chain: z.string().min(1, "Chain is required"),
  logoUrl: z.string().url().nullable().optional(),
  theme: z.string().default("dark"),
  buttonStyle: z.string().default("rounded"),
  fontStyle: z.string().default("sans"),
});

export const updateTokenThemeSchema = z.object({
  theme: z.string().optional(),
  buttonStyle: z.string().optional(),
  fontStyle: z.string().optional(),
});

export const insertMemeDropEntrySchema = z.object({
  walletAddress: z.string().min(1, "Wallet address is required"),
  tokenName: z.string().min(1, "Token name is required"),
  chain: z.string().min(1, "Chain is required"),
  twitter: z.string().nullable().optional(),
  email: z.string().email().nullable().optional(),
}); 