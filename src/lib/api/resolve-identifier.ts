import { createRouteClient } from "@/lib/supabase/route";

/**
 * Resolve an identifier (email or phone) to an auth email for login/password-reset.
 * If the identifier looks like an email (@), use it directly.
 * If it's a phone number, look it up in the users table to get the auth email.
 */
export async function resolveIdentifierToEmail(
  identifier: string,
): Promise<{ email: string } | { error: string }> {
  if (identifier.includes("@")) {
    // Treat as email
    return { email: identifier };
  }

  // Treat as phone number — look up in users table
  const supabase = createRouteClient();
  const { data, error } = await supabase
    .from("users")
    .select("email")
    .eq("phone", identifier)
    .maybeSingle();

  if (error || !data?.email) {
    return { error: "بريد إلكتروني أو رقم هاتف غير صحيح" };
  }

  return { email: data.email };
}
