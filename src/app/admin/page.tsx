import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  Mail,
  Plus,
  UserCheck,
  UserRound,
  Users,
  UserX,
} from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateShort } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "لوحة التحكم",
};

async function getDashboardStats() {
  const supabase = createAdminClient();

  const [
    { count: activeOwners },
    { count: inactiveOwners },
    { count: pendingOwners },
    { count: totalOwners },
  ] = await Promise.all([
    supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("role", "owner")
      .eq("account_status", "active")
      .is("deleted_at", null),
    supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("role", "owner")
      .eq("account_status", "inactive")
      .is("deleted_at", null),
    supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("role", "owner")
      .eq("account_status", "pending")
      .is("deleted_at", null),
    supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("role", "owner")
      .is("deleted_at", null),
  ]);

  return {
    activeOwners: activeOwners ?? 0,
    inactiveOwners: inactiveOwners ?? 0,
    pendingOwners: pendingOwners ?? 0,
    totalOwners: totalOwners ?? 0,
  };
}

async function getRecentOwners() {
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("users")
    .select("id, full_name, email, avatar_url, account_status, is_active, created_at")
    .eq("role", "owner")
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(5);

  return data ?? [];
}

function statusBadge(status: string | null | undefined, isActive: boolean) {
  const resolved = status ?? (isActive ? "active" : "inactive");
  if (resolved === "pending") {
    return {
      label: "معلّق",
      className: "bg-amber-50 text-amber-800",
      dotClass: "bg-amber-500",
    };
  }
  if (resolved === "inactive") {
    return {
      label: "معطّل",
      className: "bg-muted text-muted-foreground",
      dotClass: "bg-muted-foreground/50",
    };
  }
  return {
    label: "نشط",
    className: "bg-emerald-50 text-emerald-700",
    dotClass: "bg-emerald-500",
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

  const [stats, recentOwners] = await Promise.all([
    getDashboardStats(),
    getRecentOwners(),
  ]);

  const statsCards = [
    {
      label: "إجمالي الملاك",
      value: stats.totalOwners,
      icon: Users,
      cardClass: "bg-primary text-primary-foreground",
      iconClass: "bg-white/20 text-white",
      labelClass: "text-white/85",
      valueClass: "text-white",
    },
    {
      label: "نشطون",
      value: stats.activeOwners,
      icon: UserCheck,
      cardClass: "",
      iconClass: "bg-emerald-50 text-emerald-700",
      labelClass: "text-muted-foreground",
      valueClass: "text-foreground",
    },
    {
      label: "معطّلون",
      value: stats.inactiveOwners,
      icon: UserX,
      cardClass: "",
      iconClass: "bg-muted text-muted-foreground",
      labelClass: "text-muted-foreground",
      valueClass: "text-foreground",
    },
    {
      label: "معلّقون",
      value: stats.pendingOwners,
      icon: Clock,
      cardClass: "",
      iconClass: "bg-amber-50 text-amber-800",
      labelClass: "text-muted-foreground",
      valueClass: "text-foreground",
    },
  ];

  const shortcuts = [
    {
      title: "أضف مالكاً",
      desc: "إنشاء حساب جديد للمنصة.",
      href: "/admin/owners/new",
      icon: Plus,
    },
    {
      title: "أدر الحسابات",
      desc: "تفعيل أو تعطيل أي مالك عند الحاجة.",
      href: "/admin/owners",
      icon: Users,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
          لوحة التحكم
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          لمحة سريعة على حسابات الملاك في المنصة.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((card) => (
          <Card key={card.label} className={card.cardClass}>
            <CardContent>
              <div className="flex items-center justify-between gap-2">
                <p className={`text-sm font-medium ${card.labelClass}`}>
                  {card.label}
                </p>
                <div
                  className={`flex size-8 items-center justify-center rounded-lg ${card.iconClass}`}
                >
                  <card.icon className="size-4" />
                </div>
              </div>
              <p
                className={`mt-3 text-3xl font-extrabold tracking-tight ${card.valueClass}`}
              >
                {card.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {shortcuts.map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className="transition-colors hover:border-primary/30 hover:bg-primary/5">
              <CardContent className="flex items-start gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <item.icon className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.desc}
                  </p>
                </div>
                <ArrowLeft className="mt-1 size-4 shrink-0 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardContent>
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="text-base font-bold">الملاك</h2>
            <Link
              href="/admin/owners"
              className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary/80"
            >
              عرض الكل
              <ArrowLeft className="size-3.5" />
            </Link>
          </div>

          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="py-3.5">
                  <span className="inline-flex items-center gap-1.5">
                    <UserRound className="size-3.5" />
                    الاسم
                  </span>
                </TableHead>
                <TableHead className="py-3.5">
                  <span className="inline-flex items-center gap-1.5">
                    <Mail className="size-3.5" />
                    البريد الإلكتروني
                  </span>
                </TableHead>
                <TableHead className="py-3.5">الحالة</TableHead>
                <TableHead className="py-3.5">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="size-3.5" />
                    تاريخ الانضمام
                  </span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOwners.map((owner) => {
                const badge = statusBadge(owner.account_status, owner.is_active);
                return (
                  <TableRow key={owner.id}>
                    <TableCell className="py-3.5">
                      <Link
                        href={`/admin/owners/${owner.id}`}
                        className="flex items-center gap-3"
                      >
                        <Avatar size="sm" className="ring-2 ring-background">
                          {owner.avatar_url && (
                            <AvatarImage src={owner.avatar_url} alt={owner.full_name} />
                          )}
                          <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                            {initialsOf(owner.full_name) || "؟"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-semibold text-foreground hover:text-primary">
                          {owner.full_name}
                        </span>
                      </Link>
                    </TableCell>
                    <TableCell className="py-3.5 text-end text-muted-foreground" dir="ltr">
                      {owner.email}
                    </TableCell>
                    <TableCell className="py-3.5">
                      <Badge className={cn("gap-1.5", badge.className)}>
                        <span className={cn("size-1.5 rounded-full", badge.dotClass)} />
                        {badge.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3.5 text-muted-foreground">
                      {formatDateShort(owner.created_at)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
