import { Deal } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { StageKey, STAGES, defaultProbabilityForStage } from "@/lib/stages";

export function serializeDeal(d: Deal) {
  return {
    id: d.id,
    name: d.name,
    account: d.account,
    contactName: d.contactName,
    value: d.value,
    stage: d.stage,
    stageLabel: STAGES[d.stage as StageKey].label,
    probability: d.probability,
    expectedCloseDate: d.expectedCloseDate.toISOString().slice(0, 10),
    notes: d.notes,
  };
}

export async function listDeals() {
  const deals = await prisma.deal.findMany({ orderBy: { expectedCloseDate: "asc" } });
  return deals.map(serializeDeal);
}

export type UpdateDealInput = {
  id: string;
  name?: string;
  account?: string;
  value?: number;
  stage?: StageKey;
  probability?: number;
  expectedCloseDate?: string;
  notes?: string;
};

export async function updateDeal(input: UpdateDealInput) {
  const data: Record<string, unknown> = {};
  if (input.name !== undefined) data.name = input.name;
  if (input.account !== undefined) data.account = input.account;
  if (input.value !== undefined) data.value = input.value;
  if (input.stage !== undefined) {
    data.stage = input.stage;
    data.probability = input.probability ?? defaultProbabilityForStage(input.stage);
  } else if (input.probability !== undefined) {
    data.probability = input.probability;
  }
  if (input.expectedCloseDate !== undefined) {
    data.expectedCloseDate = new Date(input.expectedCloseDate);
  }
  if (input.notes !== undefined) data.notes = input.notes;

  const deal = await prisma.deal.update({ where: { id: input.id }, data });
  return serializeDeal(deal);
}

export type CreateDealInput = {
  name: string;
  account: string;
  value: number;
  stage?: StageKey;
  probability?: number;
  expectedCloseDate: string;
  notes?: string;
};

export async function createDeal(input: CreateDealInput) {
  const stage = input.stage ?? "LEAD";
  const deal = await prisma.deal.create({
    data: {
      name: input.name,
      account: input.account,
      value: input.value,
      stage,
      probability: input.probability ?? defaultProbabilityForStage(stage),
      expectedCloseDate: new Date(input.expectedCloseDate),
      notes: input.notes ?? null,
    },
  });
  return serializeDeal(deal);
}

export async function deleteDeal(id: string) {
  await prisma.deal.delete({ where: { id } });
}
