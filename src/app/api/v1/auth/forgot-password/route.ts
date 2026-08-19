import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { openApiError, openApiSuccess } from "@/lib/api/openapi-response";
import { openApiForgotPasswordSchema } from "@/validations/openapi-forgot-password.schema";
import { resolveIdentifierToEmail } from "@/lib/api/resolve-identifier";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = openApiForgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "بيانات غير صالحة";
      return openApiError(message, 422);
    }

    const { identifier } = parsed.data;

    // Resolve identifier (email or phone) to auth email
    const emailResolved = await resolveIdentifierToEmail(identifier);
    if ("error" in emailResolved) {
      // Return success anyway to avoid leaking info about existing accounts
      return openApiSuccess({
        message: "إذا كان هذا الحساب موجوداً، ستتلقى رابط إعادة تعيين",
      });
    }

    const email = emailResolved.email;

    // Request password reset via Supabase
    const admin = createAdminClient();
    const { error } = await admin.auth.resetPasswordForEmail(email, {
      redirectTo: `${new URL(request.url).origin}/auth/reset-password`,
    });

    if (error) {
      console.error("[forgot-password]", error);
      // Return success anyway to avoid leaking info
      return openApiSuccess({
        message: "إذا كان هذا الحساب موجوداً، ستتلقى رابط إعادة تعيين",
      });
    }

    return openApiSuccess({
      message: "إذا كان هذا الحساب موجوداً، ستتلقى رابط إعادة تعيين",
    });
  } catch (err) {
    console.error("[forgot-password]", err);
    return openApiError("خطأ في الخادم", 500);
  }
}
