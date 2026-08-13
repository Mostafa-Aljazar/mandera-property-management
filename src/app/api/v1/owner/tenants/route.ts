import "server-only";
import { requireOwner } from "@/lib/api/auth";
import { apiError, apiSuccess } from "@/lib/api/response";
import { createTenantSchema } from "@/validations/createTenant.schema";

export async function GET(request: Request) {
  const auth = await requireOwner(request);
  if (!auth.ok) return auth.response;
  const { supabase, ownerId } = auth.ctx;

  const { data, error } = await supabase
    .from("tenants")
    .select("*")
    .eq("owner_id", ownerId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) return apiError("server_error", error.message, 500);

  return apiSuccess(data);
}

export async function POST(request: Request) {
  const auth = await requireOwner(request);
  if (!auth.ok) return auth.response;
  const { supabase, ownerId } = auth.ctx;

  const body = await request.json().catch(() => null);
  const parsed = createTenantSchema.safeParse(body);

  if (!parsed.success) {
    return apiError(
      "validation_error",
      parsed.error.issues[0]?.message ?? "البيانات غير صالحة",
      422,
    );
  }

  const { full_name, national_id, phone, email } = parsed.data;

  const { data, error } = await supabase
    .from("tenants")
    .insert({
      owner_id: ownerId,
      full_name,
      national_id: national_id || null,
      phone: phone || null,
      email: email || null,
    })
    .select("*")
    .single();

  if (error) return apiError("server_error", error.message, 500);

  return apiSuccess(data, 201);
}
