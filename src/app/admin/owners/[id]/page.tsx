import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Building2,
  CalendarDays,
  ExternalLink,
  FileCheck2,
  FileImage,
  Home,
  IdCard,
  Mail,
  MapPin,
  MoreVertical,
  Phone,
  UserRound,
  Users,
} from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { OwnerContactChips } from "@/components/admin/owners/OwnerContactChips";
import { OwnerNotesForm } from "@/components/admin/owners/OwnerNotesForm";
import {
  DeleteOwnerForm,
  ToggleActiveForm,
} from "@/components/admin/owners/RowActions";
import { SubscriptionPaymentForm } from "@/components/admin/owners/SubscriptionPaymentForm";
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
    { data: subscriptionPayments },
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
    admin
      .from("subscription_payments")
      .select("id, amount, period_start, period_end")
      .eq("owner_id", id)
      .order("created_at", { ascending: false }),
  ]);

  return {
    owner,
    stats: {
      properties: properties ?? 0,
      units: units ?? 0,
      tenants: tenants ?? 0,
      activeContracts: activeContracts ?? 0,
    },
    subscriptionPayments: subscriptionPayments ?? [],
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
      className: "bg-destructive/10 text-destructive",
    };
  }

  const resolved = status ?? (isActive ? "active" : "inactive");
  if (resolved === "pending") {
    return {
      label: "معلّق",
      className: "bg-amber-50 text-amber-800",
    };
  }
  if (resolved === "inactive") {
    return {
      label: "معطّل",
      className: "bg-muted text-muted-foreground",
    };
  }
  return {
    label: "نشط",
    className: "bg-emerald-50 text-emerald-700",
  };
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
  const { owner, stats, subscriptionPayments } = result;

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
    { label: "عقود فعّالة", value: stats.activeContracts, icon: FileCheck2 },
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
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight">
            {owner.full_name}
          </h1>
          {(owner.company_name || owner.city) && (
            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              {owner.company_name && (
                <span className="inline-flex items-center gap-1.5">
                  <Building2 className="size-3.5" />
                  {owner.company_name}
                </span>
              )}
              {owner.company_name && owner.city && <span>·</span>}
              {owner.city && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="size-3.5" />
                  {owner.city}
                </span>
              )}
            </div>
          )}
        </div>

        {!owner.deleted_at && (
          <div className="flex shrink-0 gap-2">
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link href={`/admin/owners/${owner.id}/edit`} />}
            >
              تعديل
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label="المزيد من الإجراءات"
                  />
                }
              >
                <MoreVertical />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <ToggleActiveForm
                  ownerId={owner.id}
                  isActive={isAccountActive}
                  variant="menu"
                />
                <DeleteOwnerForm ownerId={owner.id} variant="menu" />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      <Card>
        <CardContent className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <Avatar size="lg">
            {owner.avatar_url && (
              <AvatarImage src={owner.avatar_url} alt={owner.full_name} />
            )}
            <AvatarFallback className="text-xl font-bold">
              {initialsOf(owner.full_name) || "؟"}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={cn(badge.className)}>
                {badge.label}
              </Badge>
              <span className="text-xs text-muted-foreground">
                منذ {formatDate(owner.created_at)}
              </span>
            </div>

            <OwnerContactChips
              email={owner.email}
              phone={owner.phone}
              nationalId={owner.national_id}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statsCards.map((card) => (
          <Card key={card.label}>
            <CardContent>
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm text-muted-foreground">{card.label}</p>
                <div className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <card.icon className="size-4" />
                </div>
              </div>
              <p className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                {card.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid items-stretch gap-5 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardContent>
            <h2 className="text-base font-semibold">بيانات الحساب</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              معلومات التواصل والهوية المرتبطة بالحساب
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {details.map((item) => (
                <div
                  key={item.label}
                  className="flex items-start gap-3 rounded-lg bg-muted/40 p-4"
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <item.icon className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-muted-foreground">
                      {item.label}
                    </p>
                    <p
                      className="mt-1 break-all text-sm font-semibold leading-6"
                      dir={item.dir}
                    >
                      {item.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="flex h-full flex-col lg:col-span-2">
          <CardContent className="flex flex-1 flex-col">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold">مستند الهوية</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  الصورة المرفوعة مع إنشاء الحساب
                </p>
              </div>
              <div className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <FileImage className="size-4" />
              </div>
            </div>

            {owner.id_document_url ? (
              <div className="mt-4 flex min-h-0 flex-1 flex-col gap-3">
                <a
                  href={owner.id_document_url}
                  target="_blank"
                  rel="noreferrer"
                  className="group relative min-h-48 flex-1 overflow-hidden rounded-lg border bg-muted/40"
                >
                  <Image
                    src={owner.id_document_url}
                    alt={`مستند هوية ${owner.full_name}`}
                    fill
                    className="object-cover transition-opacity duration-300 group-hover:opacity-95"
                    sizes="(max-width: 1024px) 100vw, 360px"
                  />
                </a>
                <Button
                  variant="outline"
                  className="w-full"
                  nativeButton={false}
                  render={
                    <a
                      href={owner.id_document_url}
                      target="_blank"
                      rel="noreferrer"
                    />
                  }
                >
                  <ExternalLink />
                  فتح بحجم كامل
                </Button>
              </div>
            ) : (
              <div className="mt-4 flex min-h-48 flex-1 flex-col items-center justify-center rounded-lg border border-dashed px-4 text-center">
                <FileImage className="size-8 text-muted-foreground/50" />
                <p className="mt-3 text-sm text-muted-foreground">
                  لم يتم رفع مستند هوية بعد
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <SubscriptionPaymentForm
        ownerId={owner.id}
        disabled={!!owner.deleted_at}
        payments={subscriptionPayments}
      />

      <OwnerNotesForm
        ownerId={owner.id}
        notes={owner.notes}
        disabled={!!owner.deleted_at}
      />
    </div>
  );
}
