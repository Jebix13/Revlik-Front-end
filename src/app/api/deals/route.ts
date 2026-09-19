import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseDealInput } from "@/lib/validation";

export async function GET() {
  const deals = await prisma.deal.findMany({ orderBy: { expectedCloseDate: "asc" } });
  return NextResponse.json(deals);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const result = parseDealInput(body);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  const deal = await prisma.deal.create({
    data: {
      ...result.data,
      expectedCloseDate: new Date(result.data.expectedCloseDate),
    },
  });
  return NextResponse.json(deal, { status: 201 });
}
