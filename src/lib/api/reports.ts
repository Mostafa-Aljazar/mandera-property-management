import "server-only";
import type { AuthedOwnerContext } from "./auth";

type SupabaseCtx = AuthedOwnerContext["supabase"];

export type DateRange = { startDate: string; endDate: string };
type DateRangeResult = { ok: true; range: DateRange } | { ok: false; error: string };

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const CONTRACT_STATUSES = ["active", "expiring_soon", "expired", "terminated", "renewed"] as const;
const UNIT_STATUSES = ["available", "rented", "maintenance"] as const;
const MAINTENANCE_STATUSES = ["new_request", "in_progress", "completed"] as const;
const MAINTENANCE_PRIORITIES = ["low", "medium", "high"] as const;

function currentMonthRange(): DateRange {
  const now = new Date();
  const startDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
    .toISOString()
    .slice(0, 10);
  const endDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0))
    .toISOString()
    .slice(0, 10);
  return { startDate, endDate };
}

/** Reads `?start_date=&end_date=` (defaults to the current calendar month) and validates the format. */
export function parseDateRange(url: URL): DateRangeResult {
  const params = url.searchParams;
  const fallback = currentMonthRange();
  const startDate = params.get("start_date") || fallback.startDate;
  const endDate = params.get("end_date") || fallback.endDate;

  if (!DATE_RE.test(startDate) || !DATE_RE.test(endDate)) {
    return { ok: false, error: "start_date/end_date يجب أن تكون بصيغة YYYY-MM-DD" };
  }
  if (endDate < startDate) {
    return { ok: false, error: "end_date يجب أن يكون بعد أو يساوي start_date" };
  }

  return { ok: true, range: { startDate, endDate } };
}

function sumAmounts(rows: { amount: number }[]): number {
  return rows.reduce((total, row) => total + row.amount, 0);
}

function tally<K extends string>(values: K[], allKeys: readonly K[]): Record<K, number> {
  const counts = Object.fromEntries(allKeys.map((k) => [k, 0])) as Record<K, number>;
  for (const value of values) counts[value] = (counts[value] ?? 0) + 1;
  return counts;
}

function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export async function buildDashboard(supabase: SupabaseCtx, ownerId: string) {
  const { startDate: monthStart, endDate: monthEnd } = currentMonthRange();
  const today = new Date().toISOString().slice(0, 10);

  const [
    propertiesCount,
    unitsRes,
    tenantsCount,
    contractsRes,
    pendingPaymentsRes,
    overduePaymentsRes,
    paidThisMonthRes,
    expensesThisMonthRes,
    maintenanceRes,
    unreadNotificationsCount,
  ] = await Promise.all([
    supabase
      .from("properties")
      .select("id", { count: "exact", head: true })
      .eq("owner_id", ownerId)
      .is("deleted_at", null),
    supabase.from("units").select("status").eq("owner_id", ownerId).is("deleted_at", null),
    supabase
      .from("tenants")
      .select("id", { count: "exact", head: true })
      .eq("owner_id", ownerId)
      .is("deleted_at", null),
    supabase.from("contracts").select("status").eq("owner_id", ownerId).is("deleted_at", null),
    supabase.from("payments").select("amount").eq("owner_id", ownerId).eq("status", "due"),
    supabase
      .from("payments")
      .select("amount")
      .eq("owner_id", ownerId)
      .or(`status.eq.overdue,and(status.eq.pending,due_date.lt.${today})`),
    supabase
      .from("payments")
      .select("amount")
      .eq("owner_id", ownerId)
      .eq("status", "paid")
      .gte("paid_date", monthStart)
      .lte("paid_date", monthEnd),
    supabase
      .from("expenses")
      .select("amount")
      .eq("owner_id", ownerId)
      .gte("expense_date", monthStart)
      .lte("expense_date", monthEnd),
    supabase.from("maintenance_requests").select("status").eq("owner_id", ownerId),
    supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("owner_id", ownerId)
      .eq("is_read", false),
  ]);

  const paidThisMonthAmount = sumAmounts(paidThisMonthRes.data ?? []);
  const expensesThisMonthAmount = sumAmounts(expensesThisMonthRes.data ?? []);

  return {
    properties_count: propertiesCount.count ?? 0,
    units: {
      total: unitsRes.data?.length ?? 0,
      ...tally((unitsRes.data ?? []).map((u) => u.status), UNIT_STATUSES),
    },
    tenants_count: tenantsCount.count ?? 0,
    contracts: {
      total: contractsRes.data?.length ?? 0,
      ...tally((contractsRes.data ?? []).map((c) => c.status), CONTRACT_STATUSES),
    },
    payments: {
      pending_count: pendingPaymentsRes.data?.length ?? 0,
      pending_amount: sumAmounts(pendingPaymentsRes.data ?? []),
      overdue_count: overduePaymentsRes.data?.length ?? 0,
      overdue_amount: sumAmounts(overduePaymentsRes.data ?? []),
      paid_this_month_count: paidThisMonthRes.data?.length ?? 0,
      paid_this_month_amount: paidThisMonthAmount,
    },
    expenses_this_month_amount: expensesThisMonthAmount,
    net_income_this_month: paidThisMonthAmount - expensesThisMonthAmount,
    maintenance_requests: {
      total: maintenanceRes.data?.length ?? 0,
      ...tally((maintenanceRes.data ?? []).map((m) => m.status), MAINTENANCE_STATUSES),
    },
    unread_notifications_count: unreadNotificationsCount.count ?? 0,
  };
}

export async function buildFinancialSummaryReport(
  supabase: SupabaseCtx,
  ownerId: string,
  range: DateRange,
) {
  const [paidRes, expensesRes] = await Promise.all([
    supabase
      .from("payments")
      .select("amount")
      .eq("owner_id", ownerId)
      .eq("status", "paid")
      .gte("paid_date", range.startDate)
      .lte("paid_date", range.endDate),
    supabase
      .from("expenses")
      .select("amount")
      .eq("owner_id", ownerId)
      .gte("expense_date", range.startDate)
      .lte("expense_date", range.endDate),
  ]);

  const revenue = sumAmounts(paidRes.data ?? []);
  const expenses = sumAmounts(expensesRes.data ?? []);

  return {
    period: range,
    revenue,
    expenses,
    net_income: revenue - expenses,
  };
}

export async function buildPropertiesReport(supabase: SupabaseCtx, ownerId: string) {
  const [{ data: properties }, { data: units }, { data: contracts }] = await Promise.all([
    supabase
      .from("properties")
      .select("id, name, type, city")
      .eq("owner_id", ownerId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false }),
    supabase
      .from("units")
      .select("id, property_id, status")
      .eq("owner_id", ownerId)
      .is("deleted_at", null),
    supabase
      .from("contracts")
      .select("unit_id, status")
      .eq("owner_id", ownerId)
      .is("deleted_at", null)
      .in("status", ["active", "expiring_soon"]),
  ]);

  const unitPropertyMap = new Map((units ?? []).map((u) => [u.id, u.property_id]));
  const activeContractsByProperty = new Map<string, number>();
  for (const contract of contracts ?? []) {
    const propertyId = unitPropertyMap.get(contract.unit_id);
    if (!propertyId) continue;
    activeContractsByProperty.set(propertyId, (activeContractsByProperty.get(propertyId) ?? 0) + 1);
  }

  return (properties ?? []).map((property) => {
    const propertyUnits = (units ?? []).filter((u) => u.property_id === property.id);
    return {
      id: property.id,
      name: property.name,
      type: property.type,
      city: property.city,
      units: {
        total: propertyUnits.length,
        ...tally(propertyUnits.map((u) => u.status), UNIT_STATUSES),
      },
      active_contracts_count: activeContractsByProperty.get(property.id) ?? 0,
    };
  });
}

export async function buildContractsReport(supabase: SupabaseCtx, ownerId: string) {
  const { data: contracts } = await supabase
    .from("contracts")
    .select("id, contract_number, unit_id, tenant_id, start_date, end_date, rent_amount, status")
    .eq("owner_id", ownerId)
    .is("deleted_at", null);

  const rows = contracts ?? [];
  const today = new Date().toISOString().slice(0, 10);
  const in14Days = addDays(today, 14);

  const expiringSoon = rows
    .filter((c) => c.status === "active" && c.end_date >= today && c.end_date <= in14Days)
    .sort((a, b) => a.end_date.localeCompare(b.end_date));

  return {
    total: rows.length,
    by_status: tally(
      rows.map((c) => c.status),
      CONTRACT_STATUSES,
    ),
    expiring_within_14_days: expiringSoon,
  };
}

export async function buildPaymentsReport(supabase: SupabaseCtx, ownerId: string, range: DateRange) {
  const { data: payments } = await supabase
    .from("payments")
    .select("amount, status, payment_method")
    .eq("owner_id", ownerId)
    .gte("due_date", range.startDate)
    .lte("due_date", range.endDate);

  const rows = payments ?? [];
  const paid = rows.filter((p) => p.status === "paid");
  const pending = rows.filter((p) => p.status === "due");
  const overdue = rows.filter((p) => p.status === "overdue");

  const byMethod: Record<string, { count: number; amount: number }> = {};
  for (const payment of paid) {
    const key = payment.payment_method ?? "unspecified";
    byMethod[key] ??= { count: 0, amount: 0 };
    byMethod[key].count += 1;
    byMethod[key].amount += payment.amount;
  }

  return {
    period: range,
    total_count: rows.length,
    paid: { count: paid.length, amount: sumAmounts(paid) },
    pending: { count: pending.length, amount: sumAmounts(pending) },
    overdue: { count: overdue.length, amount: sumAmounts(overdue) },
    by_payment_method: byMethod,
  };
}

export async function buildMaintenanceReport(
  supabase: SupabaseCtx,
  ownerId: string,
  range: DateRange,
) {
  const { data: requests } = await supabase
    .from("maintenance_requests")
    .select("status, priority, cost, created_at")
    .eq("owner_id", ownerId)
    .gte("created_at", `${range.startDate}T00:00:00Z`)
    .lte("created_at", `${range.endDate}T23:59:59Z`);

  const rows = requests ?? [];

  return {
    period: range,
    total: rows.length,
    by_status: tally(
      rows.map((r) => r.status),
      MAINTENANCE_STATUSES,
    ),
    by_priority: tally(
      rows.map((r) => r.priority),
      MAINTENANCE_PRIORITIES,
    ),
    total_cost: rows.reduce((total, r) => total + (r.cost ?? 0), 0),
  };
}
