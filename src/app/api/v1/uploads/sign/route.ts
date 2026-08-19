import { NextRequest } from "next/server";
import { requireOwnerOpenApi } from "@/lib/api/auth";
import { openApiError, openApiSuccess } from "@/lib/api/openapi-response";
import { uploadSignSchema } from "@/validations/uploadSign.schema";
import { createSignedUpload, type UploadBucket } from "@/lib/api/upload";

/**
 * POST /uploads/sign - Backend addition, NOT in openapi.yaml.
 *
 * Vercel functions cap request bodies at ~4.5MB, so files can't reliably be
 * embedded in the multipart POSTs the spec defines (photos, personal_photo,
 * id_photo, images, receipt). This endpoint hands the client a Supabase
 * signed-upload URL: the client PUTs the file bytes straight to Supabase
 * Storage (bypassing our server entirely), then sends the returned
 * `public_url` as a plain string in the same form field the spec already
 * defines as `format: binary` — the create endpoints accept either shape.
 *
 * Requires coordination with the mobile client: it must call this first,
 * upload directly to `signed_url`, then submit `public_url` instead of the
 * raw file.
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireOwnerOpenApi(request);
    if (!auth.ok) return auth.response;

    const { supabase, ownerId } = auth.ctx;

    const body = await request.json().catch(() => null);
    const parsed = uploadSignSchema.safeParse(body);
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "بيانات الطلب غير صالحة";
      return openApiError(message, 422);
    }

    const { bucket, content_type } = parsed.data;

    const signed = await createSignedUpload(
      supabase,
      bucket as UploadBucket,
      ownerId,
      content_type,
    );

    if (!("public_url" in signed)) {
      return openApiError(signed.error, 422);
    }

    return openApiSuccess({
      bucket,
      path: signed.path,
      token: signed.token,
      signed_url: signed.signed_url,
      public_url: signed.public_url,
    });
  } catch (err) {
    console.error("[POST uploads/sign]", err);
    return openApiError("خطأ في الخادم", 500);
  }
}
