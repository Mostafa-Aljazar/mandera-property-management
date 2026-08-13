import "server-only";
import { requireOwner } from "@/lib/api/auth";
import { apiError, apiSuccess } from "@/lib/api/response";
import { createUnitSchema } from "@/validations/createUnit.schema";

export async function GET(request: Request) {
  const auth = await requireOwner(request);
  if (!auth.ok) return auth.response;
  const { supabase, ownerId } = auth.ctx;

  const propertyId = new URL(request.url).searchParams.get("property_id");

  let query = supabase
    .from("units")
    .select("*")
    .eq("owner_id", ownerId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (propertyId) query = query.eq("property_id", propertyId);

  const { data, error } = await query;

  if (error) return apiError("server_error", error.message, 500);

  return apiSuccess(data);
}

export async function POST(request: Request) {
  const auth = await requireOwner(request);
  if (!auth.ok) return auth.response;
  const { supabase, ownerId } = auth.ctx;

  const body = await request.json().catch(() => null);
  const parsed = createUnitSchema.safeParse(body);

  if (!parsed.success) {
    return apiError(
      "validation_error",
      parsed.error.issues[0]?.message ?? "البيانات غير صالحة",
      422,
    );
  }

  const { property_id, unit_number, floor, unit_type, area, bedrooms, bathrooms, rent_amount } =
    parsed.data;

  const { data: property } = await supabase
    .from("properties")
    .select("id")
    .eq("id", property_id)
    .eq("owner_id", ownerId)
    .is("deleted_at", null)
    .maybeSingle();

  if (!property) {
    return apiError("not_found", "العقار المحدد غير موجود", 404);
  }

  const { data, error } = await supabase
    .from("units")
    .insert({
      owner_id: ownerId,
      property_id,
      unit_number,
      floor: floor || null,
      unit_type,
      area: area ?? null,
      bedrooms: bedrooms ?? null,
      bathrooms: bathrooms ?? null,
      rent_amount,
    })
    .select("*")
    .single();

  if (error) {
    if (error.code === "23505") {
      return apiError("duplicate_unit_number", "رقم الوحدة مستخدم مسبقاً بهاد العقار", 409);
    }
    return apiError("server_error", error.message, 500);
  }

  return apiSuccess(data, 201);
}
