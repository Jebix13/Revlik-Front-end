import { STAGE_ORDER, StageKey } from "@/lib/stages";

export type DealInput = {
  name: string;
  account: string;
  contactName?: string | null;
  value: number;
  stage: StageKey;
  probability: number;
  expectedCloseDate: string;
  notes?: string | null;
};

export function parseDealInput(body: unknown): { data: DealInput } | { error: string } {
  if (typeof body !== "object" || body === null) {
    return { error: "Invalid request body" };
  }
  const b = body as Record<string, unknown>;

  const name = typeof b.name === "string" ? b.name.trim() : "";
  if (!name) return { error: "Deal name is required" };

  const account = typeof b.account === "string" ? b.account.trim() : "";
  if (!account) return { error: "Account name is required" };

  const value = Number(b.value);
  if (!Number.isFinite(value) || value < 0) {
    return { error: "Value must be a non-negative number" };
  }

  const stage = typeof b.stage === "string" ? (b.stage as StageKey) : "LEAD";
  if (!STAGE_ORDER.includes(stage)) {
    return { error: "Invalid stage" };
  }

  const probability = Number(b.probability);
  if (!Number.isFinite(probability) || probability < 0 || probability > 100) {
    return { error: "Probability must be between 0 and 100" };
  }

  const expectedCloseDate = typeof b.expectedCloseDate === "string" ? b.expectedCloseDate : "";
  if (!expectedCloseDate || Number.isNaN(Date.parse(expectedCloseDate))) {
    return { error: "A valid expected close date is required" };
  }

  const contactName = typeof b.contactName === "string" ? b.contactName.trim() || null : null;
  const notes = typeof b.notes === "string" ? b.notes.trim() || null : null;

  return {
    data: { name, account, contactName, value, stage, probability, expectedCloseDate, notes },
  };
}
