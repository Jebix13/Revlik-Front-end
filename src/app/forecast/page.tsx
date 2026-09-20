import NavBar from "@/components/NavBar";
import StatTile from "@/components/StatTile";
import MonthlyForecastChart from "@/components/MonthlyForecastChart";
import StageBreakdownChart from "@/components/StageBreakdownChart";
import { prisma } from "@/lib/prisma";
import { StageKey, formatCurrency } from "@/lib/stages";
import { computeSummary, computeMonthlyForecast, computeStageBreakdown } from "@/lib/forecast";

export const dynamic = "force-dynamic";

export default async function ForecastPage() {
  const dbDeals = await prisma.deal.findMany();
  const deals = dbDeals.map((d) => ({
    value: d.value,
    stage: d.stage as StageKey,
    probability: d.probability,
    expectedCloseDate: d.expectedCloseDate,
  }));

  const summary = computeSummary(deals);
  const monthly = computeMonthlyForecast(deals, 6);
  const stageBreakdown = computeStageBreakdown(deals);

  return (
    <div className="min-h-screen bg-[#f9f9f7] dark:bg-[#0d0d0d]">
      <NavBar />
      <main className="mx-auto max-w-6xl px-6 py-8">
        <h1 className="mb-6 text-lg font-semibold text-[#0b0b0b] dark:text-white">
          Forecast
        </h1>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatTile
            label="Weighted forecast"
            value={formatCurrency(summary.weightedForecast)}
            sublabel={`${summary.openDealCount} open deal${summary.openDealCount === 1 ? "" : "s"}`}
          />
          <StatTile
            label="Total open pipeline"
            value={formatCurrency(summary.totalOpenPipeline)}
          />
          <StatTile
            label="Win rate"
            value={summary.winRate === null ? "—" : `${Math.round(summary.winRate * 100)}%`}
            sublabel="of closed deals"
          />
          <StatTile
            label="Avg. won deal size"
            value={summary.avgDealSize === null ? "—" : formatCurrency(summary.avgDealSize)}
          />
        </div>

        <section className="mt-8 rounded-xl border border-black/10 bg-[#fcfcfb] p-5 dark:border-white/10 dark:bg-[#1a1a19]">
          <h2 className="mb-4 text-sm font-semibold text-[#0b0b0b] dark:text-white">
            Forecast by close month
          </h2>
          <MonthlyForecastChart buckets={monthly} />
        </section>

        <section className="mt-6 rounded-xl border border-black/10 bg-[#fcfcfb] p-5 dark:border-white/10 dark:bg-[#1a1a19]">
          <h2 className="mb-4 text-sm font-semibold text-[#0b0b0b] dark:text-white">
            Pipeline value by stage
          </h2>
          <StageBreakdownChart buckets={stageBreakdown} />
        </section>
      </main>
    </div>
  );
}
