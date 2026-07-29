export interface TokenHolding {
  contractAddress: string;
  symbol: string;
  name: string;
  decimals: number;
  balance: string;
  quoteRate: number | null;
  valueUsd: number;
  logoUrl: string | null;
  isNativeToken: boolean;
}

export interface PortfolioResult {
  address: string;
  date: string;
  totalValueUsd: number;
  tokens: TokenHolding[];
}
