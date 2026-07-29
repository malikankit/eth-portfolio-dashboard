import type { PortfolioResult } from "@/lib/goldrush/types";
import { formatTokenAmount, formatUsd } from "@/lib/format";

interface PortfolioViewProps {
  portfolio: PortfolioResult;
}

export function PortfolioView({ portfolio }: PortfolioViewProps) {
  const sortedTokens = [...portfolio.tokens].sort((a, b) => b.valueUsd - a.valueUsd);

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
        <div className="text-sm text-neutral-500 dark:text-neutral-400">
          Total value on {portfolio.date}
        </div>
        <div className="text-3xl font-semibold text-neutral-900 dark:text-neutral-100">
          {formatUsd(portfolio.totalValueUsd)}
        </div>
      </div>

      {sortedTokens.length === 0 ? (
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          No token balances found for this address on this date.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50 text-neutral-500 dark:bg-neutral-900 dark:text-neutral-400">
              <tr>
                <th className="px-4 py-2 font-medium">Token</th>
                <th className="px-4 py-2 font-medium">Balance</th>
                <th className="px-4 py-2 font-medium">Price</th>
                <th className="px-4 py-2 text-right font-medium">Value</th>
              </tr>
            </thead>
            <tbody>
              {sortedTokens.map((token) => (
                <tr
                  key={token.contractAddress}
                  className="border-t border-neutral-200 dark:border-neutral-800"
                >
                  <td className="px-4 py-2">
                    <div className="font-medium text-neutral-900 dark:text-neutral-100">
                      {token.symbol}
                    </div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400">
                      {token.name}
                    </div>
                  </td>
                  <td className="px-4 py-2 text-neutral-700 dark:text-neutral-300">
                    {formatTokenAmount(token.balance, token.decimals)}
                  </td>
                  <td className="px-4 py-2 text-neutral-700 dark:text-neutral-300">
                    {token.quoteRate != null ? formatUsd(token.quoteRate) : "—"}
                  </td>
                  <td className="px-4 py-2 text-right font-medium text-neutral-900 dark:text-neutral-100">
                    {formatUsd(token.valueUsd)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
