import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { STAGE_ORDER, StageKey, defaultProbabilityForStage } from "@/lib/stages";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const stage = body?.stage as StageKey | undefined;

  if (!stage || !STAGE_ORDER.includes(stage)) {
    return NextResponse.json({ error: "Invalid stage" }, { status: 400 });
  }

  try {
    const deal = await prisma.deal.update({
      where: { id },
      data: { stage, probability: defaultProbabilityForStage(stage) },
    });
    return NextResponse.json(deal);
  } catch {
    return NextResponse.json({ error: "Deal not found" }, { status: 404 });
  }
}
