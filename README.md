# ETH Portfolio Dashboard

Enter an Ethereum address to view its ETH + ERC-20 token portfolio — for today, or for any past date via the date picker.

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
- `lib/goldrush/client.ts` — GoldRush API client. Uses `balances_v2` for the current date, and `portfolio_v2` (historical daily snapshots) for past dates.
- `components/PortfolioDashboard.tsx` — client component wiring the address input, date picker, and results view together.

**Note:** The historical endpoint's exact field names were sourced from GoldRush's public docs but haven't been verified against a live response yet. Once you have an API key, test a request with a past date — if the response shape differs from what's in `lib/goldrush/client.ts`, that file is the only place that needs adjusting.
