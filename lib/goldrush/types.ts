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
  chainId: number;
  chainLabel: string;
}

export interface ChainBreakdown {
  chainId: number;
  chainLabel: string;
  valueUsd: number;
}

export interface ChainError {
  chainId: number;
  chainLabel: string;
  message: string;
}

export interface PortfolioResult {
  address: string;
  date: string;
  totalValueUsd: number;
  tokens: TokenHolding[];
  chainBreakdown: ChainBreakdown[];
  chainErrors: ChainError[];
}
