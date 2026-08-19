import "server-only";
import { requireOwner } from "@/lib/api/auth";
import { apiError, apiSuccess } from "@/lib/api/response";

export async function PATCH(request: Request) {
  const auth = await requireOwner(request);
  if (!auth.ok) return auth.response;
  const { supabase, ownerId } = auth.ctx;

  const { data, error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("owner_id", ownerId)
    .eq("is_read", false)
    .select("id");

  if (error) return apiError("server_error", error.message, 500);

  return apiSuccess({ updated: data.length });
}
