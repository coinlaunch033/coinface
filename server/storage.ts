import { users, tokens, type User, type InsertUser, type Token, type InsertToken, type UpdateTokenTheme } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createToken(token: InsertToken): Promise<Token>;
  getTokenByName(tokenName: string): Promise<Token | undefined>;
  getAllTokens(): Promise<Token[]>;
  updateTokenTheme(tokenName: string, theme: UpdateTokenTheme): Promise<Token | undefined>;
  incrementViewCount(tokenName: string): Promise<Token | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tokens: Map<number, Token>;
  private tokensByName: Map<string, Token>;
  private currentUserId: number;
  private currentTokenId: number;

  constructor() {
    this.users = new Map();
    this.tokens = new Map();
    this.tokensByName = new Map();
    this.currentUserId = 1;
    this.currentTokenId = 1;
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
    this.tokensByName.set(token.tokenName.toLowerCase(), token);
    return token;
  }

  async getTokenByName(tokenName: string): Promise<Token | undefined> {
    return this.tokensByName.get(tokenName.toLowerCase());
  }

  async getAllTokens(): Promise<Token[]> {
    return Array.from(this.tokens.values());
  }

  async updateTokenTheme(tokenName: string, themeUpdate: UpdateTokenTheme): Promise<Token | undefined> {
    const token = this.tokensByName.get(tokenName.toLowerCase());
    if (!token) return undefined;

    const updatedToken = { ...token, ...themeUpdate };
    this.tokens.set(token.id, updatedToken);
    this.tokensByName.set(tokenName.toLowerCase(), updatedToken);
    return updatedToken;
  }

  async incrementViewCount(tokenName: string): Promise<Token | undefined> {
    const token = this.tokensByName.get(tokenName.toLowerCase());
    if (!token) return undefined;

    const updatedToken = { ...token, viewCount: token.viewCount + 1 };
    this.tokens.set(token.id, updatedToken);
    this.tokensByName.set(tokenName.toLowerCase(), updatedToken);
    return updatedToken;
  }
}

export const storage = new MemStorage();
