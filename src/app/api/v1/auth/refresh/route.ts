import { NextRequest } from "next/server";
import { createRouteClient } from "@/lib/supabase/route";
import { openApiError, openApiSuccess } from "@/lib/api/openapi-response";
import { openApiRefreshSchema } from "@/validations/openapi-refresh.schema";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = openApiRefreshSchema.safeParse(body);

    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "بيانات غير صالحة";
      return openApiError(message, 422);
    }

    const { refresh_token } = parsed.data;

    const supabase = createRouteClient();
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token,
    });

    if (
      error ||
      !data.session?.access_token ||
      !data.session?.refresh_token ||
      !data.user?.id
    ) {
      return openApiError("رمز التحديث غير صالح أو منتهي", 401);
    }

    return openApiSuccess({
      user_id: data.user.id,
      token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_in: data.session.expires_in,
    });
  } catch (err) {
    console.error("[refresh]", err);
    return openApiError("خطأ في الخادم", 500);
  }
}
