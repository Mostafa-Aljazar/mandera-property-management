import { redirect } from "next/navigation";
import { ShieldCheck, UserRound } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Reveal } from "@/components/common/Reveal";
import { AvatarUploader } from "@/components/admin/profile/AvatarUploader";
import {
  PasswordForm,
  ProfileForm,
} from "@/components/admin/profile/Forms";
import { BRAND } from "@/lib/brand";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("full_name, phone, email, avatar_url")
    .eq("id", user.id)
    .single();

  const email = profile?.email ?? user.email ?? null;
  const fullName = profile?.full_name ?? "";

  return (
    <div className="relative space-y-5 sm:space-y-7">
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-x-4 -top-6 h-48 bg-[radial-gradient(ellipse_at_top,rgba(22,68,91,0.06),transparent_60%)] sm:-inset-x-6 sm:-top-8 sm:h-56"
      />

      <Reveal>
        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#16445B]/10 bg-white px-2.5 py-1 text-[11px] font-semibold text-[#16445B]/70 shadow-sm sm:px-3 sm:text-xs">
            <UserRound className="size-3.5" style={{ color: BRAND.red }} />
            حساب الأدمن
          </div>
          <h1
            className="mt-2.5 text-xl font-bold tracking-tight sm:mt-3 sm:text-3xl"
            style={{ color: BRAND.navy }}
          >
            الملف الشخصي
          </h1>
          <p className="mt-1.5 max-w-md text-sm leading-6 text-[#5b6b73] sm:mt-2 sm:leading-7">
            عدّل صورتك وبياناتك وكلمة المرور لحساب Master Admin
          </p>
        </div>
      </Reveal>

      <Reveal delay={70}>
        <section className="overflow-hidden rounded-[1.5rem] border border-[#16445B]/8 bg-white shadow-[0_12px_40px_rgba(22,68,91,0.05)]">
          <div
            className="relative px-4 py-4 sm:px-6"
            style={{
              background: `linear-gradient(135deg, ${BRAND.navy} 0%, #0d2f3f 100%)`,
            }}
          >
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background: `radial-gradient(ellipse at top left, ${BRAND.red}45, transparent 55%)`,
              }}
            />
            <div className="relative flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/12 px-2.5 py-1 text-[11px] font-semibold text-white/95 ring-1 ring-white/15">
                <ShieldCheck className="size-3.5" />
                Master Admin
              </span>
              {email ? (
                <span
                  className="max-w-full truncate rounded-full bg-white/10 px-2.5 py-1 text-[11px] text-white/80 ring-1 ring-white/10"
                  dir="ltr"
                >
                  {email}
                </span>
              ) : null}
            </div>
          </div>

          <div className="px-4 py-5 sm:px-6 sm:py-6">
            <AvatarUploader
              userId={user.id}
              fullName={fullName}
              avatarUrl={profile?.avatar_url ?? null}
            />
          </div>
        </section>
      </Reveal>

      <Reveal delay={120}>
        <ProfileForm
          fullName={fullName}
          phone={profile?.phone ?? null}
          email={email}
        />
      </Reveal>

      <Reveal delay={170}>
        <PasswordForm />
      </Reveal>
    </div>
  );
}
