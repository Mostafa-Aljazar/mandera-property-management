import { NextRequest } from "next/server";
import { requireOwnerOpenApi } from "@/lib/api/auth";
import { openApiError, openApiSuccess } from "@/lib/api/openapi-response";
import { createContractSchema, contractPaymentSchema } from "@/validations/createContract.schema";
import { arabicDateLabel, arabicMonthYearLabel } from "@/lib/api/date-labels";
import { unitTypeLabel } from "@/lib/api/labels";

const CONTRACT_LIST_STATUSES = ["active", "expiring_soon", "expired"] as const;

function installmentStatus(status: string, dueDate: string): "paid" | "pending" | "upcoming" {
  if (status === "paid") return "paid";
  if (status === "overdue") return "pending";
  // status === "due"
  const today = new Date().toISOString().split("T")[0];
  return dueDate <= today ? "pending" : "upcoming";
}

/**
 * GET /contracts - Return flat Contract[] with installments[] from payments
 * POST /contracts - Create with client-supplied payment schedule (JSON string)
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireOwnerOpenApi(request);
    if (!auth.ok) return auth.response;

    const { supabase, ownerId } = auth.ctx;

    const { data: contracts, error } = await supabase
      .from("contracts")
      .select(
        `id, start_date, end_date, rent_amount, deposit_amount, status, contract_file_url,
         units(unit_number, unit_type, properties(name)),
         tenants(full_name),
         payments(amount, status, due_date)`,
      )
      .eq("owner_id", ownerId)
      .is("deleted_at", null)
      .in("status", CONTRACT_LIST_STATUSES)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[GET contracts]", error);
      return openApiError("فشل جلب العقود", 500);
    }

    const contractsList = (contracts || []).map((c: any) => {
      const unit = c.units;
      const installments = (c.payments || [])
        .slice()
        .sort((a: any, b: any) => (a.due_date > b.due_date ? 1 : -1))
        .map((p: any) => ({
          month_label: arabicMonthYearLabel(p.due_date),
          due_date_label: arabicDateLabel(p.due_date),
          amount: p.amount,
          status: installmentStatus(p.status, p.due_date),
        }));

      return {
        id: c.id,
        status: c.status,
        property_name: unit?.properties?.name || "",
        tenant_name: c.tenants?.full_name || "",
        rent_value: c.rent_amount,
        unit_label: unit ? unitTypeLabel(unit.unit_type, unit.unit_number) : "",
        start_date_label: arabicDateLabel(c.start_date),
        end_date_label: arabicDateLabel(c.end_date),
        deposit_amount: c.deposit_amount || 0,
        document_file_name: c.contract_file_url
          ? decodeURIComponent(c.contract_file_url.split("/").pop() || "")
          : null,
        document_size_label: null,
        installments,
      };
    });

    return openApiSuccess(contractsList);
  } catch (err) {
    console.error("[GET contracts]", err);
    return openApiError("خطأ في الخادم", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireOwnerOpenApi(request);
    if (!auth.ok) return auth.response;

    const { supabase, ownerId } = auth.ctx;

    const formData = await request.formData();
    const parsed = createContractSchema.safeParse({
      tenant_id: formData.get("tenant_id"),
      property_id: formData.get("property_id"),
      unit_id: formData.get("unit_id"),
      start_date: formData.get("start_date"),
      end_date: formData.get("end_date"),
      total_rent_value: formData.get("total_rent_value"),
      deposit_amount: formData.get("deposit_amount"),
      notes: formData.get("notes"),
    });

    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "بيانات العقد غير صالحة";
      return openApiError(message, 422);
    }

    const data = parsed.data;

    const paymentsJson = formData.get("payments") as string | null;
    let paymentsInput: Array<{ amount: number; date: string }> = [];
    if (paymentsJson) {
      try {
        const raw = JSON.parse(paymentsJson);
        if (!Array.isArray(raw)) throw new Error("not an array");
        paymentsInput = raw.map((p: any) => contractPaymentSchema.parse(p));
      } catch {
        return openApiError("صيغة جدول الدفعات غير صالحة", 422);
      }
    }

    const { data: tenant } = await supabase
      .from("tenants")
      .select("id, full_name")
      .eq("id", data.tenant_id)
      .eq("owner_id", ownerId)
      .maybeSingle();
    if (!tenant) return openApiError("المستأجر غير موجود", 404);

    const { data: property } = await supabase
      .from("properties")
      .select("id, name")
      .eq("id", data.property_id)
      .eq("owner_id", ownerId)
      .maybeSingle();
    if (!property) return openApiError("العقار غير موجود", 404);

    const { data: unit } = await supabase
      .from("units")
      .select("id, status, unit_number, unit_type, property_id")
      .eq("id", data.unit_id)
      .eq("owner_id", ownerId)
      .eq("property_id", data.property_id)
      .maybeSingle();
    if (!unit) return openApiError("الوحدة غير موجودة ضمن هذا العقار", 404);
    if (unit.status !== "available") return openApiError("الوحدة غير متاحة", 409);

    const { data: contract, error: contractError } = await supabase
      .from("contracts")
      .insert({
        owner_id: ownerId,
        tenant_id: data.tenant_id,
        unit_id: data.unit_id,
        start_date: data.start_date,
        end_date: data.end_date,
        rent_amount: data.total_rent_value,
        deposit_amount: data.deposit_amount,
        payment_cycle: "monthly",
      })
      .select("*")
      .single();

    if (contractError) {
      console.error("[POST contracts insert]", contractError);
      return openApiError("فشل إنشاء العقد", 500);
    }

    const paymentRows = paymentsInput.map((p) => ({
      owner_id: ownerId,
      contract_id: contract.id,
      tenant_id: data.tenant_id,
      unit_id: data.unit_id,
      amount: p.amount,
      due_date: p.date.split("T")[0],
      status: "due" as const,
    }));

    if (paymentRows.length > 0) {
      const { error: paymentsError } = await supabase.from("payments").insert(paymentRows);
      if (paymentsError) {
        await supabase.from("contracts").delete().eq("id", contract.id);
        console.error("[POST contracts payments]", paymentsError);
        return openApiError("فشل إنشاء جدول الدفعات", 500);
      }
    }

    await supabase.from("units").update({ status: "rented" }).eq("id", data.unit_id);

    const installments = paymentRows
      .slice()
      .sort((a, b) => (a.due_date > b.due_date ? 1 : -1))
      .map((p) => ({
        month_label: arabicMonthYearLabel(p.due_date),
        due_date_label: arabicDateLabel(p.due_date),
        amount: p.amount,
        status: installmentStatus("due", p.due_date),
      }));

    return openApiSuccess(
      {
        id: contract.id,
        status: contract.status,
        property_name: property.name,
        tenant_name: tenant.full_name,
        rent_value: contract.rent_amount,
        unit_label: unitTypeLabel(unit.unit_type, unit.unit_number),
        start_date_label: arabicDateLabel(contract.start_date),
        end_date_label: arabicDateLabel(contract.end_date),
        deposit_amount: contract.deposit_amount || 0,
        document_file_name: null,
        document_size_label: null,
        installments,
      },
      201,
    );
  } catch (err) {
    console.error("[POST contracts]", err);
    return openApiError("خطأ في الخادم", 500);
  }
}
