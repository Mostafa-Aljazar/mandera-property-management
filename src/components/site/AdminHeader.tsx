"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  LogOut,
  Menu,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { IMG_LOGO } from "@/assets";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";
import { logout } from "@/actions/admin/logout.action";

const nav = [
  { href: "/admin", label: "الرئيسية", exact: true, icon: Home },
  { href: "/admin/owners", label: "الملاك", icon: Users },
  { href: "/admin/profile", label: "الملف الشخصي", icon: UserRound },
] as const;

type AdminHeaderProps = {
  fullName: string;
  avatarUrl: string | null;
  initials: string;
};

function isActivePath(
  pathname: string,
  href: string,
  exact?: boolean,
) {
  return exact ? pathname === href : pathname.startsWith(href);
}

export function AdminHeader({
  fullName,
  avatarUrl,
  initials,
}: AdminHeaderProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-black/5 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:h-16 sm:gap-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-2">
          <Popover open={menuOpen} onOpenChange={setMenuOpen}>
            <PopoverTrigger
              render={
                <button
                  type="button"
                  aria-label={menuOpen ? "إغلاق القائمة" : "فتح القائمة"}
                  className={cn(
                    "inline-flex size-10 items-center justify-center rounded-xl text-[#16445B] transition-colors md:hidden",
                    "hover:bg-[#16445B]/08",
                    "data-[popup-open]:bg-[#16445B]/10",
                  )}
                />
              }
            >
              {menuOpen ? (
                <X className="size-5" />
              ) : (
                <Menu className="size-5" />
              )}
            </PopoverTrigger>

            <PopoverContent
              align="start"
              side="bottom"
              sideOffset={10}
              className="w-[min(18rem,calc(100vw-2rem))] gap-0 overflow-hidden rounded-2xl border-0 bg-white p-0 shadow-[0_20px_50px_rgba(15,42,55,0.18)] ring-1 ring-[#16445B]/10 md:hidden"
            >
              <div
                className="px-3.5 py-3"
                style={{
                  background: `linear-gradient(135deg, ${BRAND.navy}0F 0%, ${BRAND.red}08 100%)`,
                }}
              >
                <p
                  className="text-sm font-bold"
                  style={{ color: BRAND.navy }}
                >
                  القائمة
                </p>
                <p className="mt-0.5 truncate text-xs text-[#8a969c]">
                  {fullName}
                </p>
              </div>

              <nav className="flex flex-col gap-0.5 p-1.5">
                {nav.map((item) => {
                  const active = isActivePath(
                    pathname,
                    item.href,
                    "exact" in item ? item.exact : false,
                  );
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-2 py-2.5 text-sm font-semibold transition-colors",
                        active
                          ? "bg-[#16445B] text-white"
                          : "text-[#16445B] hover:bg-[#16445B]/06",
                      )}
                    >
                      <span
                        className={cn(
                          "flex size-8 shrink-0 items-center justify-center rounded-xl",
                          active ? "bg-white/15" : "bg-[#16445B]/08",
                        )}
                      >
                        <Icon className="size-4" />
                      </span>
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="border-t border-[#16445B]/08 p-1.5">
                <form action={logout}>
                  <button
                    type="submit"
                    className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-sm font-semibold text-[#ED1B24] transition-colors hover:bg-[#ED1B24]/08"
                  >
                    <span
                      className="flex size-8 shrink-0 items-center justify-center rounded-xl"
                      style={{
                        backgroundColor: `${BRAND.red}12`,
                        color: BRAND.red,
                      }}
                    >
                      <LogOut className="size-4" />
                    </span>
                    تسجيل الخروج
                  </button>
                </form>
              </div>
            </PopoverContent>
          </Popover>

          <Link
            href="/"
            className="flex shrink-0 items-center transition-transform duration-300 hover:scale-[1.02]"
          >
            <Image
              src={IMG_LOGO}
              alt="Mandera Property Management"
              width={150}
              height={38}
              priority
              unoptimized
              className="h-8 w-auto"
            />
          </Link>
        </div>

        <nav className="hidden items-center gap-8 text-sm font-medium text-[#16445B]/75 md:flex">
          {nav.map((item) => {
            const active = isActivePath(
              pathname,
              item.href,
              "exact" in item ? item.exact : false,
            );

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "transition-colors hover:text-[#16445B]",
                  active && "font-semibold text-[#16445B]",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/admin/profile"
            title="الملف الشخصي"
            className="flex items-center gap-2.5 rounded-full py-1 pe-1 ps-2 transition-colors hover:bg-[#f7fafb]"
          >
            <span className="hidden max-w-36 truncate text-sm font-medium text-[#16445B] sm:block">
              {fullName}
            </span>
            <Avatar
              className="size-9 ring-2 ring-[#16445B]/15 ring-offset-2 ring-offset-white"
              style={{ backgroundColor: `${BRAND.navy}14` }}
            >
              {avatarUrl && (
                <AvatarImage src={avatarUrl} alt={fullName} />
              )}
              <AvatarFallback
                className="text-xs font-semibold"
                style={{
                  color: BRAND.navy,
                  backgroundColor: `${BRAND.navy}18`,
                }}
              >
                {initials || "؟"}
              </AvatarFallback>
            </Avatar>
          </Link>

          <form action={logout} className="hidden sm:block">
            <button
              type="submit"
              className="inline-flex h-10 items-center gap-2 rounded-full border border-[#16445B]/15 bg-white px-3 text-sm font-semibold text-[#16445B] transition-colors hover:border-[#ED1B24]/30 hover:bg-[#fff5f5] hover:text-[#ED1B24] sm:px-4"
              title="تسجيل الخروج"
            >
              <LogOut className="size-4" />
              <span className="hidden sm:inline">خروج</span>
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
