import "server-only";
import { createRouteClient } from "@/lib/supabase/route";
import type { IOwnerProfile } from "@/types/owner.type";
import { apiError } from "./response";
import { openApiError } from "./openapi-response";

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

type AuthFailureReason =
  | "missing_token"
  | "invalid_token"
  | "profile_not_found"
  | "not_owner"
  | "inactive";

const AUTH_FAILURE_MESSAGES: Record<AuthFailureReason, { message: string; status: number }> = {
  missing_token: { message: "رمز الدخول مفقود", status: 401 },
  invalid_token: { message: "رمز الدخول غير صالح أو منتهي", status: 401 },
  profile_not_found: { message: "تعذر العثور على الحساب", status: 401 },
  not_owner: { message: "هذا الحساب غير مصرح له بالدخول عبر تطبيق الملاك", status: 403 },
  inactive: { message: "الحساب معطّل أو محذوف", status: 403 },
};

function extractBearerToken(request: Request): string | null {
  const header = request.headers.get("authorization");
  if (!header?.toLowerCase().startsWith("bearer ")) return null;
  const token = header.slice(7).trim();
  return token.length > 0 ? token : null;
}

type InternalAuthResult =
  | { ok: true; ctx: AuthedOwnerContext }
  | { ok: false; reason: AuthFailureReason };

/**
 * Validates the `Authorization: Bearer <jwt>` header, confirms the JWT
 * belongs to an active, non-deleted `owner`, and returns a Supabase client
 * scoped to that user's session (RLS-enforced) for the route to use.
 */
async function authenticateOwner(request: Request): Promise<InternalAuthResult> {
  const token = extractBearerToken(request);
  if (!token) return { ok: false, reason: "missing_token" };

  const supabase = createRouteClient(token);
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) return { ok: false, reason: "invalid_token" };

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select(OWNER_PROFILE_COLUMNS)
    .eq("id", user.id)
    .single();

  if (profileError || !profile) return { ok: false, reason: "profile_not_found" };
  if (profile.role !== "owner") return { ok: false, reason: "not_owner" };
  if (profile.deleted_at || !profile.is_active) return { ok: false, reason: "inactive" };

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

  return { ok: true, ctx: { supabase, ownerId: user.id, profile: ownerProfile } };
}

/**
 * For the legacy `/api/v1/owner/**` routes — error responses use the
 * `{success:false, error:{code,message}}` envelope (`src/lib/api/response.ts`).
 */
export async function requireOwner(request: Request): Promise<AuthResult> {
  const result = await authenticateOwner(request);
  if (result.ok) return result;

  const { message, status } = AUTH_FAILURE_MESSAGES[result.reason];
  const code = status === 403 ? "forbidden" : "unauthorized";
  return { ok: false, response: apiError(code, message, status) };
}

/**
 * For the flat `/api/v1/**` routes matching `docs/openapi.yaml` — error
 * responses use the spec's flat `{message}` shape (`ErrorResponse`), via
 * `src/lib/api/openapi-response.ts`. `requireOwner()` returns the legacy
 * `{success:false, error:{...}}` shape instead, which the mobile client's
 * `response.data['message']` read would silently miss.
 */
export async function requireOwnerOpenApi(request: Request): Promise<AuthResult> {
  const result = await authenticateOwner(request);
  if (result.ok) return result;

  const { message, status } = AUTH_FAILURE_MESSAGES[result.reason];
  return { ok: false, response: openApiError(message, status) };
}
