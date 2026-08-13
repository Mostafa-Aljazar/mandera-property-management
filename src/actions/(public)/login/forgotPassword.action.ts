"use server";

import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { forgotPasswordSchema } from "@/validations/forgotPassword.schema";

export type ForgotPasswordState = {
  error: string | null;
  success: boolean;
};

function siteOrigin(headerStore: Headers) {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (configured) return configured;

  const host =
    headerStore.get("x-forwarded-host") ?? headerStore.get("host") ?? "localhost:3000";
  const proto = headerStore.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

export async function requestPasswordReset(
  _prevState: ForgotPasswordState,
  formData: FormData,
): Promise<ForgotPasswordState> {
  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "البيانات غير صالحة",
      success: false,
    };
  }

  const email = parsed.data.email.toLowerCase();

  // Always return the same success UX to avoid email enumeration.
  const genericSuccess: ForgotPasswordState = {
    error: null,
    success: true,
  };

  try {
    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("users")
      .select("id, role, is_active")
      .ilike("email", email)
      .eq("role", "master_admin")
      .maybeSingle();

    if (!profile?.is_active) {
      return genericSuccess;
    }

    const origin = siteOrigin(await headers());
    const supabase = await createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/auth/callback?next=/reset-password`,
    });

    if (error) {
      return {
        error: "تعذر إرسال رابط الاستعادة. حاول مرة أخرى.",
        success: false,
      };
    }
  } catch {
    return {
      error: "تعذر إرسال رابط الاستعادة. حاول مرة أخرى.",
      success: false,
    };
  }

  return genericSuccess;
}
