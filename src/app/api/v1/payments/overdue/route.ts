import { NextRequest } from "next/server";
import { requireOwnerOpenApi } from "@/lib/api/auth";
import { openApiError, openApiSuccess } from "@/lib/api/openapi-response";
import { arabicDateLabel } from "@/lib/api/date-labels";
import { propertyUnitLabel } from "@/lib/api/labels";

/**
 * GET /payments/overdue - Return OverdueSummary grouped by tenant
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireOwnerOpenApi(request);
    if (!auth.ok) return auth.response;

    const { supabase, ownerId } = auth.ctx;

    const { data: overduePayments, error } = await supabase
      .from("payments")
      .select(
        `id, amount, due_date, tenant_id,
         tenants(id, full_name, phone, photo_url)`,
      )
      .eq("owner_id", ownerId)
      .eq("status", "overdue");

    if (error) {
      console.error("[GET overdue]", error);
      return openApiError("فشل جلب الدفعات المتأخرة", 500);
    }

    const byTenant = new Map<string, { tenant: any; payments: any[] }>();
    for (const p of overduePayments || []) {
      const tenantId = (p as any).tenant_id;
      if (!byTenant.has(tenantId)) {
        byTenant.set(tenantId, { tenant: (p as any).tenants, payments: [] });
      }
      byTenant.get(tenantId)!.payments.push(p);
    }

    const tenantIds = Array.from(byTenant.keys());

    const [contractsResult, paidPaymentsResult] = await Promise.all([
      tenantIds.length > 0
        ? supabase
            .from("contracts")
            .select("tenant_id, units(unit_number, properties(name))")
            .eq("owner_id", ownerId)
            .in("tenant_id", tenantIds)
            .in("status", ["active", "expiring_soon"])
        : Promise.resolve({ data: [] as any[] }),
      tenantIds.length > 0
        ? supabase
            .from("payments")
            .select("tenant_id, paid_date")
            .eq("owner_id", ownerId)
            .eq("status", "paid")
            .in("tenant_id", tenantIds)
            .order("paid_date", { ascending: false })
        : Promise.resolve({ data: [] as any[] }),
    ]);

    const contractByTenant = new Map<string, any>();
    for (const c of contractsResult.data || []) {
      if (!contractByTenant.has(c.tenant_id)) contractByTenant.set(c.tenant_id, c);
    }
    const lastPaidByTenant = new Map<string, string>();
    for (const p of paidPaymentsResult.data || []) {
      if (!lastPaidByTenant.has(p.tenant_id) && p.paid_date) {
        lastPaidByTenant.set(p.tenant_id, p.paid_date);
      }
    }

    const today = Date.now();
    const tenantsList = Array.from(byTenant.entries()).map(([tenantId, { tenant, payments }]) => {
      const amountOverdue = payments.reduce((sum, p) => sum + p.amount, 0);
      const earliestDue = payments.map((p) => p.due_date).sort()[0];
      const daysOverdue = Math.max(
        0,
        Math.floor((today - new Date(earliestDue).getTime()) / (1000 * 60 * 60 * 24)),
      );
      const contract = contractByTenant.get(tenantId);
      const unit = contract?.units;

      return {
        id: tenantId,
        name: tenant?.full_name || "",
        avatar_url: tenant?.photo_url || null,
        property_unit_label: unit
          ? propertyUnitLabel(unit.properties?.name || "", unit.unit_number)
          : "",
        phone: tenant?.phone || "",
        amount_overdue: amountOverdue,
        days_overdue: daysOverdue,
        overdue_since_label: arabicDateLabel(earliestDue),
        last_payment_date_label: arabicDateLabel(lastPaidByTenant.get(tenantId) || null),
      };
    });

    const totalOverdueAmount = tenantsList.reduce((sum, t) => sum + t.amount_overdue, 0);
    const averageDaysOverdue =
      tenantsList.length > 0
        ? Math.round(tenantsList.reduce((sum, t) => sum + t.days_overdue, 0) / tenantsList.length)
        : 0;

    return openApiSuccess({
      total_overdue_amount: totalOverdueAmount,
      growth_percent: 0,
      overdue_tenants_count: tenantsList.length,
      average_days_overdue: averageDaysOverdue,
      tenants: tenantsList,
    });
  } catch (err) {
    console.error("[GET overdue]", err);
    return openApiError("خطأ في الخادم", 500);
  }
}
