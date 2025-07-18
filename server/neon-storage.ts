import { neon } from '@neondatabase/serverless';
import { type User, type InsertUser, type Token, type InsertToken, type UpdateTokenTheme, type InsertMemeDropEntry, type MemeDropEntry } from "./types";

if (!process.env.DATABASE_URL) {
  throw new Error('Missing DATABASE_URL environment variable');
}

const sql = neon(process.env.DATABASE_URL);

// Test database connection
console.log('[STORAGE] Testing database connection...');
sql`SELECT 1 as test`
  .then(() => console.log('[STORAGE] Database connection successful'))
  .catch((error) => console.error('[STORAGE] Database connection failed:', error));

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createToken(token: InsertToken): Promise<Token>;
  getTokenByName(tokenName: string): Promise<Token | undefined>;
  getAllTokens(): Promise<Token[]>;
  updateTokenTheme(tokenName: string, theme: UpdateTokenTheme): Promise<Token | undefined>;
  incrementViewCount(tokenName: string): Promise<Token | undefined>;
  
  createMemeDropEntry(entry: InsertMemeDropEntry): Promise<MemeDropEntry>;
  getMemeDropEntryCount(): Promise<number>;
  getAllMemeDropEntries(): Promise<MemeDropEntry[]>;
}

export class NeonStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const result = await sql`
      SELECT * FROM users WHERE id = ${id}
    `;
    return result[0] as User | undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await sql`
      SELECT * FROM users WHERE username = ${username}
    `;
    return result[0] as User | undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await sql`
      INSERT INTO users (username, password)
      VALUES (${insertUser.username}, ${insertUser.password})
      RETURNING *
    `;
    return result[0] as User;
  }

  async createToken(insertToken: InsertToken): Promise<Token> {
    try {
      console.log("[STORAGE] Attempting to create token:", insertToken.tokenName);
      console.log("[STORAGE] Database connection check...");
      
      const result = await sql`
        INSERT INTO tokens (
          token_name, 
          token_address, 
          chain, 
          logo_url, 
          theme, 
          button_style, 
          font_style, 
          view_count
        )
        VALUES (
          ${insertToken.tokenName},
          ${insertToken.tokenAddress},
          ${insertToken.chain},
          ${insertToken.logoUrl || null},
          ${insertToken.theme || 'dark'},
          ${insertToken.buttonStyle || 'rounded'},
          ${insertToken.fontStyle || 'sans'},
          0
        )
        RETURNING *
      `;
      
      console.log("[STORAGE] Token created successfully:", result[0]?.id);
      return result[0] as Token;
    } catch (error) {
      console.error("[STORAGE] Error creating token:", error);
      console.error("[STORAGE] Error details:", {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        tokenName: insertToken.tokenName,
        hasDatabaseUrl: !!process.env.DATABASE_URL
      });
      throw error;
    }
  }

  async getTokenByName(tokenName: string): Promise<Token | undefined> {
    console.log("[STORAGE] Searching for token:", tokenName);
    const result = await sql`
      SELECT * FROM tokens 
      WHERE token_name ILIKE ${tokenName}
      ORDER BY created_at DESC 
      LIMIT 1
    `;
    console.log("[STORAGE] Query result:", result.length, "rows");
    if (result.length > 0) {
      console.log("[STORAGE] Found token:", result[0].token_name);
    }
    return result[0] as Token | undefined;
  }

  async getAllTokens(): Promise<Token[]> {
    const result = await sql`
      SELECT * FROM tokens 
      ORDER BY created_at DESC
    `;
    return result as Token[];
  }

  async updateTokenTheme(tokenName: string, themeUpdate: UpdateTokenTheme): Promise<Token | undefined> {
    const result = await sql`
      UPDATE tokens 
      SET 
        theme = ${themeUpdate.theme || 'dark'},
        button_style = ${themeUpdate.buttonStyle || 'rounded'},
        font_style = ${themeUpdate.fontStyle || 'sans'}
      WHERE token_name ILIKE ${tokenName}
      RETURNING *
    `;
    return result[0] as Token | undefined;
  }

  async incrementViewCount(tokenName: string): Promise<Token | undefined> {
    const result = await sql`
      UPDATE tokens 
      SET view_count = view_count + 1
      WHERE token_name ILIKE ${tokenName}
      RETURNING *
    `;
    return result[0] as Token | undefined;
  }

  async createMemeDropEntry(insertEntry: InsertMemeDropEntry): Promise<MemeDropEntry> {
    const result = await sql`
      INSERT INTO meme_drop_entries (
        wallet_address, 
        token_name, 
        chain, 
        twitter, 
        email
      )
      VALUES (
        ${insertEntry.walletAddress},
        ${insertEntry.tokenName},
        ${insertEntry.chain},
        ${insertEntry.twitter || null},
        ${insertEntry.email || null}
      )
      RETURNING *
    `;
    return result[0] as MemeDropEntry;
  }

  async getMemeDropEntryCount(): Promise<number> {
    const result = await sql`
      SELECT COUNT(*) as count FROM meme_drop_entries
    `;
    return parseInt(result[0].count as string);
  }

  async getAllMemeDropEntries(): Promise<MemeDropEntry[]> {
    const result = await sql`
      SELECT * FROM meme_drop_entries 
      ORDER BY created_at DESC
    `;
    return result as MemeDropEntry[];
  }
}

// Export the Neon storage instance
export const storage = new NeonStorage(); 