"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Eye,
  MoreVertical,
  Pencil,
  Settings2,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DeleteOwnerForm,
  ToggleActiveForm,
} from "@/components/admin/owners/RowActions";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";

function ActionIcon({
  children,
  tone = "navy",
}: {
  children: React.ReactNode;
  tone?: "navy" | "amber" | "green" | "red";
}) {
  const tones = {
    navy: { bg: `${BRAND.navy}12`, color: BRAND.navy },
    amber: { bg: "#f59e0b14", color: "#b45309" },
    green: { bg: "#16a34a14", color: "#15803d" },
    red: { bg: `${BRAND.red}12`, color: BRAND.red },
  } as const;
  const t = tones[tone];

  return (
    <span
      className="flex size-8 shrink-0 items-center justify-center rounded-xl"
      style={{ backgroundColor: t.bg, color: t.color }}
    >
      {children}
    </span>
  );
}

const itemClass =
  "group flex w-full items-center gap-3 rounded-xl px-2 py-2 text-sm font-semibold transition-all duration-150";

export function OwnersActionsMenu({
  ownerId,
  isActive,
}: {
  ownerId: string;
  isActive: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            aria-label="المزيد من الإجراءات"
            className={cn(
              "inline-flex size-8 items-center justify-center rounded-xl text-[#5b6b73] transition-all",
              "hover:bg-[#16445B]/08 hover:text-[#16445B]",
              "data-[popup-open]:bg-[#16445B]/10 data-[popup-open]:text-[#16445B]",
            )}
          />
        }
      >
        <MoreVertical className="size-4" />
      </PopoverTrigger>

      <PopoverContent
        align="end"
        side="bottom"
        sideOffset={8}
        className="w-[13.5rem] gap-0 overflow-hidden rounded-2xl border-0 bg-white p-0 shadow-[0_20px_50px_rgba(15,42,55,0.18)] ring-1 ring-[#16445B]/10"
      >
        <div
          className="relative px-3.5 py-3"
          style={{
            background: `linear-gradient(135deg, ${BRAND.navy}0F 0%, ${BRAND.red}08 100%)`,
          }}
        >
          <div className="flex items-center gap-2.5">
            <span
              className="flex size-8 items-center justify-center rounded-xl text-white shadow-sm"
              style={{
                background: `linear-gradient(145deg, ${BRAND.navy}, #0d2f3f)`,
              }}
            >
              <Settings2 className="size-4" />
            </span>
            <div className="min-w-0">
              <p
                className="text-sm font-bold leading-none"
                style={{ color: BRAND.navy }}
              >
                إجراءات
              </p>
              <p className="mt-1 text-[11px] text-[#8a969c]">إدارة الحساب</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-0.5 p-1.5">
          <Link
            href={`/admin/owners/${ownerId}`}
            onClick={() => setOpen(false)}
            className={cn(itemClass, "text-[#16445B] hover:bg-[#16445B]/06")}
          >
            <ActionIcon tone="navy">
              <Eye className="size-4" />
            </ActionIcon>
            فتح
          </Link>

          <Link
            href={`/admin/owners/${ownerId}/edit`}
            onClick={() => setOpen(false)}
            className={cn(itemClass, "text-[#16445B] hover:bg-[#16445B]/06")}
          >
            <ActionIcon tone="navy">
              <Pencil className="size-4" />
            </ActionIcon>
            تعديل
          </Link>

          <div className="mx-2 my-1 h-px bg-[#16445B]/08" />

          <ToggleActiveForm
            ownerId={ownerId}
            isActive={isActive}
            variant="menu"
          />

          <DeleteOwnerForm ownerId={ownerId} variant="menu" />
        </div>
      </PopoverContent>
    </Popover>
  );
}
