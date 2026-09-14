"use client";

import Link from "next/link";
import { CalendarDays, Mail, Phone } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { OwnersActionsMenu } from "@/components/admin/owners/OwnersActionsMenu";
import { formatDateShort } from "@/lib/format";
import { cn } from "@/lib/utils";

export type OwnerListItem = {
  id: string;
  full_name: string;
  email: string | null;
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

function OwnerMobileCard({ owner }: { owner: OwnerListItem }) {
  const badge = statusBadge(owner.account_status, owner.is_active);

  return (
    <Card className="overflow-hidden py-0">
      <div className="flex items-start gap-3 p-4">
        <Link href={`/admin/owners/${owner.id}`} className="shrink-0">
          <Avatar size="lg">
            {owner.avatar_url && (
              <AvatarImage src={owner.avatar_url} alt={owner.full_name} />
            )}
            <AvatarFallback className="text-sm font-bold">
              {initialsOf(owner.full_name) || "؟"}
            </AvatarFallback>
          </Avatar>
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <Link
                href={`/admin/owners/${owner.id}`}
                className="block truncate text-[15px] font-semibold leading-snug text-foreground transition-colors hover:text-primary sm:text-base"
              >
                {owner.full_name}
              </Link>
              <p className="mt-0.5 truncate text-xs text-muted-foreground" dir="ltr">
                {owner.national_id || "بدون هوية"}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <Badge className={cn(badge.className)}>
                {badge.label}
              </Badge>
              <OwnersActionsMenu
                ownerId={owner.id}
                isActive={owner.account_status === "active"}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-0 border-t bg-muted/40 px-4 py-3">
        <a
          href={`mailto:${owner.email}`}
          className="flex items-center gap-2.5 rounded-lg px-1 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
        >
          <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
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
            className="flex items-center gap-2.5 rounded-lg px-1 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
          >
            <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <Phone className="size-3.5" />
            </span>
            <span dir="ltr">{owner.phone}</span>
          </a>
        ) : (
          <div className="flex items-center gap-2.5 px-1 py-1.5 text-sm text-muted-foreground">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <Phone className="size-3.5" />
            </span>
            بدون هاتف
          </div>
        )}

        <div className="flex items-center gap-2.5 px-1 py-1.5 text-sm text-muted-foreground">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <CalendarDays className="size-3.5" />
          </span>
          <span className="min-w-0">
            {owner.valid_until
              ? `الصلاحية ${formatDateShort(owner.valid_until)}`
              : "بدون صلاحية"}
          </span>
        </div>
      </div>
    </Card>
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

      <Card className="hidden py-0 lg:block">
        <Table className="min-w-[960px]">
          <TableHeader>
            <TableRow>
              <TableHead className="px-5 py-3.5">المالك</TableHead>
              <TableHead className="px-5 py-3.5">البريد</TableHead>
              <TableHead className="px-5 py-3.5">الهاتف</TableHead>
              <TableHead className="px-5 py-3.5">الحالة</TableHead>
              <TableHead className="px-5 py-3.5">الصلاحية</TableHead>
              <TableHead className="w-12 px-3 py-3.5" aria-label="إجراءات" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {owners.map((owner) => {
              const badge = statusBadge(owner.account_status, owner.is_active);
              return (
                <TableRow key={owner.id}>
                  <TableCell className="px-5 py-4 whitespace-normal">
                    <Link
                      href={`/admin/owners/${owner.id}`}
                      className="flex items-center gap-3"
                    >
                      <Avatar>
                        {owner.avatar_url && (
                          <AvatarImage
                            src={owner.avatar_url}
                            alt={owner.full_name}
                          />
                        )}
                        <AvatarFallback className="text-xs font-semibold">
                          {initialsOf(owner.full_name) || "؟"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <span className="block truncate font-semibold text-foreground transition-colors hover:text-primary">
                          {owner.full_name}
                        </span>
                        <span
                          className="mt-0.5 block truncate text-xs text-muted-foreground"
                          dir="ltr"
                        >
                          {owner.national_id || "بدون هوية"}
                        </span>
                      </div>
                    </Link>
                  </TableCell>

                  <TableCell className="px-5 py-4">
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <a
                            href={`mailto:${owner.email}`}
                            className="block max-w-56 truncate text-muted-foreground transition-colors hover:text-foreground"
                            dir="ltr"
                          />
                        }
                      >
                        {owner.email}
                      </TooltipTrigger>
                      <TooltipContent>فتح البريد</TooltipContent>
                    </Tooltip>
                  </TableCell>

                  <TableCell className="px-5 py-4">
                    {owner.phone ? (
                      <Tooltip>
                        <TooltipTrigger
                          render={
                            <a
                              href={`https://wa.me/${owner.phone.replace(/\D/g, "")}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-muted-foreground transition-colors hover:text-foreground"
                              dir="ltr"
                            />
                          }
                        >
                          {owner.phone}
                        </TooltipTrigger>
                        <TooltipContent>فتح واتساب</TooltipContent>
                      </Tooltip>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>

                  <TableCell className="px-5 py-4">
                    <Badge className={cn(badge.className)}>
                      {badge.label}
                    </Badge>
                  </TableCell>

                  <TableCell className="px-5 py-4 text-muted-foreground">
                    {owner.valid_until
                      ? formatDateShort(owner.valid_until)
                      : "—"}
                  </TableCell>

                  <TableCell className="px-3 py-4 text-end">
                    <OwnersActionsMenu
                      ownerId={owner.id}
                      isActive={owner.account_status === "active"}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
