import "server-only";
import { requireOwner } from "@/lib/api/auth";
import { apiError, apiSuccess } from "@/lib/api/response";

type RouteParams = { params: Promise<{ token: string }> };

export async function DELETE(request: Request, { params }: RouteParams) {
  const auth = await requireOwner(request);
  if (!auth.ok) return auth.response;
  const { supabase, ownerId } = auth.ctx;
  const { token } = await params;

  const { data, error } = await supabase
    .from("device_tokens")
    .delete()
    .eq("fcm_token", decodeURIComponent(token))
    .eq("owner_id", ownerId)
    .select("id")
    .maybeSingle();

  if (error) return apiError("server_error", error.message, 500);
  if (!data) return apiError("not_found", "رمز الجهاز غير موجود", 404);

  return apiSuccess({ id: data.id, deleted: true });
}
