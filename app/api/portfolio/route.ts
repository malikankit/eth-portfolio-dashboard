import { NextRequest, NextResponse } from "next/server";
import { getPortfolio, GoldRushError } from "@/lib/goldrush/client";
import { isValidDateString, isValidEthAddress } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address")?.trim() ?? "";
  const date = searchParams.get("date")?.trim() || undefined;

  if (!isValidEthAddress(address)) {
    return NextResponse.json(
      { error: "Invalid Ethereum address." },
      { status: 400 },
    );
  }

  if (date && !isValidDateString(date)) {
    return NextResponse.json(
      { error: "Invalid date. Expected format: YYYY-MM-DD." },
      { status: 400 },
    );
  }

  try {
    const portfolio = await getPortfolio(address, date);
    return NextResponse.json(portfolio);
  } catch (err) {
    if (err instanceof GoldRushError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error(err);
    return NextResponse.json(
      { error: "Unexpected server error." },
      { status: 500 },
    );
  }
}
