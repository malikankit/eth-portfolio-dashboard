import { CHAINS, type ChainConfig } from "./chains";
import type { ChainBreakdown, ChainError, PortfolioResult, TokenHolding } from "./types";

const BASE_URL = "https://api.covalenthq.com/v1";

interface GoldRushEnvelope<T> {
  data: T | null;
  error: boolean;
  error_message: string | null;
  error_code: number | null;
}

interface RawTokenItem {
  contract_address: string;
  contract_name: string | null;
  contract_ticker_symbol: string | null;
  contract_decimals: number | null;
  balance: string | null;
  quote: number | null;
  quote_rate: number | null;
  logo_urls: { token_logo_url: string | null } | null;
  is_native_token: boolean | null;
}

interface RawBalancesResponse {
  address: string;
  items: RawTokenItem[];
}

export class GoldRushError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "GoldRushError";
  }
}

function getApiKey(): string {
  const key = process.env.GOLDRUSH_API_KEY;
  if (!key) {
    throw new GoldRushError(
      "GOLDRUSH_API_KEY is not set. Add it to .env.local.",
      500,
    );
  }
  return key;
}

async function callGoldRush<T>(path: string, params: Record<string, string>): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const basicAuth = Buffer.from(`${getApiKey()}:`).toString("base64");
  const res = await fetch(url, {
    headers: { Authorization: `Basic ${basicAuth}` },
    cache: "no-store",
  });

  let envelope: GoldRushEnvelope<T> | null = null;
  try {
    envelope = await res.json();
  } catch {
    envelope = null;
  }

  if (!res.ok || !envelope || envelope.error || !envelope.data) {
    const message = envelope?.error_message ?? `GoldRush API request failed (${res.status})`;
    const status = res.status >= 400 && res.status < 500 ? 400 : 502;
    throw new GoldRushError(message, status);
  }
  return envelope.data;
}

function toTokenHolding(item: RawTokenItem, chain: ChainConfig): TokenHolding {
  return {
    contractAddress: item.contract_address,
    name: item.contract_name ?? "Unknown Token",
    symbol: item.contract_ticker_symbol ?? "?",
    decimals: item.contract_decimals ?? 18,
    balance: item.balance ?? "0",
    quoteRate: item.quote_rate,
    valueUsd: item.quote ?? 0,
    logoUrl: item.logo_urls?.token_logo_url ?? null,
    isNativeToken: item.is_native_token ?? false,
    chainId: chain.chainId,
    chainLabel: chain.label,
  };
}

// `historical_balances` resolves a `date` to the right block internally, but is not
// available on every chain/plan (e.g. Arbitrum currently 501s on it). `balances_v2`
// is the universally-supported "current state" endpoint. Use the date-aware one only
// when a specific date was requested.
async function fetchChainBalances(
  chain: ChainConfig,
  address: string,
  date?: string,
): Promise<TokenHolding[]> {
  const endpoint = date ? "historical_balances" : "balances_v2";
  const params: Record<string, string> = { "quote-currency": "USD", "no-spam": "true" };
  if (date) params.date = date;

  const data = await callGoldRush<RawBalancesResponse>(
    `/${chain.id}/address/${address}/${endpoint}/`,
    params,
  );
  return data.items.map((item) => toTokenHolding(item, chain));
}

export async function getPortfolio(address: string, date?: string): Promise<PortfolioResult> {
  const todayStr = new Date().toISOString().slice(0, 10);
  if (date && date > todayStr) {
    throw new GoldRushError("Date cannot be in the future.", 400);
  }

  const results = await Promise.allSettled(
    CHAINS.map((chain) => fetchChainBalances(chain, address, date)),
  );

  const chainErrors: ChainError[] = [];
  const chainBreakdown: ChainBreakdown[] = [];
  const tokens: TokenHolding[] = [];

  results.forEach((result, i) => {
    const chain = CHAINS[i];
    if (result.status === "fulfilled") {
      tokens.push(...result.value);
      chainBreakdown.push({
        chainId: chain.chainId,
        chainLabel: chain.label,
        valueUsd: result.value.reduce((sum, t) => sum + t.valueUsd, 0),
      });
    } else {
      const message =
        result.reason instanceof Error ? result.reason.message : "Failed to load this chain.";
      chainErrors.push({ chainId: chain.chainId, chainLabel: chain.label, message });
    }
  });

  if (chainBreakdown.length === 0) {
    throw new GoldRushError(
      chainErrors.map((e) => `${e.chainLabel}: ${e.message}`).join("; "),
      502,
    );
  }

  return {
    address,
    date: date ?? todayStr,
    totalValueUsd: tokens.reduce((sum, t) => sum + t.valueUsd, 0),
    tokens,
    chainBreakdown,
    chainErrors,
  };
}
