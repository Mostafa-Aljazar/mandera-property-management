import "server-only";
import type { AuthedOwnerContext } from "./auth";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

type UploadResult = { url: string; error?: undefined } | { url?: undefined; error: string };

/**
 * Uploads an image to a public bucket at `{ownerId}/...path` (RLS restricts
 * writes to that folder) and returns a cache-busted public URL.
 */
export async function uploadOwnerImage(
  supabase: AuthedOwnerContext["supabase"],
  bucket: string,
  path: string,
  file: File,
): Promise<UploadResult> {
  if (!(ALLOWED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
    return { error: "الصورة لازم تكون JPG أو PNG أو WEBP" };
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return { error: "حجم الصورة أكبر من 5 ميجا" };
  }

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: true, contentType: file.type });

  if (error) return { error: error.message };

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(path);

  return { url: `${publicUrl}?v=${Date.now()}` };
}

export function extensionFromMime(mime: string): string {
  const ext = mime.split("/")[1];
  return ext && /^[a-z0-9]+$/i.test(ext) ? ext : "jpg";
}
