import { NextRequest } from "next/server";
import { requireOwnerOpenApi } from "@/lib/api/auth";
import { openApiError, openApiSuccess } from "@/lib/api/openapi-response";

/**
 * GET /user/profile - Return the authenticated owner's profile
 * Response schema: UserProfile (full_name, job_title, phone, email, avatar_url)
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireOwnerOpenApi(request);
    if (!auth.ok) return auth.response;

    const { supabase, ownerId } = auth.ctx;

    const { data: profile, error } = await supabase
      .from("users")
      .select("id, full_name, job_title, phone, email, avatar_url")
      .eq("id", ownerId)
      .single();

    if (error || !profile) {
      return openApiError("الملف الشخصي غير موجود", 404);
    }

    return openApiSuccess({
      full_name: profile.full_name || "",
      job_title: profile.job_title || "",
      phone: profile.phone || "",
      email: profile.email || "",
      avatar_url: profile.avatar_url || "",
    });
  } catch (err) {
    console.error("[GET /user/profile]", err);
    return openApiError("خطأ في الخادم", 500);
  }
}
