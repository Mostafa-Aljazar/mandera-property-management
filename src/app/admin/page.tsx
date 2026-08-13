import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  Home,
  Plus,
  ShieldCheck,
  UserCheck,
  Users,
  UserX,
} from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Reveal } from "@/components/common/Reveal";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";

async function getDashboardStats() {
  const supabase = createAdminClient();

  const [
    { count: activeOwners },
    { count: inactiveOwners },
    { count: properties },
    { count: units },
  ] = await Promise.all([
    supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("role", "owner")
      .eq("is_active", true)
      .is("deleted_at", null),
    supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("role", "owner")
      .eq("is_active", false)
      .is("deleted_at", null),
    supabase
      .from("properties")
      .select("*", { count: "exact", head: true })
      .is("deleted_at", null),
    supabase
      .from("units")
      .select("*", { count: "exact", head: true })
      .is("deleted_at", null),
  ]);

  return {
    activeOwners: activeOwners ?? 0,
    inactiveOwners: inactiveOwners ?? 0,
    properties: properties ?? 0,
    units: units ?? 0,
  };
}

export default async function AdminDashboardPage() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return (
      <Alert>
        <AlertDescription>
          لسه ما ضفت <code className="font-mono">SUPABASE_SERVICE_ROLE_KEY</code>{" "}
          بملف <code className="font-mono">.env.local</code>. جيبه من Supabase
          Dashboard → Settings → API → service_role، وبعدين أعد تشغيل السيرفر.
        </AlertDescription>
      </Alert>
    );
  }

  const stats = await getDashboardStats();
  const totalOwners = stats.activeOwners + stats.inactiveOwners;
  const activePct =
    totalOwners === 0
      ? null
      : Math.round((stats.activeOwners / totalOwners) * 100);

  const statsCards = [
    {
      label: "ملاك نشطون",
      value: stats.activeOwners,
      icon: UserCheck,
      accent: BRAND.navy,
      href: "/admin/owners?status=active",
      delay: 80,
    },
    {
      label: "ملاك معطّلون",
      value: stats.inactiveOwners,
      icon: UserX,
      accent: BRAND.red,
      href: "/admin/owners?status=inactive",
      delay: 160,
    },
    {
      label: "العقارات",
      value: stats.properties,
      icon: Building2,
      accent: BRAND.navy,
      href: "/admin/owners",
      delay: 240,
    },
    {
      label: "الوحدات",
      value: stats.units,
      icon: Home,
      accent: BRAND.navy,
      href: "/admin/owners",
      delay: 320,
    },
  ];

  return (
    <div className="relative space-y-10">
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-x-6 -top-8 h-72 bg-[radial-gradient(ellipse_at_top,rgba(22,68,91,0.07),transparent_60%)]"
      />

      <Reveal>
        <section className="relative overflow-hidden rounded-[1.75rem] text-white shadow-[0_24px_60px_rgba(11,36,48,0.22)]">
          <div className="absolute inset-0" style={{ backgroundColor: BRAND.navy }}>
            <Image
              src="/hero-building.jpg"
              alt=""
              fill
              priority
              sizes="(max-width: 768px) 100vw, 1152px"
              className="object-cover object-center opacity-35"
            />
            <div className="absolute inset-0 bg-linear-to-l from-[#0b2430] via-[#0b2430]/88 to-[#0b2430]/55" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(237,27,36,0.35),transparent_42%)]" />
          </div>

          <div className="relative grid gap-8 p-7 sm:p-9 lg:grid-cols-[1.2fr_0.8fr] lg:gap-10 lg:p-11">
            <div className="flex flex-col justify-center">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                <ShieldCheck className="size-3.5" style={{ color: BRAND.red }} />
                مساحة مدير المنصة
              </div>
              <h1 className="mt-5 text-3xl font-bold leading-[1.25] tracking-tight sm:text-4xl">
                مرحباً بك في
                <span className="block" style={{ color: BRAND.red }}>
                  لوحة التحكم
                </span>
              </h1>
              <p className="mt-4 max-w-lg text-sm leading-8 text-white/70 sm:text-[15px]">
                تابع نمو المنصة بأرقام واضحة، وأدر حسابات الملاك بسهولة — مع
                احترام خصوصية بياناتهم التشغيلية بالكامل.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/admin/owners/new"
                  className="inline-flex h-12 items-center gap-2 rounded-full px-6 text-sm font-semibold text-white shadow-[0_10px_28px_rgba(237,27,36,0.35)] transition-all duration-300 hover:gap-3 hover:opacity-95"
                  style={{ backgroundColor: BRAND.red }}
                >
                  <Plus className="size-4" />
                  إضافة مالك جديد
                </Link>
                <Link
                  href="/admin/owners"
                  className="inline-flex h-12 items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 text-sm font-semibold text-white backdrop-blur-md transition-all duration-300 hover:bg-white/16"
                >
                  <Users className="size-4" />
                  كل الملاك
                  <ArrowLeft className="size-4 opacity-70" />
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="rounded-2xl border border-white/12 bg-white/10 p-5 backdrop-blur-md">
                <p className="text-xs font-medium text-white/60">إجمالي الملاك</p>
                <p className="mt-3 text-4xl font-bold tracking-tight">
                  {totalOwners}
                </p>
                <p className="mt-2 text-xs leading-5 text-white/50">
                  نشط ومعطّل معاً
                </p>
              </div>
              <div className="rounded-2xl border border-white/12 bg-white/10 p-5 backdrop-blur-md">
                <p className="text-xs font-medium text-white/60">نسبة النشطين</p>
                <p className="mt-3 text-4xl font-bold tracking-tight">
                  {activePct === null ? "—" : `${activePct}%`}
                </p>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/15">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${activePct ?? 0}%`,
                      backgroundColor: BRAND.red,
                    }}
                  />
                </div>
              </div>
              <div className="col-span-2 rounded-2xl border border-white/12 bg-linear-to-l from-white/5 to-white/12 p-5 backdrop-blur-md">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium text-white/60">
                      عقارات المنصة
                    </p>
                    <p className="mt-2 text-3xl font-bold tracking-tight">
                      {stats.properties}
                      <span className="ms-2 text-base font-medium text-white/45">
                        عقار · {stats.units} وحدة
                      </span>
                    </p>
                  </div>
                  <div
                    className="flex size-12 shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: `${BRAND.red}33` }}
                  >
                    <Building2 className="size-5" style={{ color: BRAND.red }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </Reveal>

      <section>
        <Reveal>
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-[#16445B]">لمحة سريعة</h2>
              <p className="mt-1.5 text-sm leading-7 text-[#5b6b73]">
                اضغط على أي رقم للانتقال مباشرة إلى القسم المناسب
              </p>
            </div>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statsCards.map((card) => {
            const Icon = card.icon;
            return (
              <Reveal key={card.label} delay={card.delay}>
                <Link
                  href={card.href}
                  className={cn(
                    "group relative block overflow-hidden rounded-2xl border border-black/5 bg-white p-6",
                    "shadow-[0_10px_36px_rgba(15,42,55,0.05)] transition-all duration-500",
                    "hover:-translate-y-1 hover:shadow-[0_18px_48px_rgba(15,42,55,0.1)]",
                  )}
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -start-8 -top-8 size-28 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
                    style={{ backgroundColor: `${card.accent}22` }}
                  />
                  <div className="relative flex items-start justify-between">
                    <div
                      className="flex size-12 items-center justify-center rounded-2xl transition-transform duration-500 group-hover:scale-105"
                      style={{
                        backgroundColor: `${card.accent}12`,
                        color: card.accent,
                      }}
                    >
                      <Icon className="size-5" />
                    </div>
                    <span className="flex size-8 items-center justify-center rounded-full bg-[#f7fafb] text-[#8a969c] transition-all duration-300 group-hover:bg-[#16445B] group-hover:text-white">
                      <ArrowLeft className="size-3.5" />
                    </span>
                  </div>
                  <p className="relative mt-6 text-sm font-medium text-[#5b6b73]">
                    {card.label}
                  </p>
                  <p
                    className="relative mt-1 text-4xl font-bold tracking-tight"
                    style={{ color: BRAND.navy }}
                  >
                    {card.value}
                  </p>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>

      <Reveal delay={120}>
        <section className="grid gap-4 md:grid-cols-3">
          {[
            {
              title: "أضف مالكاً",
              desc: "إنشاء حساب جديد للمنصة — التسجيل حصراً من هنا.",
              href: "/admin/owners/new",
              icon: Plus,
            },
            {
              title: "أدر الحسابات",
              desc: "تفعيل أو تعطيل أي مالك مؤقتاً عند الحاجة.",
              href: "/admin/owners",
              icon: Users,
            },
            {
              title: "ملفك الشخصي",
              desc: "حدّث بياناتك أو صورة الحساب في أي وقت.",
              href: "/admin/profile",
              icon: ShieldCheck,
            },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group rounded-2xl border border-black/5 bg-white p-6 transition-all duration-300",
                  "hover:border-[#16445B]/15 hover:shadow-[0_14px_40px_rgba(15,42,55,0.07)]",
                  i === 0 && "md:border-[#ED1B24]/15",
                )}
              >
                <div
                  className="flex size-11 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-105"
                  style={{
                    backgroundColor:
                      i === 0 ? `${BRAND.red}14` : `${BRAND.navy}12`,
                    color: i === 0 ? BRAND.red : BRAND.navy,
                  }}
                >
                  <Icon className="size-5" />
                </div>
                <h3
                  className="mt-5 text-base font-bold"
                  style={{ color: BRAND.navy }}
                >
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-7 text-[#5b6b73]">
                  {item.desc}
                </p>
                <span
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold transition-all duration-300 group-hover:gap-2.5"
                  style={{ color: i === 0 ? BRAND.red : BRAND.navy }}
                >
                  متابعة
                  <ArrowLeft className="size-3.5" />
                </span>
              </Link>
            );
          })}
        </section>
      </Reveal>
    </div>
  );
}
