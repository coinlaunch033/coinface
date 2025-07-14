import { createClient } from '@supabase/supabase-js';
import { users, tokens, type User, type InsertUser, type Token, type InsertToken, type UpdateTokenTheme, type InsertMemeDropEntry, type MemeDropEntry } from "@shared/schema";

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

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

export class SupabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) return undefined;
    return data as User;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();
    
    if (error || !data) return undefined;
    return data as User;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert(insertUser)
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create user: ${error.message}`);
    return data as User;
  }

  async createToken(insertToken: InsertToken): Promise<Token> {
    const tokenData = {
      ...insertToken,
      viewCount: 0,
      createdAt: new Date().toISOString(),
      theme: insertToken.theme || 'dark',
      buttonStyle: insertToken.buttonStyle || 'rounded',
      fontStyle: insertToken.fontStyle || 'sans',
      logoUrl: insertToken.logoUrl || null
    };

    const { data, error } = await supabase
      .from('tokens')
      .insert(tokenData)
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create token: ${error.message}`);
    return data as Token;
  }

  async getTokenByName(tokenName: string): Promise<Token | undefined> {
    const { data, error } = await supabase
      .from('tokens')
      .select('*')
      .ilike('token_name', tokenName)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error || !data) return undefined;
    return data as Token;
  }

  async getAllTokens(): Promise<Token[]> {
    const { data, error } = await supabase
      .from('tokens')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw new Error(`Failed to get tokens: ${error.message}`);
    return data as Token[];
  }

  async updateTokenTheme(tokenName: string, themeUpdate: UpdateTokenTheme): Promise<Token | undefined> {
    const { data, error } = await supabase
      .from('tokens')
      .update(themeUpdate)
      .ilike('token_name', tokenName)
      .select()
      .single();
    
    if (error || !data) return undefined;
    return data as Token;
  }

  async incrementViewCount(tokenName: string): Promise<Token | undefined> {
    // First get the current token
    const token = await this.getTokenByName(tokenName);
    if (!token) return undefined;

    const { data, error } = await supabase
      .from('tokens')
      .update({ view_count: token.viewCount + 1 })
      .eq('id', token.id)
      .select()
      .single();
    
    if (error || !data) return undefined;
    return data as Token;
  }

  async createMemeDropEntry(insertEntry: InsertMemeDropEntry): Promise<MemeDropEntry> {
    const entryData = {
      ...insertEntry,
      createdAt: new Date().toISOString(),
      twitter: insertEntry.twitter || null,
      email: insertEntry.email || null
    };

    const { data, error } = await supabase
      .from('meme_drops')
      .insert(entryData)
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create meme drop entry: ${error.message}`);
    return data as MemeDropEntry;
  }

  async getMemeDropEntryCount(): Promise<number> {
    const { count, error } = await supabase
      .from('meme_drops')
      .select('*', { count: 'exact', head: true });
    
    if (error) throw new Error(`Failed to get meme drop count: ${error.message}`);
    return count || 0;
  }

  async getAllMemeDropEntries(): Promise<MemeDropEntry[]> {
    const { data, error } = await supabase
      .from('meme_drops')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw new Error(`Failed to get meme drop entries: ${error.message}`);
    return data as MemeDropEntry[];
  }
}

// Export the Supabase storage instance
export const storage = new SupabaseStorage(); 