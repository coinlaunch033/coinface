export interface Token {
  id: number;
  tokenName: string;
  tokenAddress: string;
  chain: string;
  logoUrl?: string | null;
  theme: string;
  buttonStyle: string;
  fontStyle: string;
  viewCount: number;
  createdAt: string;
} 