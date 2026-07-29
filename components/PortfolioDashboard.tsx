"use client";

import { useState } from "react";
import { AddressInput } from "@/components/AddressInput";
import { DatePickerField } from "@/components/DatePickerField";
import { PortfolioView } from "@/components/PortfolioView";
import type { PortfolioResult } from "@/lib/goldrush/types";
import { isValidEthAddress } from "@/lib/validation";
import { todayIsoDate } from "@/lib/format";

type Status = "idle" | "loading" | "error" | "success";

export function PortfolioDashboard() {
  const [address, setAddress] = useState("");
  const [date, setDate] = useState(todayIsoDate());
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioResult | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!isValidEthAddress(address)) {
      setStatus("error");
      setError("Enter a valid Ethereum address (0x followed by 40 hex characters).");
      return;
    }

    setStatus("loading");
    setError(null);

    try {
      const params = new URLSearchParams({ address, date });
      const res = await fetch(`/api/portfolio?${params.toString()}`);
      const body = await res.json();

      if (!res.ok) {
        throw new Error(body.error ?? "Failed to load portfolio.");
      }

      setPortfolio(body as PortfolioResult);
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Failed to load portfolio.");
    }
  }

  return (
    <div className="flex w-full max-w-3xl flex-col gap-6">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="flex-1">
          <AddressInput value={address} onChange={setAddress} />
        </div>
        <DatePickerField value={date} onChange={setDate} />
        <button
          type="submit"
          disabled={status === "loading"}
          className="h-fit rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900"
        >
          {status === "loading" ? "Loading…" : "View portfolio"}
        </button>
      </form>

      {status === "error" && error && (
        <p className="rounded-md bg-red-50 px-4 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      {status === "success" && portfolio && <PortfolioView portfolio={portfolio} />}
    </div>
  );
}
