export const STAGE_ORDER = [
  "LEAD",
  "QUALIFIED",
  "PROPOSAL",
  "NEGOTIATION",
  "CLOSED_WON",
  "CLOSED_LOST",
] as const;

export type StageKey = (typeof STAGE_ORDER)[number];

export const STAGES: Record<
  StageKey,
  { label: string; probability: number; isOpen: boolean }
> = {
  LEAD: { label: "Lead", probability: 10, isOpen: true },
  QUALIFIED: { label: "Qualified", probability: 25, isOpen: true },
  PROPOSAL: { label: "Proposal", probability: 50, isOpen: true },
  NEGOTIATION: { label: "Negotiation", probability: 75, isOpen: true },
  CLOSED_WON: { label: "Closed Won", probability: 100, isOpen: false },
  CLOSED_LOST: { label: "Closed Lost", probability: 0, isOpen: false },
};

export const OPEN_STAGES = STAGE_ORDER.filter((s) => STAGES[s].isOpen);

export function defaultProbabilityForStage(stage: StageKey): number {
  return STAGES[stage].probability;
}

export const STAGE_COLOR: Record<StageKey, string> = {
  LEAD: "#86b6ef",
  QUALIFIED: "#5598e7",
  PROPOSAL: "#2a78d6",
  NEGOTIATION: "#1c5cab",
  CLOSED_WON: "#0ca30c",
  CLOSED_LOST: "#898781",
};

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatCompactCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}
