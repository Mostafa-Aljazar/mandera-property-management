import "server-only";
import { requireOwner } from "@/lib/api/auth";
import { apiError, apiSuccess } from "@/lib/api/response";
import { updateUnitStatusSchema } from "@/validations/updateUnitStatus.schema";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: RouteParams) {
  const auth = await requireOwner(request);
  if (!auth.ok) return auth.response;
  const { supabase, ownerId } = auth.ctx;
  const { id } = await params;

  const body = await request.json().catch(() => null);
  const parsed = updateUnitStatusSchema.safeParse(body);

  if (!parsed.success) {
    return apiError(
      "validation_error",
      parsed.error.issues[0]?.message ?? "الحالة غير صالحة",
      422,
    );
  }

  const { data, error } = await supabase
    .from("units")
    .update({ status: parsed.data.status })
    .eq("id", id)
    .eq("owner_id", ownerId)
    .is("deleted_at", null)
    .select("*")
    .maybeSingle();

  if (error) return apiError("server_error", error.message, 500);
  if (!data) return apiError("not_found", "الوحدة غير موجودة", 404);

  return apiSuccess(data);
}
