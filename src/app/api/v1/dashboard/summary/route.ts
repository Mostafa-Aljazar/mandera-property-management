import { NextRequest } from "next/server";
import { requireOwnerOpenApi } from "@/lib/api/auth";
import { openApiError, openApiSuccess } from "@/lib/api/openapi-response";
import { arabicMonthLabel } from "@/lib/api/date-labels";

function monthKey(date: string): string {
  return date.slice(0, 7); // YYYY-MM
}

/**
 * GET /dashboard/summary - Return DashboardSummary (alerts, stats, financial, revenue_points)
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireOwnerOpenApi(request);
    if (!auth.ok) return auth.response;

    const { supabase, ownerId } = auth.ctx;

    const [
      { count: overduePaymentsCount },
      { count: expiringContractsCount },
      { count: openMaintenanceCount },
      { data: properties },
      { data: units },
      { data: payments },
      { data: expenses },
    ] = await Promise.all([
      supabase
        .from("payments")
        .select("*", { count: "exact", head: true })
        .eq("owner_id", ownerId)
        .eq("status", "overdue"),
      supabase
        .from("contracts")
        .select("*", { count: "exact", head: true })
        .eq("owner_id", ownerId)
        .eq("status", "expiring_soon"),
      supabase
        .from("maintenance_requests")
        .select("*", { count: "exact", head: true })
        .eq("owner_id", ownerId)
        .in("status", ["new_request", "in_progress"]),
      supabase.from("properties").select("id").eq("owner_id", ownerId).is("deleted_at", null),
      supabase
        .from("units")
        .select("id, status")
        .eq("owner_id", ownerId)
        .is("deleted_at", null),
      supabase.from("payments").select("amount, status, paid_date").eq("owner_id", ownerId),
      supabase.from("expenses").select("amount, expense_date").eq("owner_id", ownerId),
    ]);

    const unitsCount = units?.length || 0;
    const vacantCount = (units || []).filter((u) => u.status === "available").length;
    const rentedCount = (units || []).filter((u) => u.status === "rented").length;

    const now = new Date();
    const currentMonth = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
    const lastMonthDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
    const lastMonth = `${lastMonthDate.getUTCFullYear()}-${String(lastMonthDate.getUTCMonth() + 1).padStart(2, "0")}`;

    const collected = (payments || [])
      .filter((p) => p.status === "paid" && p.paid_date && monthKey(p.paid_date) === currentMonth)
      .reduce((sum, p) => sum + p.amount, 0);
    const lastMonthCollected = (payments || [])
      .filter((p) => p.status === "paid" && p.paid_date && monthKey(p.paid_date) === lastMonth)
      .reduce((sum, p) => sum + p.amount, 0);
    const revenueDue = (payments || [])
      .filter((p) => p.status === "due")
      .reduce((sum, p) => sum + p.amount, 0);
    const overdue = (payments || [])
      .filter((p) => p.status === "overdue")
      .reduce((sum, p) => sum + p.amount, 0);
    const monthExpenses = (expenses || [])
      .filter((e) => monthKey(e.expense_date) === currentMonth)
      .reduce((sum, e) => sum + e.amount, 0);

    const netIncome = collected - monthExpenses;
    const netIncomeGrowthPercent =
      lastMonthCollected > 0 ? ((collected - lastMonthCollected) / lastMonthCollected) * 100 : 0;

    const revenuePoints = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
      const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
      const value = (payments || [])
        .filter((p) => p.status === "paid" && p.paid_date && monthKey(p.paid_date) === key)
        .reduce((sum, p) => sum + p.amount, 0);
      revenuePoints.push({ label: arabicMonthLabel(`${key}-01`), value });
    }

    return openApiSuccess({
      alerts: [
        { type: "overdue_payments", count: overduePaymentsCount || 0 },
        { type: "expiring_contracts", count: expiringContractsCount || 0 },
        { type: "open_maintenance", count: openMaintenanceCount || 0 },
      ],
      stats: {
        units_count: unitsCount,
        properties_count: properties?.length || 0,
        vacant_count: vacantCount,
        rented_count: rentedCount,
      },
      financial: {
        net_income: netIncome,
        net_income_growth_percent: netIncomeGrowthPercent,
        collected,
        revenue_due: revenueDue,
        expenses: monthExpenses,
        overdue,
      },
      revenue_points: revenuePoints,
    });
  } catch (err) {
    console.error("[GET dashboard]", err);
    return openApiError("خطأ في الخادم", 500);
  }
}
