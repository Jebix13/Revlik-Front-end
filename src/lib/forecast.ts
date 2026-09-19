import { STAGE_ORDER, StageKey, STAGES } from "@/lib/stages";

export type ForecastDeal = {
  value: number;
  stage: StageKey;
  probability: number;
  expectedCloseDate: Date;
};

export type MonthBucket = {
  key: string; // "2026-01"
  label: string; // "Jan 2026"
  totalValue: number;
  weightedValue: number;
  dealCount: number;
};

export type StageBucket = {
  stage: StageKey;
  label: string;
  totalValue: number;
  weightedValue: number;
  dealCount: number;
};

const isOpen = (d: ForecastDeal) => STAGES[d.stage].isOpen;

export function computeSummary(deals: ForecastDeal[]) {
  const open = deals.filter(isOpen);
  const closedWon = deals.filter((d) => d.stage === "CLOSED_WON");
  const closedLost = deals.filter((d) => d.stage === "CLOSED_LOST");

  const totalOpenPipeline = open.reduce((sum, d) => sum + d.value, 0);
  const weightedForecast = open.reduce(
    (sum, d) => sum + (d.value * d.probability) / 100,
    0
  );
  const closedCount = closedWon.length + closedLost.length;
  const winRate = closedCount === 0 ? null : closedWon.length / closedCount;
  const closedWonValue = closedWon.reduce((sum, d) => sum + d.value, 0);
  const avgDealSize = closedWon.length === 0 ? null : closedWonValue / closedWon.length;

  return {
    openDealCount: open.length,
    totalOpenPipeline,
    weightedForecast,
    winRate,
    avgDealSize,
    closedWonValue,
  };
}

export function computeMonthlyForecast(
  deals: ForecastDeal[],
  monthsAhead = 6
): MonthBucket[] {
  const open = deals.filter(isOpen);
  const now = new Date();
  const buckets: MonthBucket[] = [];

  for (let i = 0; i < monthsAhead; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    buckets.push({ key, label, totalValue: 0, weightedValue: 0, dealCount: 0 });
  }

  const bucketByKey = new Map(buckets.map((b) => [b.key, b]));

  for (const deal of open) {
    const d = deal.expectedCloseDate;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const bucket = bucketByKey.get(key);
    if (!bucket) continue; // outside the forecast window
    bucket.totalValue += deal.value;
    bucket.weightedValue += (deal.value * deal.probability) / 100;
    bucket.dealCount += 1;
  }

  return buckets;
}

export function computeStageBreakdown(deals: ForecastDeal[]): StageBucket[] {
  return STAGE_ORDER.map((stage) => {
    const stageDeals = deals.filter((d) => d.stage === stage);
    return {
      stage,
      label: STAGES[stage].label,
      totalValue: stageDeals.reduce((sum, d) => sum + d.value, 0),
      weightedValue: stageDeals.reduce(
        (sum, d) => sum + (d.value * d.probability) / 100,
        0
      ),
      dealCount: stageDeals.length,
    };
  });
}
