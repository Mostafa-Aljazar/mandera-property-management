import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminSidebar } from "@/components/admin/layout/AdminSidebar";
import { AdminTopbar } from "@/components/admin/layout/AdminTopbar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

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
    <SidebarProvider
      data-admin-theme=""
      style={{ "--sidebar-width": "13.5rem" } as React.CSSProperties}
    >
      <AdminSidebar />
      <SidebarInset>
        <AdminTopbar
          fullName={profile.full_name}
          avatarUrl={profile.avatar_url}
          initials={initials}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
