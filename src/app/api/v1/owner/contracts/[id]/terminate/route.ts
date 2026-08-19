import "server-only";
import { requireOwner } from "@/lib/api/auth";
import { apiError, apiSuccess } from "@/lib/api/response";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: RouteParams) {
  const auth = await requireOwner(request);
  if (!auth.ok) return auth.response;
  const { supabase, ownerId } = auth.ctx;
  const { id } = await params;

  const { data: contract } = await supabase
    .from("contracts")
    .select("id, unit_id, status")
    .eq("id", id)
    .eq("owner_id", ownerId)
    .is("deleted_at", null)
    .maybeSingle();

  if (!contract) return apiError("not_found", "العقد غير موجود", 404);
  if (contract.status !== "active" && contract.status !== "expiring_soon") {
    return apiError("invalid_status", "لا يمكن إنهاء عقد بحالته الحالية", 409);
  }

  const { data, error } = await supabase
    .from("contracts")
    .update({ status: "terminated" })
    .eq("id", id)
    .select("*")
    .single();

  if (error) return apiError("server_error", error.message, 500);

  const today = new Date().toISOString().slice(0, 10);
  await supabase
    .from("payments")
    .delete()
    .eq("contract_id", id)
    .eq("status", "due")
    .gte("due_date", today);

  await supabase.from("units").update({ status: "available" }).eq("id", contract.unit_id);

  return apiSuccess(data);
}
