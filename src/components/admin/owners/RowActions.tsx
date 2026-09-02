"use client";

import { useState, useTransition } from "react";
import { Ban, CheckCircle2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
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

  return (
    <>
      {variant === "menu" ? (
        <DropdownMenuItem
          closeOnClick={false}
          onClick={() => setOpen(true)}
          disabled={pending}
        >
          {isActive ? <Ban /> : <CheckCircle2 />}
          {isActive ? "تعطيل" : "تفعيل"}
        </DropdownMenuItem>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={pending}
          onClick={() => setOpen(true)}
        >
          {isActive ? <Ban /> : <CheckCircle2 />}
          {pending ? "جارٍ..." : isActive ? "تعطيل الحساب" : "تفعيل الحساب"}
        </Button>
      )}

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isActive ? "تعطيل حساب المالك؟" : "تفعيل حساب المالك؟"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isActive
                ? "سيُمنع فوراً من الدخول عبر تطبيق الموبايل."
                : "سيُسمح له من جديد بالدخول عبر تطبيق الموبايل."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={onConfirm}>تأكيد</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
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

  return (
    <>
      {variant === "menu" ? (
        <DropdownMenuItem
          variant="destructive"
          closeOnClick={false}
          onClick={() => setOpen(true)}
          disabled={pending}
        >
          <Trash2 />
          حذف
        </DropdownMenuItem>
      ) : (
        <Button
          type="button"
          variant="destructive"
          size="sm"
          disabled={pending}
          onClick={() => setOpen(true)}
        >
          <Trash2 />
          {pending ? "جارٍ..." : "حذف"}
        </Button>
      )}

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف حساب المالك؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم إيقاف حساب المالك ومنعه من الدخول نهائياً. بيانات الحساب
              والعقارات تبقى محفوظة في النظام للأرشفة والمتابعة.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={onConfirm}>
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
