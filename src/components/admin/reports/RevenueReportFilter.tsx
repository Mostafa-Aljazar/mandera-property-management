"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  buildRevenueReportHref,
  type RevenueReportMode,
} from "@/validations/revenueReportFilter.schema";

const modeTabs = [
  { value: "monthly", label: "شهري" },
  { value: "yearly", label: "سنوي" },
  { value: "custom", label: "مخصص" },
] as const;

export function RevenueReportFilter({
  mode,
  month,
  year,
  from,
  to,
}: {
  mode: RevenueReportMode;
  month: string;
  year: string;
  from: string;
  to: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [monthValue, setMonthValue] = useState(month);
  const [yearValue, setYearValue] = useState(year);
  const [fromValue, setFromValue] = useState(from);
  const [toValue, setToValue] = useState(to);

  function navigate(
    nextMode: RevenueReportMode,
    overrides: Partial<{ month: string; year: string; from: string; to: string }> = {},
  ) {
    startTransition(() => {
      router.push(
        buildRevenueReportHref({
          mode: nextMode,
          month: overrides.month ?? monthValue,
          year: overrides.year ?? yearValue,
          from: overrides.from ?? fromValue,
          to: overrides.to ?? toValue,
        }),
      );
    });
  }

  return (
    <Card className="flex flex-col gap-4 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
      <Tabs value={mode} onValueChange={(value) => navigate(value as RevenueReportMode)}>
        <TabsList>
          {modeTabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} disabled={pending}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {mode === "monthly" && (
        <div className="space-y-1.5">
          <Label htmlFor="month">الشهر</Label>
          <Input
            id="month"
            type="month"
            value={monthValue}
            onChange={(e) => {
              setMonthValue(e.target.value);
              navigate("monthly", { month: e.target.value });
            }}
            disabled={pending}
          />
        </div>
      )}

      {mode === "yearly" && (
        <div className="flex items-end gap-2">
          <div className="space-y-1.5">
            <Label htmlFor="year">السنة</Label>
            <Input
              id="year"
              type="number"
              min={2020}
              max={2100}
              value={yearValue}
              onChange={(e) => setYearValue(e.target.value)}
              disabled={pending}
              className="w-28"
              dir="ltr"
            />
          </div>
          <button
            type="button"
            onClick={() => navigate("yearly", { year: yearValue })}
            disabled={pending}
            className="inline-flex h-8 shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            <Search className="size-4" />
            {pending ? "جارٍ..." : "فلترة"}
          </button>
        </div>
      )}

      {mode === "custom" && (
        <div className="flex flex-wrap items-end gap-2">
          <div className="space-y-1.5">
            <Label htmlFor="from">من</Label>
            <Input
              id="from"
              type="date"
              value={fromValue}
              onChange={(e) => setFromValue(e.target.value)}
              disabled={pending}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="to">الى</Label>
            <Input
              id="to"
              type="date"
              value={toValue}
              onChange={(e) => setToValue(e.target.value)}
              disabled={pending}
            />
          </div>
          <button
            type="button"
            onClick={() => navigate("custom")}
            disabled={pending}
            className="inline-flex h-8 shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            <Search className="size-4" />
            {pending ? "جارٍ..." : "فلترة"}
          </button>
        </div>
      )}
    </Card>
  );
}
