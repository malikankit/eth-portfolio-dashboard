export interface ChainConfig {
  id: string;
  chainId: number;
  label: string;
}

export const CHAINS: ChainConfig[] = [
  { id: "eth-mainnet", chainId: 1, label: "Ethereum" },
  { id: "base-mainnet", chainId: 8453, label: "Base" },
  { id: "arbitrum-mainnet", chainId: 42161, label: "Arbitrum" },
];
