import { NextRequest, NextResponse } from "next/server";
import { isAuthorizedInternalRequest } from "@/lib/internalAuth";
import * as dealActions from "@/lib/dealActions";
import { STAGE_ORDER, StageKey } from "@/lib/stages";

// GET: list all deals. POST: create a deal.
// Called by n8n's HTTP Request tool nodes - authenticated via the
// x-internal-token header (see src/lib/internalAuth.ts), not the browser
// session cookie.

export async function GET(request: NextRequest) {
  if (!isAuthorizedInternalRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const deals = await dealActions.listDeals();
  return NextResponse.json(deals);
}

export async function POST(request: NextRequest) {
  if (!isAuthorizedInternalRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const b = body as Record<string, unknown>;

  const name = typeof b.name === "string" ? b.name.trim() : "";
  const account = typeof b.account === "string" ? b.account.trim() : "";
  const value = Number(b.value);
  const expectedCloseDate = typeof b.expectedCloseDate === "string" ? b.expectedCloseDate : "";
  if (!name || !account || !Number.isFinite(value) || value < 0 || !expectedCloseDate) {
    return NextResponse.json(
      { error: "name, account, value, and expectedCloseDate (YYYY-MM-DD) are required" },
      { status: 400 }
    );
  }

  const stage =
    typeof b.stage === "string" && STAGE_ORDER.includes(b.stage as StageKey)
      ? (b.stage as StageKey)
      : undefined;
  const probability = Number.isFinite(Number(b.probability)) ? Number(b.probability) : undefined;
  const notes = typeof b.notes === "string" ? b.notes : undefined;

  const deal = await dealActions.createDeal({
    name,
    account,
    value,
    stage,
    probability,
    expectedCloseDate,
    notes,
  });
  return NextResponse.json(deal, { status: 201 });
}
