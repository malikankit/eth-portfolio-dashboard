# ETH Portfolio Dashboard

Enter an EVM address to view its native + ERC-20 token portfolio across Ethereum, Base, and Arbitrum — for today, or for any past date via the date picker.

## Setup

1. Get a [GoldRush (Covalent)](https://goldrush.dev/) API key.
2. Copy the env example and add your key:

   ```bash
   cp .env.local.example .env.local
   ```

   ```
   GOLDRUSH_API_KEY=your-key-here
   ```

3. Install dependencies and run the dev server:

   ```bash
   npm install
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000).

## How it works

- `app/api/portfolio/route.ts` — server route that validates the address/date and calls GoldRush, keeping the API key server-side.
- `lib/goldrush/chains.ts` — the chains queried: Ethereum, Base, Arbitrum (each an EVM chain, same 0x address across all three).
- `lib/goldrush/client.ts` — GoldRush API client. Fans out to all three chains in parallel with `Promise.allSettled`:
  - No date (today) → `balances_v2` (current balances, works on every chain).
  - Past date → `historical_balances` with `date=YYYY-MM-DD`. GoldRush resolves the date to the correct block internally — no manual block-height lookup needed. If a chain doesn't support this endpoint (Arbitrum currently 501s on it for this plan), the client automatically falls back to `portfolio_v2` (daily snapshots) for that chain only.
  - If a chain's request fails outright, that chain is dropped and reported in `chainErrors` rather than failing the whole response.
- `components/PortfolioView.tsx` — shows total value, a per-chain USD breakdown, any partial-failure warnings, and the full token table (each row tagged with its chain; native ETH shows up as a normal row per chain).
