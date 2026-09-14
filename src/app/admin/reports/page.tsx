import type { Metadata } from "next";
import { Hash, TrendingUp, Wallet } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { getRevenueReport } from "@/lib/admin/revenueReport";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RevenueBarChart } from "@/components/admin/reports/RevenueBarChart";
import { RevenueReportFilter } from "@/components/admin/reports/RevenueReportFilter";
import { formatDate } from "@/lib/format";
import { parseRevenueReportFilter } from "@/validations/revenueReportFilter.schema";

export const metadata: Metadata = {
  title: "تقرير الإيرادات",
};

type SearchParams = Promise<{
  mode?: string;
  month?: string;
  year?: string;
  from?: string;
  to?: string;
}>;

const MONTH_FORMATTER = new Intl.DateTimeFormat("ar", {
  year: "numeric",
  month: "long",
  numberingSystem: "latn",
});

const DAY_FORMATTER = new Intl.DateTimeFormat("ar", {
  day: "numeric",
  month: "short",
  numberingSystem: "latn",
});

function monthLabel(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);
  return MONTH_FORMATTER.format(new Date(Date.UTC(year, month - 1, 1)));
}

function dayLabel(dayKey: string) {
  const [year, month, day] = dayKey.split("-").map(Number);
  return DAY_FORMATTER.format(new Date(Date.UTC(year, month - 1, day)));
}

export default async function RevenueReportPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const { mode, month, year, range } = parseRevenueReportFilter(params);

  const admin = createAdminClient();
  const report = await getRevenueReport(admin, range);

  const isMonthly = mode === "monthly";
  const breakdown = isMonthly ? report.by_day : report.by_month;
  const chartData = breakdown.map((b) => ({
    key: b.key,
    label: isMonthly ? dayLabel(b.key) : monthLabel(b.key),
    amount: b.amount,
  }));

  const periodLabel =
    mode === "monthly"
      ? monthLabel(month)
      : mode === "yearly"
        ? year
        : `${formatDate(range.from)} — ${formatDate(range.to)}`;

  const statsCards = [
    {
      label: "إجمالي الإيرادات",
      value: report.total.toLocaleString(),
      icon: Wallet,
    },
    { label: "عدد الدفعات", value: report.count.toLocaleString(), icon: Hash },
    {
      label: "متوسط الدفعة",
      value: Math.round(report.average).toLocaleString(),
      icon: TrendingUp,
    },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          تقرير الإيرادات
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          إيرادات الاشتراكات — {periodLabel}
        </p>
      </div>

      <RevenueReportFilter
        mode={mode}
        month={month}
        year={year}
        from={range.from}
        to={range.to}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {statsCards.map((card) => (
          <Card key={card.label}>
            <CardContent>
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm text-muted-foreground">{card.label}</p>
                <div className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <card.icon className="size-4" />
                </div>
              </div>
              <p
                className="mt-3 text-3xl font-semibold tracking-tight"
                dir="ltr"
              >
                {card.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {report.count === 0 ? (
        <div className="rounded-xl border border-dashed px-6 py-16 text-center">
          <h2 className="text-lg font-semibold">
            لا توجد إيرادات في هذه الفترة
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-7 text-muted-foreground">
            جرّب تغيير الفترة أو نطاق التاريخ.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <Card>
            <CardContent>
              <h2 className="font-semibold">
                {isMonthly ? "الإيرادات اليومية" : "الإيرادات الشهرية"}
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {periodLabel}
              </p>
              <div className="mt-4">
                <RevenueBarChart data={chartData} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <h2 className="mb-3 font-semibold">
                {isMonthly ? "التفصيل اليومي" : "التفصيل الشهري"}
              </h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{isMonthly ? "اليوم" : "الشهر"}</TableHead>
                    <TableHead>الإيرادات</TableHead>
                    <TableHead>عدد الدفعات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {breakdown.map((row) => (
                    <TableRow key={row.key}>
                      <TableCell>
                        {isMonthly ? dayLabel(row.key) : monthLabel(row.key)}
                      </TableCell>
                      <TableCell dir="ltr" className="text-end">
                        {row.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>{row.count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {mode === "custom" && report.by_year.length > 1 && (
            <Card>
              <CardContent>
                <h2 className="mb-3 font-semibold">الإيرادات السنوية</h2>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>السنة</TableHead>
                      <TableHead>الإيرادات</TableHead>
                      <TableHead>عدد الدفعات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {report.by_year.map((row) => (
                      <TableRow key={row.key}>
                        <TableCell>{row.key}</TableCell>
                        <TableCell dir="ltr" className="text-end">
                          {row.amount.toLocaleString()}
                        </TableCell>
                        <TableCell>{row.count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
