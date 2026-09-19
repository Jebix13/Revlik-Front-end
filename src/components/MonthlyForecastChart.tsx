"use client";

import { useState } from "react";
import { MonthBucket } from "@/lib/forecast";
import { formatCompactCurrency, formatCurrency } from "@/lib/stages";

const COLOR_WEIGHTED = "#2a78d6";
const COLOR_TOTAL = "#86b6ef";

function niceMax(value: number): number {
  if (value <= 0) return 1000;
  const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
  const normalized = value / magnitude;
  const step = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return step * magnitude;
}

export default function MonthlyForecastChart({ buckets }: { buckets: MonthBucket[] }) {
  const [hovered, setHovered] = useState<number | null>(null);

  const width = 720;
  const height = 260;
  const padding = { top: 16, right: 16, bottom: 32, left: 56 };
  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;

  const rawMax = Math.max(1, ...buckets.map((b) => b.totalValue));
  const yMax = niceMax(rawMax);
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * yMax);

  const groupW = plotW / buckets.length;
  const barW = Math.min(24, groupW * 0.28);
  const barGap = 2;

  const yScale = (v: number) => plotH - (v / yMax) * plotH;

  return (
    <div className="relative">
      <div className="mb-3 flex items-center gap-4 text-xs text-[#52514e] dark:text-[#c3c2b7]">
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: COLOR_WEIGHTED }}
          />
          Weighted forecast
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: COLOR_TOTAL }}
          />
          Total open pipeline
        </span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img">
        <g transform={`translate(${padding.left},${padding.top})`}>
          {yTicks.map((t, i) => (
            <g key={i}>
              <line
                x1={0}
                x2={plotW}
                y1={yScale(t)}
                y2={yScale(t)}
                stroke="currentColor"
                className="text-[#e1e0d9] dark:text-[#2c2c2a]"
                strokeWidth={1}
              />
              <text
                x={-8}
                y={yScale(t)}
                textAnchor="end"
                dominantBaseline="middle"
                className="fill-[#898781] text-[10px]"
              >
                {formatCompactCurrency(t)}
              </text>
            </g>
          ))}
          <line
            x1={0}
            x2={plotW}
            y1={plotH}
            y2={plotH}
            stroke="currentColor"
            className="text-[#c3c2b7] dark:text-[#383835]"
            strokeWidth={1}
          />

          {buckets.map((b, i) => {
            const groupX = i * groupW;
            const centerX = groupX + groupW / 2;
            const totalH = plotH - yScale(b.totalValue);
            const weightedH = plotH - yScale(b.weightedValue);
            const isHovered = hovered === i;

            return (
              <g
                key={b.key}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              >
                <rect
                  x={groupX}
                  y={0}
                  width={groupW}
                  height={plotH}
                  fill="transparent"
                />
                <rect
                  x={centerX - barGap / 2 - barW}
                  y={plotH - totalH}
                  width={barW}
                  height={Math.max(totalH, 0)}
                  rx={4}
                  fill={COLOR_TOTAL}
                  opacity={isHovered ? 1 : 0.9}
                />
                <rect
                  x={centerX + barGap / 2}
                  y={plotH - weightedH}
                  width={barW}
                  height={Math.max(weightedH, 0)}
                  rx={4}
                  fill={COLOR_WEIGHTED}
                  opacity={isHovered ? 1 : 0.9}
                />
                <text
                  x={centerX}
                  y={plotH + 18}
                  textAnchor="middle"
                  className="fill-[#898781] text-[10px]"
                >
                  {b.label}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      {hovered !== null && (
        <div className="pointer-events-none absolute top-2 right-2 rounded-lg border border-black/10 bg-[#fcfcfb] px-3 py-2 text-xs shadow-md dark:border-white/10 dark:bg-[#1a1a19]">
          <p className="font-medium text-[#0b0b0b] dark:text-white">
            {buckets[hovered].label}
          </p>
          <p className="mt-1 text-[#52514e] dark:text-[#c3c2b7]">
            Weighted: {formatCurrency(buckets[hovered].weightedValue)}
          </p>
          <p className="text-[#52514e] dark:text-[#c3c2b7]">
            Total: {formatCurrency(buckets[hovered].totalValue)}
          </p>
          <p className="text-[#898781]">{buckets[hovered].dealCount} deal(s)</p>
        </div>
      )}
    </div>
  );
}
