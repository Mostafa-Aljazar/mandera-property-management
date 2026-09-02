"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, UserRound } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { logout } from "@/actions/admin/logout.action";

const OWNER_ID_SEGMENT = /^\/admin\/owners\/[^/]+/;

function breadcrumbFor(pathname: string): { href: string; label: string }[] {
  if (pathname === "/admin") {
    return [{ href: "/admin", label: "لوحة التحكم" }];
  }
  if (pathname === "/admin/owners") {
    return [{ href: "/admin/owners", label: "الملاك" }];
  }
  if (pathname === "/admin/owners/new") {
    return [
      { href: "/admin/owners", label: "الملاك" },
      { href: "/admin/owners/new", label: "إضافة مالك" },
    ];
  }
  if (pathname === "/admin/profile") {
    return [{ href: "/admin/profile", label: "الملف الشخصي" }];
  }
  if (OWNER_ID_SEGMENT.test(pathname)) {
    const isEdit = pathname.endsWith("/edit");
    const base = pathname.replace(/\/edit$/, "");
    const trail = [
      { href: "/admin/owners", label: "الملاك" },
      { href: base, label: "تفاصيل المالك" },
    ];
    if (isEdit) {
      trail.push({ href: pathname, label: "تعديل" });
    }
    return trail;
  }
  return [{ href: "/admin", label: "لوحة التحكم" }];
}

type AdminTopbarProps = {
  fullName: string;
  avatarUrl: string | null;
  initials: string;
};

export function AdminTopbar({
  fullName,
  avatarUrl,
  initials,
}: AdminTopbarProps) {
  const pathname = usePathname();
  const crumbs = breadcrumbFor(pathname);

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background px-4 sm:px-6">
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-5" />

      <Breadcrumb className="min-w-0 flex-1">
        <BreadcrumbList className="flex-nowrap overflow-hidden">
          {crumbs.map((crumb, i) => {
            const isLast = i === crumbs.length - 1;
            return (
              <span key={crumb.href} className="flex items-center gap-1.5">
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage className="truncate">
                      {crumb.label}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink
                      render={<Link href={crumb.href} />}
                      className="truncate"
                    >
                      {crumb.label}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {!isLast && <BreadcrumbSeparator />}
              </span>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button
              type="button"
              className="flex shrink-0 items-center gap-2.5 rounded-full py-1 pe-1 ps-2 transition-colors hover:bg-muted"
            />
          }
        >
          <span className="hidden max-w-36 truncate text-sm font-medium text-foreground sm:block">
            {fullName}
          </span>
          <Avatar className="size-8">
            {avatarUrl && <AvatarImage src={avatarUrl} alt={fullName} />}
            <AvatarFallback className="text-xs font-semibold">
              {initials || "؟"}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem render={<Link href="/admin/profile" />}>
            <UserRound />
            الملف الشخصي
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <form action={logout}>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                type="submit"
                variant="ghost"
                size="icon"
                aria-label="تسجيل الخروج"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              />
            }
          >
            <LogOut />
          </TooltipTrigger>
          <TooltipContent>تسجيل الخروج</TooltipContent>
        </Tooltip>
      </form>
    </header>
  );
}
