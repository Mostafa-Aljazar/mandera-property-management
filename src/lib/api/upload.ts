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

const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024;
const ALLOWED_DOCUMENT_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"] as const;

/**
 * Public buckets available for direct-to-Supabase uploads (see /uploads/sign).
 * Mirrors the actual bucket config in Supabase (file_size_limit/allowed_mime_types).
 */
export const UPLOAD_BUCKETS = {
  "property-images": { maxSize: 5 * 1024 * 1024, mimeTypes: ALLOWED_IMAGE_TYPES },
  "unit-images": { maxSize: 5 * 1024 * 1024, mimeTypes: ALLOWED_IMAGE_TYPES },
  "tenant-photos": { maxSize: 5 * 1024 * 1024, mimeTypes: ALLOWED_IMAGE_TYPES },
  "tenant-documents": { maxSize: 5 * 1024 * 1024, mimeTypes: ALLOWED_IMAGE_TYPES },
  "maintenance-images": { maxSize: 5 * 1024 * 1024, mimeTypes: ALLOWED_IMAGE_TYPES },
  "payment-receipts": { maxSize: 10 * 1024 * 1024, mimeTypes: ALLOWED_DOCUMENT_TYPES },
} as const;

export type UploadBucket = keyof typeof UPLOAD_BUCKETS;

export const UPLOAD_BUCKET_NAMES = Object.keys(UPLOAD_BUCKETS) as UploadBucket[];

/**
 * Prepares a direct-to-Supabase upload: the caller (mobile client) PUTs the
 * file straight to `signed_url` — the file bytes never pass through our
 * Vercel function, sidestepping its ~4.5MB request body cap.
 */
export async function createSignedUpload(
  supabase: AuthedOwnerContext["supabase"],
  bucket: UploadBucket,
  ownerId: string,
  contentType: string,
): Promise<
  | { path: string; token: string; signed_url: string; public_url: string; error?: undefined }
  | { error: string }
> {
  const config = UPLOAD_BUCKETS[bucket];
  if (!(config.mimeTypes as readonly string[]).includes(contentType)) {
    return { error: `نوع الملف غير مسموح لهذا النوع من الرفع (${config.mimeTypes.join(", ")})` };
  }

  const ext = extensionFromMime(contentType);
  const path = `${ownerId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { data, error } = await supabase.storage.from(bucket).createSignedUploadUrl(path);
  if (error || !data) {
    return { error: error?.message || "فشل تجهيز رابط الرفع" };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(data.path);

  return { path: data.path, token: data.token, signed_url: data.signedUrl, public_url: publicUrl };
}

function extractStoragePath(bucket: string, raw: string): string {
  const marker = `/object/public/${bucket}/`;
  const idx = raw.indexOf(marker);
  if (idx !== -1) return decodeURIComponent(raw.slice(idx + marker.length).split("?")[0]);
  return raw;
}

/**
 * Resolves a form field that is EITHER a raw `File` (legacy path — we upload
 * it server-side, subject to Vercel's body-size cap) OR a string
 * path/public-URL already uploaded via `/uploads/sign` (the new path —
 * nothing but a short string crosses Vercel). Validates the string belongs
 * to this owner's folder in the given bucket before trusting it.
 */
export async function resolveUploadedField(
  supabase: AuthedOwnerContext["supabase"],
  bucket: UploadBucket,
  ownerId: string,
  fallbackPath: string,
  value: FormDataEntryValue | null,
): Promise<UploadResult | { url: null; error?: undefined }> {
  if (value instanceof File) {
    if (value.size === 0) return { url: null };
    const acceptsDocuments = (UPLOAD_BUCKETS[bucket].mimeTypes as readonly string[]).includes(
      "application/pdf",
    );
    return acceptsDocuments
      ? uploadOwnerDocument(supabase, bucket, fallbackPath, value)
      : uploadOwnerImage(supabase, bucket, fallbackPath, value);
  }

  if (typeof value === "string" && value.trim()) {
    const path = extractStoragePath(bucket, value.trim());
    if (!path.startsWith(`${ownerId}/`)) {
      return { error: "رابط الملف غير صالح أو لا يتبع لهذا الحساب" };
    }
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(path);
    return { url: publicUrl };
  }

  return { url: null };
}

/**
 * Uploads a document (PDF or image) to a public bucket at `{ownerId}/...path`
 * (RLS restricts writes to that folder) and returns a cache-busted public URL.
 */
export async function uploadOwnerDocument(
  supabase: AuthedOwnerContext["supabase"],
  bucket: string,
  path: string,
  file: File,
): Promise<UploadResult> {
  if (!(ALLOWED_DOCUMENT_TYPES as readonly string[]).includes(file.type)) {
    return { error: "الملف لازم يكون PDF أو JPG أو PNG أو WEBP" };
  }
  if (file.size > MAX_DOCUMENT_SIZE) {
    return { error: "حجم الملف أكبر من 10 ميجا" };
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
