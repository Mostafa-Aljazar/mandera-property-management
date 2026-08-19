import "server-only";
import { requireOwner } from "@/lib/api/auth";
import { apiError, apiSuccess } from "@/lib/api/response";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: RouteParams) {
  const auth = await requireOwner(request);
  if (!auth.ok) return auth.response;
  const { supabase, ownerId } = auth.ctx;
  const { id } = await params;

  const { data, error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", id)
    .eq("owner_id", ownerId)
    .select("*")
    .maybeSingle();

  if (error) return apiError("server_error", error.message, 500);
  if (!data) return apiError("not_found", "الإشعار غير موجود", 404);

  return apiSuccess(data);
}
