"use client";

import { useState, useTransition } from "react";
import { Ban, CheckCircle2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";
import { deleteOwner } from "@/actions/admin/owners/deleteOwner.action";
import { toggleOwnerActive } from "@/actions/admin/owners/toggleOwnerActive.action";

type ActionVariant = "button" | "menu";

export function ToggleActiveForm({
  ownerId,
  isActive,
  variant = "button",
}: {
  ownerId: string;
  isActive: boolean;
  variant?: ActionVariant;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function onConfirm() {
    setOpen(false);
    const formData = new FormData();
    formData.set("ownerId", ownerId);
    formData.set("nextActive", (!isActive).toString());

    startTransition(async () => {
      const result = await toggleOwnerActive(formData);
      if (result.success) {
        toast.success("تم التعديل بنجاح", {
          description: isActive
            ? "تم تعطيل حساب المالك"
            : "تم تفعيل حساب المالك",
        });
        return;
      }
      toast.error("تعذر تحديث الحساب", {
        description: result.error ?? "حدث خطأ غير متوقع",
      });
    });
  }

  const triggerClass =
    variant === "menu"
      ? cn(
          "group flex w-full items-center gap-3 rounded-xl px-2 py-2 text-sm font-semibold transition-all duration-150 disabled:opacity-60",
          isActive
            ? "text-[#b45309] hover:bg-[#f59e0b12]"
            : "text-[#15803d] hover:bg-[#16a34a12]",
        )
      : "inline-flex h-9 items-center gap-1.5 rounded-full border border-[#16445B]/15 bg-white px-3 text-xs font-semibold text-[#16445B] transition-colors hover:border-[#16445B]/30 hover:bg-[#f7fafb] disabled:opacity-60";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <button type="button" disabled={pending} className={triggerClass} />
        }
      >
        {variant === "menu" ? (
          <span
            className="flex size-8 shrink-0 items-center justify-center rounded-xl"
            style={{
              backgroundColor: isActive ? "#f59e0b14" : "#16a34a14",
              color: isActive ? "#b45309" : "#15803d",
            }}
          >
            {isActive ? (
              <Ban className="size-4" />
            ) : (
              <CheckCircle2 className="size-4" />
            )}
          </span>
        ) : isActive ? (
          <Ban className="size-4 shrink-0 opacity-80" />
        ) : (
          <CheckCircle2 className="size-4 shrink-0 opacity-80" />
        )}
        {pending
          ? "جارٍ..."
          : variant === "menu"
            ? isActive
              ? "تعطيل"
              : "تفعيل"
            : isActive
              ? "تعطيل الحساب"
              : "تفعيل الحساب"}
      </DialogTrigger>

      <DialogContent
        showCloseButton={false}
        className="gap-0 overflow-hidden rounded-2xl border border-[#16445B]/10 bg-white p-0 shadow-[0_20px_50px_rgba(15,42,55,0.16)] sm:max-w-md"
      >
        <div
          className="h-1.5 w-full"
          style={{
            background: `linear-gradient(90deg, ${BRAND.navy}, ${BRAND.red})`,
          }}
        />
        <DialogHeader className="gap-2 px-5 pt-5 sm:px-6 sm:pt-6">
          <div
            className="flex size-11 items-center justify-center rounded-2xl"
            style={{
              backgroundColor: isActive ? `${BRAND.navy}12` : `${BRAND.red}12`,
              color: isActive ? BRAND.navy : BRAND.red,
            }}
          >
            {isActive ? (
              <Ban className="size-5" />
            ) : (
              <CheckCircle2 className="size-5" />
            )}
          </div>
          <DialogTitle
            className="text-lg font-bold"
            style={{ color: BRAND.navy }}
          >
            {isActive ? "تعطيل حساب المالك؟" : "تفعيل حساب المالك؟"}
          </DialogTitle>
          <DialogDescription className="text-sm leading-7 text-[#5b6b73]">
            {isActive
              ? "سيُمنع فوراً من الدخول عبر تطبيق الموبايل."
              : "سيُسمح له من جديد بالدخول عبر تطبيق الموبايل."}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mx-0 mb-0 border-t border-[#16445B]/08 bg-[#f7fafb] p-4 sm:justify-end sm:gap-2 sm:px-6 sm:py-4">
          <DialogClose
            render={
              <button
                type="button"
                className="inline-flex h-10 items-center justify-center rounded-full border border-[#16445B]/15 bg-white px-5 text-sm font-semibold text-[#16445B] transition-colors hover:bg-white/80"
              />
            }
          >
            إلغاء
          </DialogClose>
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex h-10 items-center justify-center rounded-full px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: isActive ? BRAND.navy : BRAND.red }}
          >
            تأكيد
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteOwnerForm({
  ownerId,
  variant = "button",
}: {
  ownerId: string;
  variant?: ActionVariant;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function onConfirm() {
    setOpen(false);
    const formData = new FormData();
    formData.set("ownerId", ownerId);

    startTransition(async () => {
      const result = await deleteOwner(formData);
      if (result.success) {
        toast.success("تم الحذف بنجاح", {
          description: "تم حذف حساب المالك (حذف ناعم)",
        });
        return;
      }
      toast.error("تعذر حذف الحساب", {
        description: result.error ?? "حدث خطأ غير متوقع",
      });
    });
  }

  const triggerClass =
    variant === "menu"
      ? "group flex w-full items-center gap-3 rounded-xl px-2 py-2 text-sm font-semibold text-[#ED1B24] transition-all duration-150 hover:bg-[#ED1B24]/08 disabled:opacity-60"
      : undefined;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <button
            type="button"
            disabled={pending}
            className={
              triggerClass ??
              "inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition-colors hover:opacity-90 disabled:opacity-60"
            }
            style={
              variant === "button"
                ? {
                    borderColor: `${BRAND.red}33`,
                    backgroundColor: `${BRAND.red}0F`,
                    color: BRAND.red,
                  }
                : undefined
            }
          />
        }
      >
        {variant === "menu" ? (
          <span
            className="flex size-8 shrink-0 items-center justify-center rounded-xl"
            style={{
              backgroundColor: `${BRAND.red}12`,
              color: BRAND.red,
            }}
          >
            <Trash2 className="size-4" />
          </span>
        ) : (
          <Trash2 className="size-4 shrink-0 opacity-80" />
        )}
        {pending ? "جارٍ..." : "حذف"}
      </DialogTrigger>

      <DialogContent
        showCloseButton={false}
        className="gap-0 overflow-hidden rounded-2xl border border-[#ED1B24]/15 bg-white p-0 shadow-[0_20px_50px_rgba(15,42,55,0.16)] sm:max-w-md"
      >
        <div className="h-1.5 w-full" style={{ backgroundColor: BRAND.red }} />
        <DialogHeader className="gap-2 px-5 pt-5 sm:px-6 sm:pt-6">
          <div
            className="flex size-11 items-center justify-center rounded-2xl"
            style={{
              backgroundColor: `${BRAND.red}12`,
              color: BRAND.red,
            }}
          >
            <Trash2 className="size-5" />
          </div>
          <DialogTitle
            className="text-lg font-bold"
            style={{ color: BRAND.navy }}
          >
            حذف حساب المالك؟
          </DialogTitle>
          <DialogDescription className="text-sm leading-7 text-[#5b6b73]">
            سيتم إيقاف حساب المالك ومنعه من الدخول نهائياً. بيانات الحساب
            والعقارات تبقى محفوظة في النظام للأرشفة والمتابعة.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mx-0 mb-0 border-t border-[#16445B]/08 bg-[#f7fafb] p-4 sm:justify-end sm:gap-2 sm:px-6 sm:py-4">
          <DialogClose
            render={
              <button
                type="button"
                className="inline-flex h-10 items-center justify-center rounded-full border border-[#16445B]/15 bg-white px-5 text-sm font-semibold text-[#16445B] transition-colors hover:bg-white/80"
              />
            }
          >
            إلغاء
          </DialogClose>
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex h-10 items-center justify-center rounded-full px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: BRAND.red }}
          >
            حذف
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
