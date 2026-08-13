import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ResetPasswordForm } from "@/components/site/ResetPasswordForm";

export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/forgot-password?error=invalid_link");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("role, is_active")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "master_admin" || !profile.is_active) {
    await supabase.auth.signOut();
    redirect("/forgot-password?error=invalid_link");
  }

  return <ResetPasswordForm />;
}
