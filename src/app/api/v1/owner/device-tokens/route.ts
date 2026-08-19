import "server-only";
import { requireOwner } from "@/lib/api/auth";
import { apiError, apiSuccess } from "@/lib/api/response";
import { registerDeviceTokenSchema } from "@/validations/registerDeviceToken.schema";

export async function POST(request: Request) {
  const auth = await requireOwner(request);
  if (!auth.ok) return auth.response;
  const { supabase, ownerId } = auth.ctx;

  const body = await request.json().catch(() => null);
  const parsed = registerDeviceTokenSchema.safeParse(body);

  if (!parsed.success) {
    return apiError(
      "validation_error",
      parsed.error.issues[0]?.message ?? "البيانات غير صالحة",
      422,
    );
  }

  const { fcm_token, device_type } = parsed.data;

  const { data, error } = await supabase
    .from("device_tokens")
    .upsert(
      { owner_id: ownerId, fcm_token, device_type: device_type ?? null },
      { onConflict: "fcm_token" },
    )
    .select("*")
    .single();

  if (error) {
    if (error.code === "42501") {
      return apiError("token_conflict", "رمز الجهاز مسجّل مسبقاً لحساب آخر", 409);
    }
    return apiError("server_error", error.message, 500);
  }

  return apiSuccess(data, 201);
}
