import "server-only";
import { requireOwner } from "@/lib/api/auth";
import { apiError, apiSuccess } from "@/lib/api/response";
import { updatePropertySchema } from "@/validations/updateProperty.schema";
import type { TablesUpdate } from "@/lib/supabase/database.types";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: RouteParams) {
  const auth = await requireOwner(request);
  if (!auth.ok) return auth.response;
  const { supabase, ownerId } = auth.ctx;
  const { id } = await params;

  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("id", id)
    .eq("owner_id", ownerId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) return apiError("server_error", error.message, 500);
  if (!data) return apiError("not_found", "العقار غير موجود", 404);

  return apiSuccess(data);
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const auth = await requireOwner(request);
  if (!auth.ok) return auth.response;
  const { supabase, ownerId } = auth.ctx;
  const { id } = await params;

  const body = await request.json().catch(() => null);
  const parsed = updatePropertySchema.safeParse(body);

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

  const { name, type, city, address, latitude, longitude } = parsed.data;
  const patch: TablesUpdate<"properties"> = {};
  if (name !== undefined) patch.name = name;
  if (type !== undefined) patch.type = type;
  if (city !== undefined) patch.city = city || null;
  if (address !== undefined) patch.address = address || null;
  if (latitude !== undefined) patch.latitude = latitude;
  if (longitude !== undefined) patch.longitude = longitude;

  const { data, error } = await supabase
    .from("properties")
    .update(patch)
    .eq("id", id)
    .eq("owner_id", ownerId)
    .is("deleted_at", null)
    .select("*")
    .maybeSingle();

  if (error) return apiError("server_error", error.message, 500);
  if (!data) return apiError("not_found", "العقار غير موجود", 404);

  return apiSuccess(data);
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const auth = await requireOwner(request);
  if (!auth.ok) return auth.response;
  const { supabase, ownerId } = auth.ctx;
  const { id } = await params;

  const { data, error } = await supabase
    .from("properties")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .eq("owner_id", ownerId)
    .is("deleted_at", null)
    .select("id")
    .maybeSingle();

  if (error) return apiError("server_error", error.message, 500);
  if (!data) return apiError("not_found", "العقار غير موجود", 404);

  return apiSuccess({ id: data.id, deleted: true });
}
