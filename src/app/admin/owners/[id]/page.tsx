import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  Building2,
  CalendarDays,
  ExternalLink,
  FileCheck2,
  FileImage,
  Home,
  IdCard,
  Mail,
  MapPin,
  Phone,
  UserRound,
  Users,
} from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Reveal } from "@/components/common/Reveal";
import { OwnerContactChips } from "@/components/admin/owners/OwnerContactChips";
import { OwnerNotesForm } from "@/components/admin/owners/OwnerNotesForm";
import {
  DeleteOwnerForm,
  ToggleActiveForm,
} from "@/components/admin/owners/RowActions";
import { BRAND } from "@/lib/brand";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

async function getOwnerWithStats(id: string) {
  const admin = createAdminClient();

  const { data: owner } = await admin
    .from("users")
    .select(
      "id, full_name, email, phone, is_active, account_status, national_id, valid_until, company_name, city, notes, avatar_url, id_document_url, created_at, deleted_at",
    )
    .eq("id", id)
    .eq("role", "owner")
    .single();

  if (!owner) return null;

  const [
    { count: properties },
    { count: units },
    { count: tenants },
    { count: activeContracts },
  ] = await Promise.all([
    admin
      .from("properties")
      .select("*", { count: "exact", head: true })
      .eq("owner_id", id)
      .is("deleted_at", null),
    admin
      .from("units")
      .select("*", { count: "exact", head: true })
      .eq("owner_id", id)
      .is("deleted_at", null),
    admin
      .from("tenants")
      .select("*", { count: "exact", head: true })
      .eq("owner_id", id)
      .is("deleted_at", null),
    admin
      .from("contracts")
      .select("*", { count: "exact", head: true })
      .eq("owner_id", id)
      .eq("status", "active")
      .is("deleted_at", null),
  ]);

  return {
    owner,
    stats: {
      properties: properties ?? 0,
      units: units ?? 0,
      tenants: tenants ?? 0,
      activeContracts: activeContracts ?? 0,
    },
  };
}

function statusBadge(
  status: string | null | undefined,
  isActive: boolean,
  deletedAt: string | null,
) {
  if (deletedAt) {
    return {
      label: "محذوف",
      className: "bg-[#ED1B24]/10 text-[#ED1B24]",
    };
  }

  const resolved = status ?? (isActive ? "active" : "inactive");
  if (resolved === "pending") {
    return { label: "معلّق", className: "bg-amber-50 text-amber-800" };
  }
  if (resolved === "inactive") {
    return { label: "معطّل", className: "bg-[#f0f3f5] text-[#6b7a82]" };
  }
  return { label: "نشط", className: "bg-emerald-50 text-emerald-700" };
}

function initialsOf(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0])
    .join("")
    .toUpperCase();
}

export default async function OwnerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getOwnerWithStats(id);

  if (!result) notFound();
  const { owner, stats } = result;

  const badge = statusBadge(
    owner.account_status,
    owner.is_active,
    owner.deleted_at,
  );
  const isAccountActive = owner.account_status === "active";

  const statsCards = [
    { label: "العقارات", value: stats.properties, icon: Building2 },
    { label: "الوحدات", value: stats.units, icon: Home },
    { label: "المستأجرون", value: stats.tenants, icon: Users },
    {
      label: "عقود فعّالة",
      value: stats.activeContracts,
      icon: FileCheck2,
      accent: BRAND.red,
    },
  ];

  const details = [
    {
      icon: Mail,
      label: "البريد الإلكتروني",
      value: owner.email || "—",
      dir: "ltr" as const,
    },
    {
      icon: Phone,
      label: "رقم الهاتف",
      value: owner.phone || "—",
      dir: "ltr" as const,
    },
    {
      icon: IdCard,
      label: "رقم الهوية",
      value: owner.national_id || "—",
      dir: "ltr" as const,
    },
    {
      icon: CalendarDays,
      label: "صلاحية الحساب",
      value: formatDate(owner.valid_until),
    },
    {
      icon: Building2,
      label: "الشركة",
      value: owner.company_name || "—",
    },
    {
      icon: MapPin,
      label: "المدينة",
      value: owner.city || "—",
    },
    {
      icon: CalendarDays,
      label: "تاريخ الإنشاء",
      value: formatDate(owner.created_at),
    },
    {
      icon: UserRound,
      label: "حالة الحساب",
      value: badge.label,
    },
  ];

  return (
    <div className="relative space-y-7">
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-x-6 -top-8 h-56 bg-[radial-gradient(ellipse_at_top,rgba(22,68,91,0.06),transparent_60%)]"
      />

      <Reveal>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/admin/owners"
                className="inline-flex items-center gap-1.5 rounded-full border border-[#16445B]/10 bg-white px-3 py-1.5 text-xs font-semibold text-[#5b6b73] shadow-sm transition-colors hover:border-[#16445B]/20 hover:text-[#16445B]"
              >
                <ArrowRight className="size-3.5" />
                رجوع لقائمة الملاك
              </Link>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#16445B]/10 bg-white px-3 py-1.5 text-xs font-semibold text-[#16445B]/70 shadow-sm">
                <UserRound className="size-3.5" style={{ color: BRAND.red }} />
                ملف المالك
              </span>
            </div>
            <h1
              className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl"
              style={{ color: BRAND.navy }}
            >
              {owner.full_name}
            </h1>
            {(owner.company_name || owner.city) && (
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-[#5b6b73]">
                {owner.company_name && (
                  <span className="inline-flex items-center gap-1.5">
                    <Building2 className="size-3.5 text-[#8a969c]" />
                    {owner.company_name}
                  </span>
                )}
                {owner.company_name && owner.city && (
                  <span className="text-[#c5ced1]">·</span>
                )}
                {owner.city && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="size-3.5 text-[#8a969c]" />
                    {owner.city}
                  </span>
                )}
              </div>
            )}
          </div>

          {!owner.deleted_at && (
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/admin/owners/${owner.id}/edit`}
                className="inline-flex h-9 items-center gap-1.5 rounded-full border border-[#16445B]/15 bg-white px-3 text-xs font-semibold text-[#16445B] transition-colors hover:border-[#16445B]/30 hover:bg-[#f7fafb]"
              >
                تعديل
              </Link>
              <ToggleActiveForm
                ownerId={owner.id}
                isActive={isAccountActive}
              />
              <DeleteOwnerForm ownerId={owner.id} />
            </div>
          )}
        </div>
      </Reveal>

      <Reveal delay={70}>
        <section className="rounded-2xl border border-black/5 bg-white p-5 shadow-[0_10px_36px_rgba(15,42,55,0.04)] sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <Avatar
              className="size-20 shrink-0 ring-2 ring-[#16445B]/10 sm:size-24"
              style={{ backgroundColor: `${BRAND.navy}14` }}
            >
              {owner.avatar_url && (
                <AvatarImage src={owner.avatar_url} alt={owner.full_name} />
              )}
              <AvatarFallback
                className="text-xl font-bold"
                style={{
                  color: BRAND.navy,
                  backgroundColor: `${BRAND.navy}14`,
                }}
              >
                {initialsOf(owner.full_name) || "؟"}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                    badge.className,
                  )}
                >
                  {badge.label}
                </span>
                <span className="text-xs text-[#8a969c]">
                  منذ {formatDate(owner.created_at)}
                </span>
              </div>

              <OwnerContactChips
                email={owner.email}
                phone={owner.phone}
                nationalId={owner.national_id}
              />
            </div>
          </div>
        </section>
      </Reveal>

      <Reveal delay={120}>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {statsCards.map((card) => {
            const accent = card.accent ?? BRAND.navy;
            return (
              <div
                key={card.label}
                className="rounded-2xl border border-black/5 bg-white px-4 py-4 shadow-[0_10px_36px_rgba(15,42,55,0.04)] sm:px-5"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs text-[#5b6b73] sm:text-sm">
                    {card.label}
                  </p>
                  <div
                    className="flex size-8 items-center justify-center rounded-xl"
                    style={{
                      backgroundColor: `${accent}12`,
                      color: accent,
                    }}
                  >
                    <card.icon className="size-4" />
                  </div>
                </div>
                <p
                  className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl"
                  style={{ color: BRAND.navy }}
                >
                  {card.value}
                </p>
              </div>
            );
          })}
        </div>
      </Reveal>

      <div className="grid items-stretch gap-5 lg:grid-cols-5">
        <Reveal delay={160} className="h-full lg:col-span-3">
          <section className="h-full rounded-2xl border border-black/5 bg-white p-5 shadow-[0_10px_36px_rgba(15,42,55,0.04)] sm:p-6">
            <h2 className="text-base font-bold" style={{ color: BRAND.navy }}>
              بيانات الحساب
            </h2>
            <p className="mt-1 text-sm text-[#5b6b73]">
              معلومات التواصل والهوية المرتبطة بالحساب
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {details.map((item) => (
                <div
                  key={item.label}
                  className="flex items-start gap-3 rounded-2xl border border-[#16445B]/06 bg-[#f7fafb] p-4"
                >
                  <div
                    className="flex size-9 shrink-0 items-center justify-center rounded-xl"
                    style={{
                      backgroundColor: `${BRAND.navy}12`,
                      color: BRAND.navy,
                    }}
                  >
                    <item.icon className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-[#8a969c]">
                      {item.label}
                    </p>
                    <p
                      className="mt-1 break-all text-sm font-semibold leading-6"
                      style={{ color: BRAND.navy }}
                      dir={item.dir}
                    >
                      {item.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </Reveal>

        <Reveal delay={220} className="h-full lg:col-span-2">
          <section className="flex h-full flex-col rounded-2xl border border-black/5 bg-white p-5 shadow-[0_10px_36px_rgba(15,42,55,0.04)] sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2
                  className="text-base font-bold"
                  style={{ color: BRAND.navy }}
                >
                  مستند الهوية
                </h2>
                <p className="mt-1 text-sm text-[#5b6b73]">
                  الصورة المرفوعة مع إنشاء الحساب
                </p>
              </div>
              <div
                className="flex size-9 items-center justify-center rounded-xl"
                style={{
                  backgroundColor: `${BRAND.red}12`,
                  color: BRAND.red,
                }}
              >
                <FileImage className="size-4" />
              </div>
            </div>

            {owner.id_document_url ? (
              <div className="mt-4 flex min-h-0 flex-1 flex-col gap-3">
                <a
                  href={owner.id_document_url}
                  target="_blank"
                  rel="noreferrer"
                  className="group relative min-h-48 flex-1 overflow-hidden rounded-xl border border-[#16445B]/10 bg-[#f7fafb]"
                >
                  <Image
                    src={owner.id_document_url}
                    alt={`مستند هوية ${owner.full_name}`}
                    fill
                    className="object-cover transition-opacity duration-300 group-hover:opacity-95"
                    sizes="(max-width: 1024px) 100vw, 360px"
                  />
                </a>
                <a
                  href={owner.id_document_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 w-full shrink-0 items-center justify-center gap-2 rounded-full border border-[#16445B]/15 bg-white text-sm font-semibold text-[#16445B] transition-colors hover:bg-[#f7fafb]"
                >
                  <ExternalLink className="size-4" />
                  فتح بحجم كامل
                </a>
              </div>
            ) : (
              <div className="mt-4 flex min-h-48 flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-[#16445B]/15 bg-[#f7fafb] px-4 text-center">
                <FileImage
                  className="size-8 opacity-35"
                  style={{ color: BRAND.navy }}
                />
                <p className="mt-3 text-sm text-[#5b6b73]">
                  لم يتم رفع مستند هوية بعد
                </p>
              </div>
            )}
          </section>
        </Reveal>
      </div>

      <Reveal delay={260}>
        <OwnerNotesForm
          ownerId={owner.id}
          notes={owner.notes}
          disabled={!!owner.deleted_at}
        />
      </Reveal>
    </div>
  );
}
