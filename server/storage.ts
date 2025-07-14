import { users, tokens, type User, type InsertUser, type Token, type InsertToken, type UpdateTokenTheme, type InsertMemeDropEntry, type MemeDropEntry } from "@shared/schema";

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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tokens: Map<number, Token>;
  private tokensByNameAndChain: Map<string, Token>; // Changed to support multiple tokens with same name
  private memeDropEntries: Map<number, MemeDropEntry>;
  private currentUserId: number;
  private currentTokenId: number;
  private currentMemeDropId: number;

  constructor() {
    this.users = new Map();
    this.tokens = new Map();
    this.tokensByNameAndChain = new Map();
    this.memeDropEntries = new Map();
    this.currentUserId = 1;
    this.currentTokenId = 1;
    this.currentMemeDropId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createToken(insertToken: InsertToken): Promise<Token> {
    const id = this.currentTokenId++;
    const token: Token = { 
      ...insertToken, 
      id, 
      viewCount: 0, 
      createdAt: new Date(),
      theme: insertToken.theme || 'dark',
      buttonStyle: insertToken.buttonStyle || 'rounded',
      fontStyle: insertToken.fontStyle || 'sans',
      logoUrl: insertToken.logoUrl || null
    };
    this.tokens.set(id, token);
    // Use combination of token name and chain as key to allow duplicates
    const key = `${token.tokenName.toLowerCase()}-${token.chain.toLowerCase()}`;
    this.tokensByNameAndChain.set(key, token);
    return token;
  }

  async getTokenByName(tokenName: string): Promise<Token | undefined> {
    // For backward compatibility, return the first token with this name
    // In a real app, you might want to specify chain as well
    return Array.from(this.tokensByNameAndChain.values()).find(
      token => token.tokenName.toLowerCase() === tokenName.toLowerCase()
    );
  }

  async getAllTokens(): Promise<Token[]> {
    return Array.from(this.tokens.values());
  }

  async updateTokenTheme(tokenName: string, themeUpdate: UpdateTokenTheme): Promise<Token | undefined> {
    const token = await this.getTokenByName(tokenName);
    if (!token) return undefined;

    const updatedToken = { ...token, ...themeUpdate };
    this.tokens.set(token.id, updatedToken);
    // Update the key with the new token data
    const key = `${token.tokenName.toLowerCase()}-${token.chain.toLowerCase()}`;
    this.tokensByNameAndChain.set(key, updatedToken);
    return updatedToken;
  }

  async incrementViewCount(tokenName: string): Promise<Token | undefined> {
    const token = await this.getTokenByName(tokenName);
    if (!token) return undefined;

    const updatedToken = { ...token, viewCount: token.viewCount + 1 };
    this.tokens.set(token.id, updatedToken);
    // Update the key with the new token data
    const key = `${token.tokenName.toLowerCase()}-${token.chain.toLowerCase()}`;
    this.tokensByNameAndChain.set(key, updatedToken);
    return updatedToken;
  }

  async createMemeDropEntry(insertEntry: InsertMemeDropEntry): Promise<MemeDropEntry> {
    const id = this.currentMemeDropId++;
    const entry: MemeDropEntry = {
      id,
      walletAddress: insertEntry.walletAddress,
      tokenName: insertEntry.tokenName,
      chain: insertEntry.chain,
      twitter: insertEntry.twitter || null,
      email: insertEntry.email || null,
      createdAt: new Date(),
    };
    
    this.memeDropEntries.set(id, entry);
    return entry;
  }

  async getMemeDropEntryCount(): Promise<number> {
    return this.memeDropEntries.size;
  }

  async getAllMemeDropEntries(): Promise<MemeDropEntry[]> {
    return Array.from(this.memeDropEntries.values());
  }
}

export const storage = new MemStorage();
