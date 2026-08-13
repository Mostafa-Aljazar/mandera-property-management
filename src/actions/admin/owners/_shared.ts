import { createAdminClient } from "@/lib/supabase/admin";

export const BAN_FOREVER = "876000h"; // ~100 years
export const MAX_IMAGE = 2 * 1024 * 1024;
export const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export type OwnerActionResult = {
  error: string | null;
  success: boolean;
};

export function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

export function emptyToNull(value: string | undefined) {
  const v = value?.trim();
  return v ? v : null;
}

export function generateTempPassword() {
  const bytes = crypto.getRandomValues(new Uint8Array(9));
  return Buffer.from(bytes).toString("base64url");
}

export async function uploadImage(
  admin: ReturnType<typeof createAdminClient>,
  userId: string,
  file: File,
  kind: "avatar" | "id-document",
) {
  if (!IMAGE_TYPES.has(file.type) || file.size > MAX_IMAGE) {
    return { error: "ملف الصورة غير صالح", url: null as string | null };
  }

  const ext = file.type.split("/")[1] || "jpg";
  const path = `${userId}/${kind}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await admin.storage.from("avatars").upload(path, buffer, {
    upsert: true,
    contentType: file.type,
  });

  if (error) {
    return { error: error.message, url: null as string | null };
  }

  const {
    data: { publicUrl },
  } = admin.storage.from("avatars").getPublicUrl(path);

  return { error: null, url: `${publicUrl}?v=${Date.now()}` };
}
