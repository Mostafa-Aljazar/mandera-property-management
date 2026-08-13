"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { IMG_LOGO } from "@/assets";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/#how", label: "كيف يعمل" },
  { href: "/#platform", label: "المنصة" },
  { href: "/#roles", label: "الأدوار" },
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const onLogin = pathname === "/login";
  const onAuthFlow =
    pathname === "/forgot-password" || pathname === "/reset-password";

  return (
    <header className="sticky top-0 z-30 border-b border-black/5 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-6">
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

        <nav className="hidden items-center gap-8 text-sm font-medium text-[#16445B]/75 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-[#16445B]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {onLogin || onAuthFlow ? (
          <Link
            href={onAuthFlow ? "/login" : "/"}
            className={cn(
              "inline-flex h-10 items-center gap-2 rounded-full border border-[#16445B]/15 bg-white px-4 text-sm font-semibold text-[#16445B] transition-colors hover:border-[#16445B]/30 hover:bg-[#f7fafb]",
            )}
          >
            {onAuthFlow ? "تسجيل الدخول" : "الصفحة الرئيسية"}
          </Link>
        ) : (
          <Link
            href="/login"
            className="inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold text-white transition-all duration-300 hover:gap-3 hover:opacity-90"
            style={{ backgroundColor: BRAND.red }}
          >
            دخول مدير المنصة
            <ArrowLeft className="size-4" />
          </Link>
        )}
      </div>
    </header>
  );
}
