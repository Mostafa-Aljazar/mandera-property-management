import "server-only";
import type { createAdminClient } from "@/lib/supabase/admin";
import type { RevenueReportRange } from "@/validations/revenueReportFilter.schema";

type AdminClient = ReturnType<typeof createAdminClient>;
type Bucket = { key: string; amount: number; count: number };

function bump(map: Map<string, { amount: number; count: number }>, key: string, amount: number) {
  const entry = map.get(key) ?? { amount: 0, count: 0 };
  entry.amount += amount;
  entry.count += 1;
  map.set(key, entry);
}

function sortedBuckets(map: Map<string, { amount: number; count: number }>): Bucket[] {
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, v]) => ({ key, ...v }));
}

export async function getRevenueReport(admin: AdminClient, range: RevenueReportRange) {
  const { data: payments } = await admin
    .from("subscription_payments")
    .select("id, owner_id, amount, created_at")
    .gte("created_at", `${range.from}T00:00:00Z`)
    .lte("created_at", `${range.to}T23:59:59Z`)
    .order("created_at", { ascending: true });

  const rows = payments ?? [];
  const ownerIds = [...new Set(rows.map((r) => r.owner_id))];

  const { data: owners } = ownerIds.length
    ? await admin.from("users").select("id, full_name").in("id", ownerIds)
    : { data: [] };

  const ownerNameById = new Map((owners ?? []).map((o) => [o.id, o.full_name]));

  const byDay = new Map<string, { amount: number; count: number }>();
  const byMonth = new Map<string, { amount: number; count: number }>();
  const byYear = new Map<string, { amount: number; count: number }>();

  for (const row of rows) {
    bump(byDay, row.created_at.slice(0, 10), row.amount);
    bump(byMonth, row.created_at.slice(0, 7), row.amount);
    bump(byYear, row.created_at.slice(0, 4), row.amount);
  }

  const total = rows.reduce((sum, r) => sum + r.amount, 0);

  return {
    range,
    total,
    count: rows.length,
    average: rows.length ? total / rows.length : 0,
    by_day: sortedBuckets(byDay),
    by_month: sortedBuckets(byMonth),
    by_year: sortedBuckets(byYear),
    payments: rows.map((r) => ({
      ...r,
      owner_name: ownerNameById.get(r.owner_id) ?? "—",
    })),
  };
}
