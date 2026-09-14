"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export type RevenueChartPoint = {
  key: string;
  label: string;
  amount: number;
};

export function RevenueBarChart({ data }: { data: RevenueChartPoint[] }) {
  const [hoverKey, setHoverKey] = useState<string | null>(null);

  const max = Math.max(1, ...data.map((d) => d.amount));
  const hovered = data.find((d) => d.key === hoverKey) ?? null;
  const showEveryLabel = data.length <= 15;
  const labelStep = showEveryLabel ? 1 : Math.ceil(data.length / 10);

  return (
    <div className="relative">
      <div className="flex h-6 justify-center">
        {hovered && (
          <div className="pointer-events-none flex items-center gap-1.5 rounded-md border border-border bg-popover px-2.5 py-1 text-xs shadow-sm">
            <span className="font-medium text-foreground">{hovered.label}</span>
            <span className="text-muted-foreground">·</span>
            <span dir="ltr" className="font-semibold text-foreground">
              {hovered.amount.toLocaleString()}
            </span>
          </div>
        )}
      </div>

      <div
        className="mt-2 flex h-48 items-end gap-1 border-b border-border sm:gap-1.5"
        onMouseLeave={() => setHoverKey(null)}
      >
        {data.map((point) => {
          const pct = point.amount > 0 ? Math.max((point.amount / max) * 100, 3) : 0;
          const isHovered = hoverKey === point.key;

          return (
            <div
              key={point.key}
              className="flex h-full min-w-0 flex-1 items-end justify-center"
              onMouseEnter={() => setHoverKey(point.key)}
              onFocus={() => setHoverKey(point.key)}
              onBlur={() => setHoverKey(null)}
              tabIndex={0}
              role="img"
              aria-label={`${point.label}: ${point.amount.toLocaleString()}`}
            >
              <div
                className={cn(
                  "w-full max-w-6 rounded-t-[4px] bg-primary transition-opacity",
                  isHovered ? "opacity-100" : "opacity-75",
                )}
                style={{ height: `${pct}%` }}
              />
            </div>
          );
        })}
      </div>

      <div className="mt-1.5 flex gap-1 sm:gap-1.5">
        {data.map((point, i) => (
          <div key={point.key} className="min-w-0 flex-1 text-center">
            <span className="text-[11px] text-muted-foreground">
              {i % labelStep === 0 ? point.label : ""}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
