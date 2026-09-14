import { NextRequest } from "next/server";
import { createRouteClient } from "@/lib/supabase/route";
import { openApiError, openApiSuccess } from "@/lib/api/openapi-response";
import { openApiLoginSchema } from "@/validations/openapi-login.schema";
import { resolveIdentifierToEmail } from "@/lib/api/resolve-identifier";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = openApiLoginSchema.safeParse(body);

    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "بيانات غير صالحة";
      return openApiError(message, 422);
    }

    const { identifier, password } = parsed.data;

    // Resolve identifier (email or phone) to auth email
    const emailResolved = await resolveIdentifierToEmail(identifier);
    if ("error" in emailResolved) {
      return openApiError(emailResolved.error, 401);
    }

    const email = emailResolved.email;

    // Sign in with Supabase auth
    const supabase = createRouteClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (
      error ||
      !data.session?.access_token ||
      !data.session?.refresh_token ||
      !data.user?.id
    ) {
      return openApiError("بيانات دخول غير صحيحة", 401);
    }

    // Verify the user is an owner (not master_admin or other role)
    const { data: userProfile } = await supabase
      .from("users")
      .select("role")
      .eq("id", data.user.id)
      .single();

    if (userProfile?.role !== "owner") {
      return openApiError("صلاحيات غير كافية", 403);
    }

    return openApiSuccess({
      user_id: data.user.id,
      token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_in: data.session.expires_in,
    });
  } catch (err) {
    console.error("[login]", err);
    return openApiError("خطأ في الخادم", 500);
  }
}
