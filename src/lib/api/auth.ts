import "server-only";
import { createRouteClient } from "@/lib/supabase/route";
import type { IOwnerProfile } from "@/types/owner.type";
import { apiError } from "./response";

const OWNER_PROFILE_COLUMNS =
  "id, role, full_name, email, phone, avatar_url, is_active, account_status, national_id, valid_until, company_name, city, created_at, deleted_at";

type SupabaseRouteClient = ReturnType<typeof createRouteClient>;

export type AuthedOwnerContext = {
  supabase: SupabaseRouteClient;
  ownerId: string;
  profile: IOwnerProfile;
};

type AuthResult =
  | { ok: true; ctx: AuthedOwnerContext }
  | { ok: false; response: Response };

function extractBearerToken(request: Request): string | null {
  const header = request.headers.get("authorization");
  if (!header?.toLowerCase().startsWith("bearer ")) return null;
  const token = header.slice(7).trim();
  return token.length > 0 ? token : null;
}

/**
 * Validates the `Authorization: Bearer <jwt>` header, confirms the JWT
 * belongs to an active, non-deleted `owner`, and returns a Supabase client
 * scoped to that user's session (RLS-enforced) for the route to use.
 */
export async function requireOwner(request: Request): Promise<AuthResult> {
  const token = extractBearerToken(request);

  if (!token) {
    return {
      ok: false,
      response: apiError("unauthorized", "رمز الدخول مفقود", 401),
    };
  }

  const supabase = createRouteClient(token);
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      ok: false,
      response: apiError("unauthorized", "رمز الدخول غير صالح أو منتهي", 401),
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select(OWNER_PROFILE_COLUMNS)
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return {
      ok: false,
      response: apiError("unauthorized", "تعذر العثور على الحساب", 401),
    };
  }

  if (profile.role !== "owner") {
    return {
      ok: false,
      response: apiError(
        "forbidden",
        "هذا الحساب غير مصرح له بالدخول عبر تطبيق الملاك",
        403,
      ),
    };
  }

  if (profile.deleted_at || !profile.is_active) {
    return {
      ok: false,
      response: apiError("forbidden", "الحساب معطّل أو محذوف", 403),
    };
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

  return {
    ok: true,
    ctx: { supabase, ownerId: user.id, profile: ownerProfile },
  };
}
