import "server-only";
import { requireOwner } from "@/lib/api/auth";
import { apiError, apiSuccess } from "@/lib/api/response";
import { updateUnitSchema } from "@/validations/updateUnit.schema";
import type { TablesUpdate } from "@/lib/supabase/database.types";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: RouteParams) {
  const auth = await requireOwner(request);
  if (!auth.ok) return auth.response;
  const { supabase, ownerId } = auth.ctx;
  const { id } = await params;

  const { data, error } = await supabase
    .from("units")
    .select("*")
    .eq("id", id)
    .eq("owner_id", ownerId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) return apiError("server_error", error.message, 500);
  if (!data) return apiError("not_found", "الوحدة غير موجودة", 404);

  return apiSuccess(data);
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const auth = await requireOwner(request);
  if (!auth.ok) return auth.response;
  const { supabase, ownerId } = auth.ctx;
  const { id } = await params;

  const body = await request.json().catch(() => null);
  const parsed = updateUnitSchema.safeParse(body);

  if (!parsed.success) {
    return apiError(
      "validation_error",
      parsed.error.issues[0]?.message ?? "البيانات غير صالحة",
      422,
    );
  }

  if (Object.keys(parsed.data).length === 0) {
    return apiError("validation_error", "ما في أي حقل للتعديل", 422);
  }

  const { unit_number, floor, unit_type, area, bedrooms, bathrooms, rent_amount } = parsed.data;
  const patch: TablesUpdate<"units"> = {};
  if (unit_number !== undefined) patch.unit_number = unit_number;
  if (floor !== undefined) patch.floor = floor || null;
  if (unit_type !== undefined) patch.unit_type = unit_type;
  if (area !== undefined) patch.area = area;
  if (bedrooms !== undefined) patch.bedrooms = bedrooms;
  if (bathrooms !== undefined) patch.bathrooms = bathrooms;
  if (rent_amount !== undefined) patch.rent_amount = rent_amount;

  const { data, error } = await supabase
    .from("units")
    .update(patch)
    .eq("id", id)
    .eq("owner_id", ownerId)
    .is("deleted_at", null)
    .select("*")
    .maybeSingle();

  if (error) {
    if (error.code === "23505") {
      return apiError("duplicate_unit_number", "رقم الوحدة مستخدم مسبقاً بهاد العقار", 409);
    }
    return apiError("server_error", error.message, 500);
  }
  if (!data) return apiError("not_found", "الوحدة غير موجودة", 404);

  return apiSuccess(data);
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const auth = await requireOwner(request);
  if (!auth.ok) return auth.response;
  const { supabase, ownerId } = auth.ctx;
  const { id } = await params;

  const { data, error } = await supabase
    .from("units")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .eq("owner_id", ownerId)
    .is("deleted_at", null)
    .select("id")
    .maybeSingle();

  if (error) return apiError("server_error", error.message, 500);
  if (!data) return apiError("not_found", "الوحدة غير موجودة", 404);

  return apiSuccess({ id: data.id, deleted: true });
}
