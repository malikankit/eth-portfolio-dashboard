export function formatUsd(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatTokenAmount(rawBalance: string, decimals: number): string {
  const value = Number(rawBalance) / 10 ** decimals;
  if (!Number.isFinite(value)) return "0";
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: value < 1 ? 6 : 4,
  }).format(value);
}

export function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}
