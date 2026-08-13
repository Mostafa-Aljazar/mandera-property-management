import "server-only";
import { createRouteClient } from "@/lib/supabase/route";
import { apiError, apiSuccess } from "@/lib/api/response";
import { ownerLoginSchema } from "@/validations/ownerLogin.schema";
import type { IOwnerProfile, IOwnerSession } from "@/types/owner.type";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = ownerLoginSchema.safeParse(body);

  if (!parsed.success) {
    return apiError(
      "validation_error",
      parsed.error.issues[0]?.message ?? "البيانات غير صالحة",
      422,
    );
  }

  const anon = createRouteClient();
  const { data, error } = await anon.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error || !data.session || !data.user) {
    return apiError("invalid_credentials", "الإيميل أو كلمة المرور غير صحيحة", 401);
  }

  const scoped = createRouteClient(data.session.access_token);
  const { data: profile, error: profileError } = await scoped
    .from("users")
    .select(
      "id, role, full_name, email, phone, avatar_url, is_active, account_status, national_id, valid_until, company_name, city, created_at, deleted_at",
    )
    .eq("id", data.user.id)
    .single();

  if (profileError || !profile) {
    return apiError("unauthorized", "تعذر العثور على الحساب", 401);
  }

  if (profile.role !== "owner") {
    return apiError(
      "forbidden",
      "هذا الحساب غير مصرح له بالدخول عبر تطبيق الملاك",
      403,
    );
  }

  if (profile.deleted_at || !profile.is_active) {
    return apiError("forbidden", "الحساب معطّل أو محذوف", 403);
  }

  const ownerProfile: IOwnerProfile = {
    id: profile.id,
    role: profile.role,
    full_name: profile.full_name,
    email: profile.email,
    phone: profile.phone,
    avatar_url: profile.avatar_url,
    is_active: profile.is_active,
    account_status: profile.account_status,
    national_id: profile.national_id,
    valid_until: profile.valid_until,
    company_name: profile.company_name,
    city: profile.city,
    created_at: profile.created_at,
  };

  const session: IOwnerSession = {
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    expires_at: data.session.expires_at ?? null,
    owner: ownerProfile,
  };

  return apiSuccess(session);
}
