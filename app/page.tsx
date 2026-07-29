import { PortfolioDashboard } from "@/components/PortfolioDashboard";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center bg-zinc-50 px-4 py-16 font-sans dark:bg-black">
      <main className="flex w-full max-w-3xl flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
            ETH Portfolio Dashboard
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Enter an Ethereum address to view its ETH + ERC-20 holdings, today or on a past date.
          </p>
        </div>
        <PortfolioDashboard />
      </main>
    </div>
  );
}
