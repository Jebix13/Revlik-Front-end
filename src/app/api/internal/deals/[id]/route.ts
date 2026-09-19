import { NextRequest, NextResponse } from "next/server";
import { isAuthorizedInternalRequest } from "@/lib/internalAuth";
import * as dealActions from "@/lib/dealActions";
import { STAGE_ORDER, StageKey } from "@/lib/stages";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  if (!isAuthorizedInternalRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  const body = await request.json().catch(() => null);
  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const b = body as Record<string, unknown>;

  const stage =
    typeof b.stage === "string" && STAGE_ORDER.includes(b.stage as StageKey)
      ? (b.stage as StageKey)
      : undefined;

  try {
    const deal = await dealActions.updateDeal({
      id,
      name: typeof b.name === "string" ? b.name : undefined,
      account: typeof b.account === "string" ? b.account : undefined,
      value: typeof b.value === "number" ? b.value : undefined,
      stage,
      probability: typeof b.probability === "number" ? b.probability : undefined,
      expectedCloseDate: typeof b.expectedCloseDate === "string" ? b.expectedCloseDate : undefined,
      notes: typeof b.notes === "string" ? b.notes : undefined,
    });
    return NextResponse.json(deal);
  } catch {
    return NextResponse.json({ error: `No deal found with id ${id}` }, { status: 404 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  if (!isAuthorizedInternalRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  try {
    await dealActions.deleteDeal(id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: `No deal found with id ${id}` }, { status: 404 });
  }
}
