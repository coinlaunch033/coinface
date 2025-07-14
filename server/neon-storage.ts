import { neon } from '@neondatabase/serverless';
import { users, tokens, type User, type InsertUser, type Token, type InsertToken, type UpdateTokenTheme, type InsertMemeDropEntry, type MemeDropEntry } from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error('Missing DATABASE_URL environment variable');
}

const sql = neon(process.env.DATABASE_URL);

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
    return result[0] as Token;
  }

  async getTokenByName(tokenName: string): Promise<Token | undefined> {
    const result = await sql`
      SELECT * FROM tokens 
      WHERE token_name ILIKE ${tokenName}
      ORDER BY created_at DESC 
      LIMIT 1
    `;
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