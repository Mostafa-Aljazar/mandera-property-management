const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const MONTH_RE = /^\d{4}-\d{2}$/;
const YEAR_RE = /^\d{4}$/;

export type RevenueReportMode = "monthly" | "yearly" | "custom";
export type RevenueReportRange = { from: string; to: string };

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function currentMonth(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${pad(now.getUTCMonth() + 1)}`;
}

function currentYear(): string {
  return String(new Date().getUTCFullYear());
}

function monthRange(month: string): RevenueReportRange {
  const [year, m] = month.split("-").map(Number);
  const from = `${year}-${pad(m)}-01`;
  const to = new Date(Date.UTC(year, m, 0)).toISOString().slice(0, 10);
  return { from, to };
}

function yearRange(year: string): RevenueReportRange {
  return { from: `${year}-01-01`, to: `${year}-12-31` };
}

export function parseRevenueReportFilter(params: {
  mode?: string;
  month?: string;
  year?: string;
  from?: string;
  to?: string;
}): { mode: RevenueReportMode; month: string; year: string; range: RevenueReportRange } {
  const mode: RevenueReportMode =
    params.mode === "yearly" ? "yearly" : params.mode === "custom" ? "custom" : "monthly";

  const month = params.month && MONTH_RE.test(params.month) ? params.month : currentMonth();
  const year = params.year && YEAR_RE.test(params.year) ? params.year : currentYear();

  if (mode === "yearly") {
    return { mode, month, year, range: yearRange(year) };
  }

  if (mode === "custom") {
    const fallback = yearRange(currentYear());
    const from = params.from && DATE_RE.test(params.from) ? params.from : fallback.from;
    const to = params.to && DATE_RE.test(params.to) ? params.to : fallback.to;
    const range = to >= from ? { from, to } : fallback;
    return { mode, month, year, range };
  }

  return { mode, month, year, range: monthRange(month) };
}

export function buildRevenueReportHref(values: {
  mode: RevenueReportMode;
  month?: string;
  year?: string;
  from?: string;
  to?: string;
}) {
  const params = new URLSearchParams();
  params.set("mode", values.mode);

  if (values.mode === "monthly" && values.month) {
    params.set("month", values.month);
  }
  if (values.mode === "yearly" && values.year) {
    params.set("year", values.year);
  }
  if (values.mode === "custom") {
    if (values.from) params.set("from", values.from);
    if (values.to) params.set("to", values.to);
  }

  return `/admin/reports?${params.toString()}`;
}
