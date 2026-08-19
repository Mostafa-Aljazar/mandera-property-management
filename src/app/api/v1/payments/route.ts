import { NextRequest } from "next/server";
import { requireOwnerOpenApi } from "@/lib/api/auth";
import { openApiError, openApiSuccess } from "@/lib/api/openapi-response";
import { createPaymentSchema } from "@/validations/createPayment.schema";
import { resolveUploadedField } from "@/lib/api/upload";
import { slashDateLabel } from "@/lib/api/date-labels";
import { propertyUnitLabel } from "@/lib/api/labels";

/**
 * GET /payments - Return PaymentsSummary with stats
 * POST /payments - Register a payment (resolved from tenant_id + property_id)
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireOwnerOpenApi(request);
    if (!auth.ok) return auth.response;

    const { supabase, ownerId } = auth.ctx;

    const { data: payments, error } = await supabase
      .from("payments")
      .select(
        `id, amount, status, due_date, paid_date, payment_method,
         tenants(full_name),
         units(unit_number, properties(name))`,
      )
      .eq("owner_id", ownerId)
      .order("due_date", { ascending: false });

    if (error) {
      console.error("[GET payments]", error);
      return openApiError("فشل جلب الدفعات", 500);
    }

    const paymentsList = (payments || []).map((p: any) => ({
      id: p.id,
      payer_name: p.tenants?.full_name || "",
      property_unit_label: p.units
        ? propertyUnitLabel(p.units.properties?.name || "", p.units.unit_number)
        : "",
      method: p.payment_method || "other",
      amount: p.amount,
      status: p.status,
      date_label: slashDateLabel(p.status === "paid" ? p.paid_date : p.due_date),
    }));

    const totalPaid = (payments || [])
      .filter((p: any) => p.status === "paid")
      .reduce((sum: number, p: any) => sum + p.amount, 0);
    const totalOverdue = (payments || [])
      .filter((p: any) => p.status === "overdue")
      .reduce((sum: number, p: any) => sum + p.amount, 0);
    const totalDue = (payments || [])
      .filter((p: any) => p.status === "due")
      .reduce((sum: number, p: any) => sum + p.amount, 0);

    return openApiSuccess({
      total_paid: totalPaid,
      total_revenue: totalPaid + totalOverdue + totalDue,
      total_overdue: totalOverdue,
      total_due: totalDue,
      payments: paymentsList,
    });
  } catch (err) {
    console.error("[GET payments]", err);
    return openApiError("خطأ في الخادم", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireOwnerOpenApi(request);
    if (!auth.ok) return auth.response;

    const { supabase, ownerId } = auth.ctx;

    const formData = await request.formData();
    const parsed = createPaymentSchema.safeParse({
      tenant_id: formData.get("tenant_id"),
      property_id: formData.get("property_id"),
      unit_label: formData.get("unit_label"),
      amount: formData.get("amount"),
      payment_date: formData.get("payment_date"),
      method: formData.get("method"),
      reference_number: formData.get("reference_number"),
      notes: formData.get("notes"),
    });

    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "بيانات الدفعة غير صالحة";
      return openApiError(message, 422);
    }

    const data = parsed.data;

    const { data: tenant } = await supabase
      .from("tenants")
      .select("id, full_name")
      .eq("id", data.tenant_id)
      .eq("owner_id", ownerId)
      .maybeSingle();
    if (!tenant) return openApiError("المستأجر غير موجود", 404);

    const { data: candidateContracts } = await supabase
      .from("contracts")
      .select("id, unit_id, units(unit_number, property_id, properties(id, name))")
      .eq("tenant_id", data.tenant_id)
      .eq("owner_id", ownerId)
      .in("status", ["active", "expiring_soon"]);

    const contract = (candidateContracts || []).find(
      (c: any) => c.units?.property_id === data.property_id,
    );

    if (!contract) {
      return openApiError("لم يتم العثور على عقد نشط للمستأجر بهذا العقار", 404);
    }

    const receiptResolved = await resolveUploadedField(
      supabase,
      "payment-receipts",
      ownerId,
      `${ownerId}/${Date.now()}-${Math.random()}`,
      formData.get("receipt"),
    );
    if ("error" in receiptResolved) {
      return openApiError(`فشل رفع الإيصال: ${receiptResolved.error}`, 422);
    }
    const receiptUrl = receiptResolved.url;

    const paymentDate = data.payment_date.split("T")[0];
    const notes = data.reference_number
      ? `مرجع: ${data.reference_number}${data.notes ? ` - ${data.notes}` : ""}`
      : data.notes || null;

    const { data: payment, error: insertError } = await supabase
      .from("payments")
      .insert({
        owner_id: ownerId,
        contract_id: contract.id,
        tenant_id: data.tenant_id,
        unit_id: contract.unit_id,
        amount: data.amount,
        payment_method: data.method,
        due_date: paymentDate,
        paid_date: paymentDate,
        status: "paid",
        notes,
        receipt_url: receiptUrl,
      })
      .select("*")
      .single();

    if (insertError) {
      console.error("[POST payments insert]", insertError);
      return openApiError("فشل تسجيل الدفعة", 500);
    }

    const unit = (contract as any).units;

    return openApiSuccess(
      {
        id: payment.id,
        payer_name: tenant.full_name,
        property_unit_label: unit
          ? propertyUnitLabel(unit.properties?.name || "", unit.unit_number)
          : data.unit_label,
        method: payment.payment_method,
        amount: payment.amount,
        status: payment.status,
        date_label: slashDateLabel(payment.paid_date),
      },
      201,
    );
  } catch (err) {
    console.error("[POST payments]", err);
    return openApiError("خطأ في الخادم", 500);
  }
}
