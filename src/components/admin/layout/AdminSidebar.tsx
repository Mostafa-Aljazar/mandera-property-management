"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Home, UserRound, Users } from "lucide-react";
import { IMG_LOGO } from "@/assets";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const nav = [
  { href: "/admin", label: "لوحة التحكم", exact: true, icon: Home },
  { href: "/admin/owners", label: "الملاك", icon: Users },
  { href: "/admin/reports", label: "تقرير الإيرادات", icon: BarChart3 },
  { href: "/admin/profile", label: "الملف الشخصي", icon: UserRound },
] as const;

function isActivePath(pathname: string, href: string, exact?: boolean) {
  return exact ? pathname === href : pathname.startsWith(href);
}

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar side="right" collapsible="icon" data-admin-theme="">
      <SidebarHeader className="h-16 justify-center px-4 py-0">
        <Link
          href="/admin"
          className="flex h-full items-center justify-center px-0"
        >
          <Image
            src={IMG_LOGO}
            alt="Mandera Property Management"
            width={140}
            height={36}
            priority
            unoptimized
            className="h-7 w-auto group-data-[collapsible=icon]:hidden"
          />
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-1.5 py-3">
        <SidebarGroup>
          <SidebarGroupLabel className="mb-1.5 px-2.5 text-[11px] font-semibold tracking-wide text-sidebar-foreground/50 uppercase">
            القائمة
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {nav.map((item) => {
                const active = isActivePath(
                  pathname,
                  item.href,
                  "exact" in item ? item.exact : false,
                );
                const Icon = item.icon;

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={active}
                      tooltip={item.label}
                      render={<Link href={item.href} />}
                      className="h-11 gap-3 rounded-full px-4 text-[13.5px] font-semibold text-sidebar-foreground/65 [&_svg]:size-[18px] data-active:bg-sidebar-primary data-active:text-sidebar-primary-foreground data-active:shadow-[0_6px_16px_-6px_rgba(237,27,36,0.45)]"
                    >
                      <Icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
