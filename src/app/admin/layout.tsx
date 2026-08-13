import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminHeader } from "@/components/site/AdminHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("role, is_active, full_name, avatar_url")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "master_admin" || !profile.is_active) {
    await supabase.auth.signOut();
    redirect("/login");
  }

  const initials = profile.full_name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0])
    .join("")
    .toUpperCase();

  return (
    <div className="flex min-h-full flex-1 flex-col bg-[#f7fafb]">
      <AdminHeader
        fullName={profile.full_name}
        avatarUrl={profile.avatar_url}
        initials={initials}
      />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
