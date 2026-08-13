"use client";

import Link from "next/link";
import { CalendarDays, Mail, Phone } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { OwnersActionsMenu } from "@/components/admin/owners/OwnersActionsMenu";
import { BRAND } from "@/lib/brand";
import { formatDateShort } from "@/lib/format";
import { cn } from "@/lib/utils";

export type OwnerListItem = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  is_active: boolean;
  account_status: string | null;
  national_id: string | null;
  valid_until: string | null;
  created_at: string;
  avatar_url: string | null;
};

function statusBadge(status: string | null | undefined, isActive: boolean) {
  const resolved = status ?? (isActive ? "active" : "inactive");
  if (resolved === "pending") {
    return {
      label: "معلّق",
      className: "bg-amber-50 text-amber-800 ring-amber-200/60",
    };
  }
  if (resolved === "inactive") {
    return {
      label: "معطّل",
      className: "bg-[#f0f3f5] text-[#6b7a82] ring-[#d8dee2]",
    };
  }
  return {
    label: "نشط",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-200/60",
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

function OwnerMobileCard({ owner }: { owner: OwnerListItem }) {
  const badge = statusBadge(owner.account_status, owner.is_active);

  return (
    <article className="overflow-hidden rounded-2xl border border-[#16445B]/8 bg-white shadow-[0_10px_28px_rgba(15,42,55,0.05)]">
      <div className="flex items-start gap-3 p-4">
        <Link href={`/admin/owners/${owner.id}`} className="shrink-0">
          <Avatar
            className="size-12 ring-2 ring-[#16445B]/10 sm:size-14"
            style={{ backgroundColor: `${BRAND.navy}14` }}
          >
            {owner.avatar_url && (
              <AvatarImage src={owner.avatar_url} alt={owner.full_name} />
            )}
            <AvatarFallback
              className="text-sm font-bold"
              style={{
                color: BRAND.navy,
                backgroundColor: `${BRAND.navy}14`,
              }}
            >
              {initialsOf(owner.full_name) || "؟"}
            </AvatarFallback>
          </Avatar>
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <Link
                href={`/admin/owners/${owner.id}`}
                className="block truncate text-[15px] font-bold leading-snug transition-colors hover:text-[#ED1B24] sm:text-base"
                style={{ color: BRAND.navy }}
              >
                {owner.full_name}
              </Link>
              <p
                className="mt-0.5 truncate text-xs text-[#8a969c]"
                dir="ltr"
              >
                {owner.national_id || "بدون هوية"}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset",
                  badge.className,
                )}
              >
                {badge.label}
              </span>
              <OwnersActionsMenu
                ownerId={owner.id}
                isActive={owner.account_status === "active"}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-0 border-t border-[#16445B]/06 bg-[#f7fafb]/70 px-4 py-3">
        <a
          href={`mailto:${owner.email}`}
          className="flex items-center gap-2.5 rounded-xl px-1 py-1.5 text-sm text-[#5b6b73] transition-colors hover:bg-white hover:text-[#16445B]"
        >
          <span
            className="flex size-7 shrink-0 items-center justify-center rounded-lg"
            style={{ backgroundColor: `${BRAND.navy}10`, color: BRAND.navy }}
          >
            <Mail className="size-3.5" />
          </span>
          <span className="min-w-0 truncate" dir="ltr">
            {owner.email}
          </span>
        </a>

        {owner.phone ? (
          <a
            href={`https://wa.me/${owner.phone.replace(/\D/g, "")}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2.5 rounded-xl px-1 py-1.5 text-sm text-[#5b6b73] transition-colors hover:bg-white hover:text-[#16445B]"
          >
            <span
              className="flex size-7 shrink-0 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${BRAND.navy}10`, color: BRAND.navy }}
            >
              <Phone className="size-3.5" />
            </span>
            <span dir="ltr">{owner.phone}</span>
          </a>
        ) : (
          <div className="flex items-center gap-2.5 px-1 py-1.5 text-sm text-[#8a969c]">
            <span
              className="flex size-7 shrink-0 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${BRAND.navy}10`, color: BRAND.navy }}
            >
              <Phone className="size-3.5" />
            </span>
            بدون هاتف
          </div>
        )}

        <div className="flex items-center gap-2.5 px-1 py-1.5 text-sm text-[#5b6b73]">
          <span
            className="flex size-7 shrink-0 items-center justify-center rounded-lg"
            style={{
              backgroundColor: owner.valid_until
                ? `${BRAND.navy}10`
                : `${BRAND.red}10`,
              color: owner.valid_until ? BRAND.navy : BRAND.red,
            }}
          >
            <CalendarDays className="size-3.5" />
          </span>
          <span className="min-w-0">
            {owner.valid_until
              ? `الصلاحية ${formatDateShort(owner.valid_until)}`
              : "بدون صلاحية"}
          </span>
        </div>
      </div>
    </article>
  );
}

export function OwnersList({ owners }: { owners: OwnerListItem[] }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:hidden">
        {owners.map((owner) => (
          <OwnerMobileCard key={owner.id} owner={owner} />
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-2xl border border-[#16445B]/8 bg-white shadow-[0_10px_36px_rgba(15,42,55,0.04)] lg:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-sm">
            <thead>
              <tr className="border-b border-black/5 bg-[#f7fafb]/80 text-start">
                <th className="px-5 py-3.5 font-semibold text-[#5b6b73]">
                  المالك
                </th>
                <th className="px-5 py-3.5 font-semibold text-[#5b6b73]">
                  البريد
                </th>
                <th className="px-5 py-3.5 font-semibold text-[#5b6b73]">
                  الهاتف
                </th>
                <th className="px-5 py-3.5 font-semibold text-[#5b6b73]">
                  الحالة
                </th>
                <th className="px-5 py-3.5 font-semibold text-[#5b6b73]">
                  الصلاحية
                </th>
                <th className="w-12 px-3 py-3.5" aria-label="إجراءات" />
              </tr>
            </thead>
            <tbody>
              {owners.map((owner) => {
                const badge = statusBadge(
                  owner.account_status,
                  owner.is_active,
                );
                return (
                  <tr
                    key={owner.id}
                    className="border-b border-black/5 transition-colors last:border-0 hover:bg-[#f7fafb]/70"
                  >
                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/owners/${owner.id}`}
                        className="flex items-center gap-3"
                      >
                        <Avatar
                          className="size-10 ring-2 ring-[#16445B]/8"
                          style={{ backgroundColor: `${BRAND.navy}14` }}
                        >
                          {owner.avatar_url && (
                            <AvatarImage
                              src={owner.avatar_url}
                              alt={owner.full_name}
                            />
                          )}
                          <AvatarFallback
                            className="text-xs font-semibold"
                            style={{
                              color: BRAND.navy,
                              backgroundColor: `${BRAND.navy}14`,
                            }}
                          >
                            {initialsOf(owner.full_name) || "؟"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <span
                            className="block truncate font-semibold transition-colors hover:text-[#ED1B24]"
                            style={{ color: BRAND.navy }}
                          >
                            {owner.full_name}
                          </span>
                          <span
                            className="mt-0.5 block truncate text-xs text-[#8a969c]"
                            dir="ltr"
                          >
                            {owner.national_id || "بدون هوية"}
                          </span>
                        </div>
                      </Link>
                    </td>

                    <td className="px-5 py-4">
                      <Tooltip>
                        <TooltipTrigger
                          render={
                            <a
                              href={`mailto:${owner.email}`}
                              className="block max-w-56 truncate text-[#5b6b73] transition-colors hover:text-[#16445B]"
                              dir="ltr"
                            />
                          }
                        >
                          {owner.email}
                        </TooltipTrigger>
                        <TooltipContent>فتح البريد</TooltipContent>
                      </Tooltip>
                    </td>

                    <td className="px-5 py-4">
                      {owner.phone ? (
                        <Tooltip>
                          <TooltipTrigger
                            render={
                              <a
                                href={`https://wa.me/${owner.phone.replace(/\D/g, "")}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[#5b6b73] transition-colors hover:text-[#16445B]"
                                dir="ltr"
                              />
                            }
                          >
                            {owner.phone}
                          </TooltipTrigger>
                          <TooltipContent>فتح واتساب</TooltipContent>
                        </Tooltip>
                      ) : (
                        <span className="text-[#8a969c]">—</span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
                          badge.className,
                        )}
                      >
                        {badge.label}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-[#5b6b73]">
                      {owner.valid_until
                        ? formatDateShort(owner.valid_until)
                        : "—"}
                    </td>

                    <td className="px-3 py-4 text-end">
                      <OwnersActionsMenu
                        ownerId={owner.id}
                        isActive={owner.account_status === "active"}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
