import "server-only";
import { requireOwner } from "@/lib/api/auth";
import { apiError, apiSuccess } from "@/lib/api/response";

export async function GET(request: Request) {
  const auth = await requireOwner(request);
  if (!auth.ok) return auth.response;
  const { supabase, ownerId } = auth.ctx;

  const params = new URL(request.url).searchParams;
  const isRead = params.get("is_read");

  let query = supabase
    .from("notifications")
    .select("*")
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false });

  if (isRead === "true") query = query.eq("is_read", true);
  if (isRead === "false") query = query.eq("is_read", false);

  const { data, error } = await query;

  if (error) return apiError("server_error", error.message, 500);

  return apiSuccess(data);
}
