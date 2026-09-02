import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  Plus,
  UserCheck,
  Users,
  UserX,
} from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";

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

  const statsCards = [
    { label: "إجمالي الملاك", value: stats.totalOwners, icon: Users },
    { label: "نشطون", value: stats.activeOwners, icon: UserCheck },
    { label: "معطّلون", value: stats.inactiveOwners, icon: UserX },
    { label: "معلّقون", value: stats.pendingOwners, icon: Clock },
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
        <h1 className="text-2xl font-semibold tracking-tight">لوحة التحكم</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          لمحة سريعة على حسابات الملاك في المنصة.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((card) => (
          <Card key={card.label}>
            <CardContent>
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm text-muted-foreground">{card.label}</p>
                <div className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <card.icon className="size-4" />
                </div>
              </div>
              <p className="mt-3 text-3xl font-semibold tracking-tight">
                {card.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {shortcuts.map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className="transition-colors hover:bg-muted/40">
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
    </div>
  );
}
