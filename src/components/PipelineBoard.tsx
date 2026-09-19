"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { STAGE_ORDER, STAGES, StageKey, formatCurrency } from "@/lib/stages";

export type DealSummary = {
  id: string;
  name: string;
  account: string;
  value: number;
  stage: StageKey;
  probability: number;
  expectedCloseDate: string;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

const STAGE_ACCENT: Record<StageKey, string> = {
  LEAD: "border-t-[#86b6ef]",
  QUALIFIED: "border-t-[#5598e7]",
  PROPOSAL: "border-t-[#2a78d6]",
  NEGOTIATION: "border-t-[#1c5cab]",
  CLOSED_WON: "border-t-[#0ca30c]",
  CLOSED_LOST: "border-t-[#898781]",
};

function DealCard({ deal }: { deal: DealSummary }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleStageChange(stage: StageKey) {
    startTransition(async () => {
      await fetch(`/api/deals/${deal.id}/stage`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage }),
      });
      router.refresh();
    });
  }

  return (
    <div
      className={`rounded-lg border border-t-2 border-black/10 bg-[#fcfcfb] p-3 shadow-sm dark:border-white/10 dark:bg-[#1a1a19] ${STAGE_ACCENT[deal.stage]} ${
        isPending ? "opacity-50" : ""
      }`}
    >
      <Link href={`/deals/${deal.id}/edit`} className="block">
        <p className="text-sm font-medium text-[#0b0b0b] hover:underline dark:text-white">
          {deal.name}
        </p>
        <p className="mt-0.5 text-xs text-[#52514e] dark:text-[#c3c2b7]">
          {deal.account}
        </p>
      </Link>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-sm font-semibold text-[#0b0b0b] dark:text-white">
          {formatCurrency(deal.value)}
        </span>
        <span className="text-xs text-[#898781]">{deal.probability}%</span>
      </div>
      <div className="mt-1 flex items-center justify-between">
        <span className="text-xs text-[#898781]">
          Closes {formatDate(deal.expectedCloseDate)}
        </span>
      </div>
      <select
        value={deal.stage}
        onChange={(e) => handleStageChange(e.target.value as StageKey)}
        disabled={isPending}
        className="mt-2 w-full rounded-md border border-black/10 bg-transparent px-2 py-1 text-xs text-[#52514e] outline-none dark:border-white/10 dark:text-[#c3c2b7]"
      >
        {STAGE_ORDER.map((s) => (
          <option key={s} value={s}>
            {STAGES[s].label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function PipelineBoard({ deals }: { deals: DealSummary[] }) {
  const [query, setQuery] = useState("");

  const filtered = query
    ? deals.filter(
        (d) =>
          d.name.toLowerCase().includes(query.toLowerCase()) ||
          d.account.toLowerCase().includes(query.toLowerCase())
      )
    : deals;

  return (
    <div className="flex flex-col gap-4">
      <input
        placeholder="Search deals or accounts…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full max-w-sm rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm text-[#0b0b0b] outline-none focus:border-[#2a78d6] dark:border-white/10 dark:text-white"
      />
      <div className="grid grid-flow-col auto-cols-[260px] gap-4 overflow-x-auto pb-4">
        {STAGE_ORDER.map((stage) => {
          const stageDeals = filtered.filter((d) => d.stage === stage);
          const total = stageDeals.reduce((sum, d) => sum + d.value, 0);
          return (
            <div key={stage} className="flex flex-col gap-3">
              <div>
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-[#0b0b0b] dark:text-white">
                    {STAGES[stage].label}
                  </h2>
                  <span className="text-xs text-[#898781]">
                    {stageDeals.length}
                  </span>
                </div>
                <p className="text-xs text-[#898781]">{formatCurrency(total)}</p>
              </div>
              <div className="flex flex-col gap-2">
                {stageDeals.map((deal) => (
                  <DealCard key={deal.id} deal={deal} />
                ))}
                {stageDeals.length === 0 && (
                  <p className="rounded-lg border border-dashed border-black/10 p-3 text-center text-xs text-[#898781] dark:border-white/10">
                    No deals
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
