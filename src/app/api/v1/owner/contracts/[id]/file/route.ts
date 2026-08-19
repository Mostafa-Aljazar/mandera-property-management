import "server-only";
import { requireOwner } from "@/lib/api/auth";
import { apiError, apiSuccess } from "@/lib/api/response";
import { extensionFromMime, uploadOwnerDocument } from "@/lib/api/upload";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: RouteParams) {
  const auth = await requireOwner(request);
  if (!auth.ok) return auth.response;
  const { supabase, ownerId } = auth.ctx;
  const { id } = await params;

  const { data, error } = await supabase
    .from("contracts")
    .select("contract_file_url")
    .eq("id", id)
    .eq("owner_id", ownerId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) return apiError("server_error", error.message, 500);
  if (!data) return apiError("not_found", "العقد غير موجود", 404);

  return apiSuccess(data);
}

export async function POST(request: Request, { params }: RouteParams) {
  const auth = await requireOwner(request);
  if (!auth.ok) return auth.response;
  const { supabase, ownerId } = auth.ctx;
  const { id } = await params;

  const { data: contract } = await supabase
    .from("contracts")
    .select("id")
    .eq("id", id)
    .eq("owner_id", ownerId)
    .is("deleted_at", null)
    .maybeSingle();

  if (!contract) return apiError("not_found", "العقد غير موجود", 404);

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return apiError("validation_error", "الملف مطلوب (file)", 422);
  }

  const path = `${ownerId}/${id}.${extensionFromMime(file.type)}`;
  const uploaded = await uploadOwnerDocument(supabase, "contract-files", path, file);

  if (uploaded.error) {
    return apiError("upload_error", uploaded.error, 422);
  }

  const { data, error } = await supabase
    .from("contracts")
    .update({ contract_file_url: uploaded.url })
    .eq("id", id)
    .eq("owner_id", ownerId)
    .select("*")
    .single();

  if (error) return apiError("server_error", error.message, 500);

  return apiSuccess(data);
}
