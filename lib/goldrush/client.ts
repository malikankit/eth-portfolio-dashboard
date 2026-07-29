import type { PortfolioResult, TokenHolding } from "./types";

const BASE_URL = "https://api.covalenthq.com/v1";
const CHAIN_NAME = "eth-mainnet";

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
  logo_url: string | null;
  is_native_token: boolean | null;
}

interface RawBalancesResponse {
  address: string;
  items: RawTokenItem[];
}

interface RawHoldingSnapshot {
  timestamp: string;
  quote_rate: number | null;
  close: {
    balance: string | null;
    quote: number | null;
  };
}

interface RawPortfolioItem {
  contract_address: string;
  contract_name: string | null;
  contract_ticker_symbol: string | null;
  contract_decimals: number | null;
  logo_url: string | null;
  is_native_token: boolean | null;
  holdings: RawHoldingSnapshot[];
}

interface RawPortfolioResponse {
  address: string;
  items: RawPortfolioItem[];
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

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${getApiKey()}` },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new GoldRushError(
      `GoldRush API request failed (${res.status})`,
      res.status === 401 ? 500 : 502,
    );
  }

  const envelope: GoldRushEnvelope<T> = await res.json();
  if (envelope.error || !envelope.data) {
    throw new GoldRushError(
      envelope.error_message ?? "GoldRush API returned an error",
      502,
    );
  }
  return envelope.data;
}

function toTokenHolding(
  contractAddress: string,
  name: string | null,
  symbol: string | null,
  decimals: number | null,
  balance: string | null,
  quoteRate: number | null,
  valueUsd: number | null,
  logoUrl: string | null,
  isNativeToken: boolean | null,
): TokenHolding {
  return {
    contractAddress,
    name: name ?? "Unknown Token",
    symbol: symbol ?? "?",
    decimals: decimals ?? 18,
    balance: balance ?? "0",
    quoteRate,
    valueUsd: valueUsd ?? 0,
    logoUrl,
    isNativeToken: isNativeToken ?? false,
  };
}

export async function getCurrentPortfolio(address: string): Promise<PortfolioResult> {
  const data = await callGoldRush<RawBalancesResponse>(
    `/${CHAIN_NAME}/address/${address}/balances_v2/`,
    { "quote-currency": "USD", "no-spam": "true" },
  );

  const tokens = data.items.map((item) =>
    toTokenHolding(
      item.contract_address,
      item.contract_name,
      item.contract_ticker_symbol,
      item.contract_decimals,
      item.balance,
      item.quote_rate,
      item.quote,
      item.logo_url,
      item.is_native_token,
    ),
  );

  return {
    address,
    date: new Date().toISOString().slice(0, 10),
    totalValueUsd: tokens.reduce((sum, t) => sum + t.valueUsd, 0),
    tokens,
  };
}

const MAX_LOOKBACK_DAYS = 365 * 2;

export async function getHistoricalPortfolio(
  address: string,
  date: string,
): Promise<PortfolioResult> {
  const target = new Date(`${date}T00:00:00Z`);
  const today = new Date(new Date().toISOString().slice(0, 10) + "T00:00:00Z");
  const daysBack = Math.round((today.getTime() - target.getTime()) / 86_400_000);

  if (daysBack < 0) {
    throw new GoldRushError("Date cannot be in the future.", 400);
  }
  if (daysBack > MAX_LOOKBACK_DAYS) {
    throw new GoldRushError(
      `Date is too far in the past (max ${MAX_LOOKBACK_DAYS} days of history supported).`,
      400,
    );
  }

  const data = await callGoldRush<RawPortfolioResponse>(
    `/${CHAIN_NAME}/address/${address}/portfolio_v2/`,
    { "quote-currency": "USD", days: String(Math.max(daysBack + 1, 1)) },
  );

  const tokens: TokenHolding[] = [];
  for (const item of data.items) {
    const snapshot = findSnapshotForDate(item.holdings, date);
    if (!snapshot) continue;
    tokens.push(
      toTokenHolding(
        item.contract_address,
        item.contract_name,
        item.contract_ticker_symbol,
        item.contract_decimals,
        snapshot.close.balance,
        snapshot.quote_rate,
        snapshot.close.quote,
        item.logo_url,
        item.is_native_token,
      ),
    );
  }

  return {
    address,
    date,
    totalValueUsd: tokens.reduce((sum, t) => sum + t.valueUsd, 0),
    tokens,
  };
}

function findSnapshotForDate(
  holdings: RawHoldingSnapshot[],
  date: string,
): RawHoldingSnapshot | null {
  // Prefer an exact day match; otherwise fall back to the closest snapshot on or before the date.
  let best: RawHoldingSnapshot | null = null;
  for (const snapshot of holdings) {
    const snapshotDate = snapshot.timestamp.slice(0, 10);
    if (snapshotDate === date) return snapshot;
    if (snapshotDate < date && (!best || snapshotDate > best.timestamp.slice(0, 10))) {
      best = snapshot;
    }
  }
  return best;
}

export async function getPortfolio(address: string, date?: string): Promise<PortfolioResult> {
  const todayStr = new Date().toISOString().slice(0, 10);
  if (!date || date === todayStr) {
    return getCurrentPortfolio(address);
  }
  return getHistoricalPortfolio(address, date);
}
