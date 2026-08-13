"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRight,
  Building2,
  FileImage,
  IdCard,
  ImagePlus,
  Loader2,
  Pencil,
  UserRound,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneField } from "@/components/common/PhoneField";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";
import { useActionToast } from "@/hooks/use-action-toast";
import {
  updateOwnerSchema,
  type UpdateOwnerValues,
} from "@/validations/updateOwner.schema";
import {
  updateOwner,
  type UpdateOwnerState,
} from "@/actions/admin/owners/updateOwner.action";

const initialState: UpdateOwnerState = {
  error: null,
  success: false,
  updatedAt: null,
};

const fieldClass =
  "h-12 rounded-2xl border-[#16445B]/12 bg-[#f7fafb] transition-all focus-visible:border-[#16445B]/30 focus-visible:bg-white focus-visible:ring-[#16445B]/15";

export type EditOwnerInitial = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  national_id: string | null;
  valid_until: string | null;
  company_name: string | null;
  city: string | null;
  notes: string | null;
  avatar_url: string | null;
  id_document_url: string | null;
};

function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
  className,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={htmlFor} className="text-[13px] text-[#16445B]">
        {label}
      </Label>
      {children}
      {hint && !error ? (
        <p
          className="text-xs leading-5"
          style={{ color: hint.includes("منتهٍ") ? "#b45309" : "#8a969c" }}
        >
          {hint}
        </p>
      ) : null}
      {error ? (
        <p className="text-xs font-medium" style={{ color: BRAND.red }}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

function FilePicker({
  label,
  hint,
  previewUrl,
  error,
  onPick,
  rounded = "full",
}: {
  label: string;
  hint: string;
  previewUrl: string | null;
  error?: string;
  onPick: (file: File | undefined) => void;
  rounded?: "full" | "xl";
}) {
  return (
    <div className="space-y-2">
      <Label className="text-[13px] text-[#16445B]">{label}</Label>
      <label
        className={cn(
          "group relative flex cursor-pointer items-center gap-4 overflow-hidden rounded-2xl border border-dashed p-4 transition-all",
          "hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(22,68,91,0.1)]",
          error
            ? "border-[#ED1B24]/40 bg-[#ED1B24]/04"
            : "border-[#16445B]/20 bg-[#f7fafb]",
        )}
      >
        {previewUrl ? (
          <div
            className={cn(
              "relative size-16 shrink-0 overflow-hidden ring-2 ring-offset-2",
              rounded === "full" ? "rounded-full" : "rounded-xl",
            )}
            style={{ ["--tw-ring-color" as string]: `${BRAND.navy}30` }}
          >
            <Image
              src={previewUrl}
              alt=""
              fill
              unoptimized
              className="object-cover"
            />
          </div>
        ) : (
          <div
            className={cn(
              "flex size-16 shrink-0 items-center justify-center text-white shadow-md",
              rounded === "full" ? "rounded-full" : "rounded-xl",
            )}
            style={{
              background: `linear-gradient(145deg, ${BRAND.navy}, #0b2430)`,
            }}
          >
            {rounded === "full" ? (
              <ImagePlus className="size-5" />
            ) : (
              <FileImage className="size-5" />
            )}
          </div>
        )}
        <div className="min-w-0">
          <p className="text-sm font-bold" style={{ color: BRAND.navy }}>
            {hint}
          </p>
          <p className="mt-1 text-xs leading-5 text-[#8a969c]">
            JPG / PNG / WEBP — حتى 2MB · اختياري
          </p>
        </div>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => onPick(e.target.files?.[0])}
        />
      </label>
      {error ? (
        <p className="text-xs font-medium" style={{ color: BRAND.red }}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function EditOwnerForm({ owner }: { owner: EditOwnerInitial }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    updateOwner,
    initialState,
  );
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    owner.avatar_url,
  );
  const [idPreview, setIdPreview] = useState<string | null>(
    owner.id_document_url,
  );

  useActionToast(pending, state, {
    successMessage: "تم التعديل بنجاح",
    successDescription: "تم تحديث بيانات المالك",
    errorTitle: "تعذر تحديث الحساب",
  });

  const redirectedAt = useRef<number | null>(null);
  useEffect(() => {
    if (!state.success || !state.updatedAt) return;
    if (redirectedAt.current === state.updatedAt) return;
    redirectedAt.current = state.updatedAt;
    router.replace(`/admin/owners/${owner.id}`);
  }, [state.success, state.updatedAt, owner.id, router]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<UpdateOwnerValues>({
    resolver: zodResolver(updateOwnerSchema),
    defaultValues: {
      ownerId: owner.id,
      full_name: owner.full_name,
      email: owner.email ?? "",
      phone: owner.phone ?? "",
      national_id: owner.national_id ?? "",
      valid_until: owner.valid_until ?? "",
      company_name: owner.company_name ?? "",
      city: owner.city ?? "",
      notes: owner.notes ?? "",
    },
  });

  const validUntil = watch("valid_until");
  const willBePending = useMemo(() => {
    if (!validUntil) return false;
    return validUntil < new Date().toISOString().slice(0, 10);
  }, [validUntil]);

  function onSubmit(values: UpdateOwnerValues) {
    const fd = new FormData();
    fd.set("ownerId", values.ownerId);
    fd.set("full_name", values.full_name);
    fd.set("email", values.email);
    fd.set("phone", values.phone ?? "");
    fd.set("national_id", values.national_id);
    fd.set("valid_until", values.valid_until);
    fd.set("company_name", values.company_name ?? "");
    fd.set("city", values.city ?? "");
    fd.set("notes", values.notes ?? "");
    if (values.avatar) fd.set("avatar", values.avatar);
    if (values.id_document) fd.set("id_document", values.id_document);
    formAction(fd);
  }

  return (
    <div className="relative w-full space-y-5 sm:space-y-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href={`/admin/owners/${owner.id}`}
            className="mb-2 inline-flex items-center gap-1.5 text-sm font-medium text-[#5b6b73] transition-colors hover:text-[#16445B]"
          >
            <ArrowRight className="size-4" />
            العودة لملف المالك
          </Link>
          <h1
            className="flex items-center gap-2 text-2xl font-bold"
            style={{ color: BRAND.navy }}
          >
            <Pencil className="size-6 opacity-80" />
            تعديل المالك
          </h1>
          <p className="mt-1 text-sm text-[#5b6b73]">{owner.full_name}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <input type="hidden" {...register("ownerId")} />

        <section className="overflow-hidden rounded-[1.5rem] border border-[#16445B]/8 bg-white shadow-[0_12px_40px_rgba(22,68,91,0.05)]">
          <div
            className="flex items-start gap-4 border-b border-[#16445B]/6 px-5 py-4 sm:px-6"
            style={{
              background: `linear-gradient(135deg, ${BRAND.navy}0F 0%, transparent 70%)`,
            }}
          >
            <div
              className="flex size-11 shrink-0 items-center justify-center rounded-2xl text-white"
              style={{ backgroundColor: BRAND.navy }}
            >
              <UserRound className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold" style={{ color: BRAND.navy }}>
                البيانات الأساسية
              </h2>
              <p className="mt-1 text-sm text-[#5b6b73]">
                الاسم والتواصل وصلاحية الحساب
              </p>
            </div>
          </div>

          <div className="grid gap-5 px-5 py-5 sm:grid-cols-2 sm:px-6 sm:py-6">
            <Field
              label="الاسم الكامل"
              htmlFor="full_name"
              error={errors.full_name?.message}
            >
              <Input
                id="full_name"
                className={fieldClass}
                {...register("full_name")}
              />
            </Field>

            <Field
              label="البريد الإلكتروني"
              htmlFor="email"
              error={errors.email?.message}
            >
              <Input
                id="email"
                type="email"
                dir="ltr"
                className={fieldClass}
                {...register("email")}
              />
            </Field>

            <Field label="الهاتف" error={errors.phone?.message}>
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <PhoneField
                    id="phone"
                    value={field.value || undefined}
                    onChange={(value) => field.onChange(value ?? "")}
                    onBlur={field.onBlur}
                    invalid={!!errors.phone}
                    className="h-12 rounded-2xl border-[#16445B]/12 bg-[#f7fafb]"
                  />
                )}
              />
            </Field>

            <Field
              label="رقم الهوية"
              htmlFor="national_id"
              error={errors.national_id?.message}
            >
              <Input
                id="national_id"
                dir="ltr"
                className={fieldClass}
                {...register("national_id")}
              />
            </Field>

            <Field
              label="صلاحية الحساب حتى"
              htmlFor="valid_until"
              error={errors.valid_until?.message}
              hint={
                willBePending
                  ? "تاريخ منتهٍ — سيصبح الحساب معلّقاً"
                  : undefined
              }
            >
              <Input
                id="valid_until"
                type="date"
                dir="ltr"
                className={fieldClass}
                {...register("valid_until")}
              />
            </Field>

            <Field
              label="المدينة"
              htmlFor="city"
              error={errors.city?.message}
            >
              <Input id="city" className={fieldClass} {...register("city")} />
            </Field>

            <Field
              label="اسم الشركة"
              htmlFor="company_name"
              error={errors.company_name?.message}
              className="sm:col-span-2"
            >
              <div className="relative">
                <Building2 className="pointer-events-none absolute inset-s-3 top-1/2 size-4 -translate-y-1/2 text-[#8a969c]" />
                <Input
                  id="company_name"
                  className={cn(fieldClass, "ps-10")}
                  {...register("company_name")}
                />
              </div>
            </Field>

            <Field
              label="ملاحظات داخلية"
              htmlFor="notes"
              error={errors.notes?.message}
              className="sm:col-span-2"
            >
              <textarea
                id="notes"
                rows={3}
                className="w-full rounded-2xl border border-[#16445B]/12 bg-[#f7fafb] px-3 py-3 text-sm outline-none transition-all focus:border-[#16445B]/30 focus:bg-white focus:ring-2 focus:ring-[#16445B]/15"
                {...register("notes")}
              />
            </Field>
          </div>
        </section>

        <section className="overflow-hidden rounded-[1.5rem] border border-[#16445B]/8 bg-white shadow-[0_12px_40px_rgba(22,68,91,0.05)]">
          <div
            className="flex items-start gap-4 border-b border-[#16445B]/6 px-5 py-4 sm:px-6"
            style={{
              background: `linear-gradient(135deg, ${BRAND.red}0F 0%, transparent 70%)`,
            }}
          >
            <div
              className="flex size-11 shrink-0 items-center justify-center rounded-2xl text-white"
              style={{ backgroundColor: BRAND.red }}
            >
              <IdCard className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold" style={{ color: BRAND.navy }}>
                المستندات
              </h2>
              <p className="mt-1 text-sm text-[#5b6b73]">
                اترك الحقل فارغاً للإبقاء على الملف الحالي
              </p>
            </div>
          </div>

          <div className="grid gap-5 px-5 py-5 sm:grid-cols-2 sm:px-6 sm:py-6">
            <FilePicker
              label="الصورة الشخصية"
              hint={avatarPreview ? "تغيير الصورة" : "رفع صورة"}
              previewUrl={avatarPreview}
              error={errors.avatar?.message as string | undefined}
              onPick={(file) => {
                setValue("avatar", file, { shouldValidate: true });
                setAvatarPreview(
                  file ? URL.createObjectURL(file) : owner.avatar_url,
                );
              }}
            />
            <FilePicker
              label="مستند الهوية"
              hint={idPreview ? "تغيير المستند" : "رفع مستند"}
              previewUrl={idPreview}
              rounded="xl"
              error={errors.id_document?.message as string | undefined}
              onPick={(file) => {
                setValue("id_document", file, { shouldValidate: true });
                setIdPreview(
                  file ? URL.createObjectURL(file) : owner.id_document_url,
                );
              }}
            />
          </div>
        </section>

        <div className="flex flex-wrap items-center justify-end gap-3">
          <Link
            href={`/admin/owners/${owner.id}`}
            className="inline-flex h-11 items-center justify-center rounded-full border border-[#16445B]/15 bg-white px-5 text-sm font-semibold text-[#16445B] transition-colors hover:bg-[#f7fafb]"
          >
            إلغاء
          </Link>
          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: BRAND.navy }}
          >
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                جارٍ الحفظ...
              </>
            ) : (
              "حفظ التعديلات"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
