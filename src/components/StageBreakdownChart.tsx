"use client";

import { useState } from "react";
import { StageBucket } from "@/lib/forecast";
import { STAGE_COLOR, formatCompactCurrency, formatCurrency } from "@/lib/stages";

export default function StageBreakdownChart({ buckets }: { buckets: StageBucket[] }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const maxValue = Math.max(1, ...buckets.map((b) => b.totalValue));

  return (
    <div className="flex flex-col gap-3">
      {buckets.map((b) => {
        const widthPct = (b.totalValue / maxValue) * 100;
        const isHovered = hovered === b.stage;
        return (
          <div
            key={b.stage}
            className="relative"
            onMouseEnter={() => setHovered(b.stage)}
            onMouseLeave={() => setHovered(null)}
          >
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="font-medium text-[#0b0b0b] dark:text-white">
                {b.label}
              </span>
              <span className="text-[#898781]">
                {b.dealCount} deal{b.dealCount === 1 ? "" : "s"}
              </span>
            </div>
            <div className="h-6 w-full rounded-md bg-[#e1e0d9] dark:bg-[#2c2c2a]">
              <div
                className="flex h-6 items-center rounded-md px-2 transition-[width]"
                style={{
                  width: `${Math.max(widthPct, b.totalValue > 0 ? 4 : 0)}%`,
                  backgroundColor: STAGE_COLOR[b.stage],
                  opacity: isHovered ? 1 : 0.92,
                }}
              >
                {widthPct > 22 && (
                  <span className="truncate text-xs font-medium text-white">
                    {formatCompactCurrency(b.totalValue)}
                  </span>
                )}
              </div>
            </div>
            {isHovered && (
              <div className="pointer-events-none absolute -top-2 left-1/2 z-10 -translate-x-1/2 -translate-y-full rounded-lg border border-black/10 bg-[#fcfcfb] px-3 py-2 text-xs shadow-md dark:border-white/10 dark:bg-[#1a1a19]">
                <p className="font-medium text-[#0b0b0b] dark:text-white">{b.label}</p>
                <p className="text-[#52514e] dark:text-[#c3c2b7]">
                  Total: {formatCurrency(b.totalValue)}
                </p>
                <p className="text-[#52514e] dark:text-[#c3c2b7]">
                  Weighted: {formatCurrency(b.weightedValue)}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
