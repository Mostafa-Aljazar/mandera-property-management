import "server-only";
import { requireOwner } from "@/lib/api/auth";
import { apiError, apiSuccess } from "@/lib/api/response";
import { extensionFromMime, uploadOwnerImage } from "@/lib/api/upload";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: RouteParams) {
  const auth = await requireOwner(request);
  if (!auth.ok) return auth.response;
  const { supabase, ownerId } = auth.ctx;
  const { id } = await params;

  const { data: property } = await supabase
    .from("properties")
    .select("id")
    .eq("id", id)
    .eq("owner_id", ownerId)
    .is("deleted_at", null)
    .maybeSingle();

  if (!property) return apiError("not_found", "العقار غير موجود", 404);

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return apiError("validation_error", "الملف مطلوب (file)", 422);
  }

  const path = `${ownerId}/${id}.${extensionFromMime(file.type)}`;
  const uploaded = await uploadOwnerImage(supabase, "property-images", path, file);

  if (uploaded.error) {
    return apiError("upload_error", uploaded.error, 422);
  }

  const { data, error } = await supabase
    .from("properties")
    .update({ image_url: uploaded.url })
    .eq("id", id)
    .eq("owner_id", ownerId)
    .select("*")
    .single();

  if (error) return apiError("server_error", error.message, 500);

  return apiSuccess(data);
}
