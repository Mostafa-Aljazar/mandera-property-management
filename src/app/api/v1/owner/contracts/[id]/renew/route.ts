import "server-only";
import { requireOwner } from "@/lib/api/auth";
import { generatePaymentDueDates } from "@/lib/api/contracts";
import { apiError, apiSuccess } from "@/lib/api/response";
import { renewContractSchema } from "@/validations/renewContract.schema";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: RouteParams) {
  const auth = await requireOwner(request);
  if (!auth.ok) return auth.response;
  const { supabase, ownerId } = auth.ctx;
  const { id } = await params;

  const body = await request.json().catch(() => null);
  const parsed = renewContractSchema.safeParse(body);

  if (!parsed.success) {
    return apiError(
      "validation_error",
      parsed.error.issues[0]?.message ?? "البيانات غير صالحة",
      422,
    );
  }

  const { data: oldContract } = await supabase
    .from("contracts")
    .select("*")
    .eq("id", id)
    .eq("owner_id", ownerId)
    .is("deleted_at", null)
    .maybeSingle();

  if (!oldContract) return apiError("not_found", "العقد غير موجود", 404);
  if (oldContract.status !== "active" && oldContract.status !== "expiring_soon") {
    return apiError("invalid_status", "لا يمكن تجديد عقد بحالته الحالية", 409);
  }

  const {
    start_date,
    end_date,
    rent_amount = oldContract.rent_amount,
    payment_cycle = oldContract.payment_cycle,
    deposit_amount = oldContract.deposit_amount,
  } = parsed.data;

  const { data: newContract, error: insertError } = await supabase
    .from("contracts")
    .insert({
      owner_id: ownerId,
      unit_id: oldContract.unit_id,
      tenant_id: oldContract.tenant_id,
      start_date,
      end_date,
      rent_amount,
      payment_cycle,
      deposit_amount,
      renewed_from_contract_id: oldContract.id,
    })
    .select("*")
    .single();

  if (insertError) return apiError("server_error", insertError.message, 500);

  const paymentRows = generatePaymentDueDates(start_date, end_date, payment_cycle).map(
    (due_date) => ({
      owner_id: ownerId,
      contract_id: newContract.id,
      unit_id: oldContract.unit_id,
      tenant_id: oldContract.tenant_id,
      amount: rent_amount,
      due_date,
    }),
  );

  const { error: paymentsError } = await supabase.from("payments").insert(paymentRows);

  if (paymentsError) {
    await supabase.from("contracts").delete().eq("id", newContract.id);
    return apiError("server_error", paymentsError.message, 500);
  }

  const { error: oldUpdateError } = await supabase
    .from("contracts")
    .update({ status: "renewed" })
    .eq("id", oldContract.id);

  if (oldUpdateError) {
    await supabase.from("payments").delete().eq("contract_id", newContract.id);
    await supabase.from("contracts").delete().eq("id", newContract.id);
    return apiError("server_error", oldUpdateError.message, 500);
  }

  await supabase.from("units").update({ status: "rented" }).eq("id", oldContract.unit_id);

  return apiSuccess(newContract, 201);
}
