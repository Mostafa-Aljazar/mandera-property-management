"use client";

import { useActionState, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  Copy,
  FileImage,
  IdCard,
  ImagePlus,
  Loader2,
  ShieldCheck,
  UserRound,
  UserPlus,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PhoneField } from "@/components/common/PhoneField";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";
import { useActionToast } from "@/hooks/use-action-toast";
import {
  createOwnerSchema,
  type CreateOwnerValues,
} from "@/validations/createOwner.schema";
import {
  createOwner,
  type CreateOwnerState,
} from "@/actions/admin/owners/createOwner.action";

const initialState: CreateOwnerState = { error: null, success: null };

const fieldClass =
  "h-12 rounded-2xl border-[#16445B]/12 bg-[#f7fafb] transition-all focus-visible:border-[#16445B]/30 focus-visible:bg-white focus-visible:ring-[#16445B]/15";

function SectionCard({
  step,
  icon: Icon,
  title,
  description,
  accent = "navy",
  children,
}: {
  step: string;
  icon: React.ElementType;
  title: string;
  description: string;
  accent?: "navy" | "red";
  children: React.ReactNode;
}) {
  const color = accent === "red" ? BRAND.red : BRAND.navy;

  return (
    <section className="overflow-hidden rounded-[1.5rem] border border-[#16445B]/8 bg-white shadow-[0_12px_40px_rgba(22,68,91,0.05)]">
      <div
        className="flex items-start gap-4 border-b border-[#16445B]/6 px-5 py-4 sm:px-6"
        style={{
          background: `linear-gradient(135deg, ${color}0F 0%, transparent 70%)`,
        }}
      >
        <div
          className="flex size-11 shrink-0 items-center justify-center rounded-2xl text-white shadow-sm"
          style={{ backgroundColor: color }}
        >
          <Icon className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wide text-white"
              style={{ backgroundColor: color }}
            >
              {step}
            </span>
            <h2
              className="text-lg font-bold cursor-text select-text"
              style={{ color: BRAND.navy }}
            >
              {title}
            </h2>
          </div>
          <p className="mt-1.5 text-sm leading-6 text-[#5b6b73] cursor-text select-text">
            {description}
          </p>
        </div>
      </div>
      <div className="space-y-5 px-5 py-5 sm:px-6 sm:py-6">{children}</div>
    </section>
  );
}

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
          className="text-xs leading-5 cursor-text select-text"
          style={{ color: willBePendingColor(hint) }}
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

function willBePendingColor(hint: string) {
  return hint.includes("منتهٍ") ? "#b45309" : "#8a969c";
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
          error ? "border-[#ED1B24]/40 bg-[#ED1B24]/04" : "border-[#16445B]/20 bg-[#f7fafb]",
        )}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
          style={{
            background: `radial-gradient(circle at top left, ${BRAND.red}14, transparent 55%)`,
          }}
        />
        {previewUrl ? (
          <div
            className={cn(
              "relative z-10 size-16 shrink-0 overflow-hidden ring-2 ring-offset-2",
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
              "relative z-10 flex size-16 shrink-0 items-center justify-center text-white shadow-md",
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
        <div className="relative z-10 min-w-0">
          <p className="text-sm font-bold" style={{ color: BRAND.navy }}>
            {hint}
          </p>
          <p className="mt-1 text-xs leading-5 text-[#8a969c]">
            JPG / PNG / WEBP — حتى 2MB
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

export default function NewOwnerPage() {
  const [state, formAction, pending] = useActionState(
    createOwner,
    initialState,
  );
  const [copied, setCopied] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [idPreview, setIdPreview] = useState<string | null>(null);

  useActionToast(pending, state, {
    successMessage: "تم إنشاء الحساب بنجاح",
    successDescription: "تم إنشاء حساب المالك — احفظ بيانات الدخول",
    errorTitle: "تعذر إنشاء الحساب",
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<CreateOwnerValues>({
    resolver: zodResolver(createOwnerSchema),
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      national_id: "",
      valid_until: "",
      company_name: "",
      city: "",
      notes: "",
    },
  });

  const validUntil = watch("valid_until");
  const willBePending = useMemo(() => {
    if (!validUntil) return false;
    return validUntil < new Date().toISOString().slice(0, 10);
  }, [validUntil]);

  function onSubmit(values: CreateOwnerValues) {
    const fd = new FormData();
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

  if (state.success) {
    const credentials = `الإيميل: ${state.success.email}\nكلمة المرور المؤقتة: ${state.success.password}`;

    return (
      <div className="relative w-full">
        <div
          className="overflow-hidden rounded-[1.75rem] border border-[#16445B]/10 bg-white shadow-[0_24px_60px_rgba(22,68,91,0.12)]"
        >
          <div
            className="relative px-7 py-8 text-white sm:px-10"
            style={{ backgroundColor: BRAND.navy }}
          >
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background: `radial-gradient(ellipse at top right, ${BRAND.red}55, transparent 45%)`,
              }}
            />
            <div className="relative flex items-center gap-3">
              <div
                className="flex size-12 items-center justify-center rounded-2xl"
                style={{ backgroundColor: BRAND.red }}
              >
                <CheckCircle2 className="size-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold cursor-text select-text">
                  تم إنشاء حساب المالك
                </h1>
                <p className="mt-1 text-sm text-white/70 cursor-text select-text">
                  انسخ بيانات الدخول الآن — تظهر مرة واحدة فقط.
                </p>
              </div>
            </div>
            {state.success.account_status === "pending" && (
              <p className="relative mt-4 rounded-xl bg-amber-400/15 px-4 py-2.5 text-sm font-semibold text-amber-100 cursor-text select-text">
                الحساب معلّق (pending) لأن تاريخ الصلاحية منتهٍ.
              </p>
            )}
          </div>

          <div className="grid gap-3 px-7 py-7 sm:grid-cols-2 sm:px-10">
            <div
              className="rounded-2xl border border-[#16445B]/8 bg-[#f7fafb] px-4 py-4"
              dir="ltr"
            >
              <p className="text-xs font-medium text-[#8a969c]">Email</p>
              <p className="mt-1 break-all font-mono text-sm font-semibold" style={{ color: BRAND.navy }}>
                {state.success.email}
              </p>
            </div>
            <div
              className="rounded-2xl border border-[#16445B]/8 bg-[#f7fafb] px-4 py-4"
              dir="ltr"
            >
              <p className="text-xs font-medium text-[#8a969c]">Password</p>
              <p className="mt-1 font-mono text-sm font-semibold" style={{ color: BRAND.navy }}>
                {state.success.password}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 border-t border-[#16445B]/6 px-7 py-5 sm:px-10">
            <button
              type="button"
              className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: BRAND.red }}
              onClick={() => {
                navigator.clipboard.writeText(credentials);
                setCopied(true);
              }}
            >
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              {copied ? "تم النسخ" : "نسخ البيانات"}
            </button>
            <Link
              href="/admin/owners"
              className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full border px-5 text-sm font-semibold transition-colors hover:bg-[#f7fafb]"
              style={{ borderColor: `${BRAND.navy}22`, color: BRAND.navy }}
            >
              قائمة الملاك
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full space-y-6 pb-2">
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-x-8 -top-10 h-80"
        style={{
          background: `radial-gradient(ellipse at top, ${BRAND.navy}14, transparent 55%), radial-gradient(ellipse at top left, ${BRAND.red}10, transparent 40%)`,
        }}
      />

      <div className="relative overflow-hidden rounded-[1.75rem] text-white shadow-[0_24px_60px_rgba(11,36,48,0.22)]">
        <div className="absolute inset-0" style={{ backgroundColor: BRAND.navy }}>
          <Image
            src="/hero-building.jpg"
            alt=""
            fill
            priority
            sizes="1152px"
            className="object-cover object-center opacity-30"
          />
          <div className="absolute inset-0 bg-linear-to-l from-[#0b2430] via-[#0b2430]/88 to-[#0b2430]/55" />
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(ellipse at top right, ${BRAND.red}40, transparent 42%)`,
            }}
          />
        </div>

        <div className="relative px-6 py-8 sm:px-9 sm:py-10">
          <Link
            href="/admin/owners"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-white/70 transition-colors hover:text-white"
          >
            <ArrowRight className="size-4" />
            رجوع للملاك
          </Link>

          <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                <ShieldCheck className="size-3.5" style={{ color: BRAND.red }} />
                مدير المنصة
              </div>
              <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight sm:text-4xl cursor-text select-text">
                إضافة مالك{" "}
                <span style={{ color: BRAND.red }}>جديد للمنصة</span>
              </h1>
              <p className="mt-4 text-sm leading-8 text-white/70 sm:text-[15px] cursor-text select-text">
                سيتم إنشاء حساب دخول وكلمة مرور مؤقتة تلقائياً. إذا كان تاريخ
                الصلاحية منتهياً، يُحفظ الحساب بحالة معلّق (pending).
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="rounded-2xl border border-white/12 bg-white/10 px-4 py-3 backdrop-blur-md">
                <p className="text-[11px] text-white/55">الحالة عند الانتهاء</p>
                <p className="mt-1 text-sm font-bold">
                  {willBePending ? "معلّق" : "نشط"}
                </p>
              </div>
              <div className="rounded-2xl border border-white/12 bg-white/10 px-4 py-3 backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <UserPlus className="size-4" style={{ color: BRAND.red }} />
                  <p className="text-sm font-bold">حساب جديد</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="relative space-y-5"
        noValidate
      >
        <SectionCard
          step="01"
          icon={UserRound}
          title="بيانات الحساب"
          description="المعلومات الأساسية لتسجيل دخول المالك إلى المنصة."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="الاسم الكامل"
              htmlFor="full_name"
              error={errors.full_name?.message}
              className="sm:col-span-2"
            >
              <Input
                id="full_name"
                className={fieldClass}
                aria-invalid={!!errors.full_name}
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
                className={cn(fieldClass, "text-start")}
                aria-invalid={!!errors.email}
                {...register("email")}
              />
            </Field>

            <Field
              label="رقم الهاتف (اختياري)"
              htmlFor="phone"
              error={errors.phone?.message}
            >
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
          </div>
        </SectionCard>

        <SectionCard
          step="02"
          icon={IdCard}
          title="الهوية والصلاحية"
          description="رقم الهوية وتاريخ انتهاء صلاحية الحساب على المنصة."
          accent="red"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="رقم الهوية"
              htmlFor="national_id"
              error={errors.national_id?.message}
            >
              <Input
                id="national_id"
                dir="ltr"
                className={cn(fieldClass, "text-start")}
                aria-invalid={!!errors.national_id}
                {...register("national_id")}
              />
            </Field>

            <Field
              label="صالح حتى"
              htmlFor="valid_until"
              error={errors.valid_until?.message}
              hint={
                willBePending
                  ? "التاريخ منتهٍ — سيُحفظ بحالة معلّق (pending)"
                  : "إذا انتهى التاريخ يصبح الحساب معلّقاً تلقائياً"
              }
            >
              <Input
                id="valid_until"
                type="date"
                className={fieldClass}
                aria-invalid={!!errors.valid_until}
                {...register("valid_until")}
              />
            </Field>
          </div>
        </SectionCard>

        <SectionCard
          step="03"
          icon={Building2}
          title="معلومات إضافية"
          description="بيانات اختيارية تساعد في تنظيم حسابات الملاك."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="اسم الشركة / المكتب (اختياري)" htmlFor="company_name">
              <Input
                id="company_name"
                className={fieldClass}
                {...register("company_name")}
              />
            </Field>

            <Field label="المدينة (اختياري)" htmlFor="city">
              <Input id="city" className={fieldClass} {...register("city")} />
            </Field>

            <Field
              label="ملاحظات داخلية (اختياري)"
              htmlFor="notes"
              className="sm:col-span-2"
            >
              <textarea
                id="notes"
                rows={3}
                className="w-full rounded-2xl border border-[#16445B]/12 bg-[#f7fafb] px-3.5 py-3 text-sm outline-none transition-all focus-visible:border-[#16445B]/30 focus-visible:bg-white focus-visible:ring-[3px] focus-visible:ring-[#16445B]/15"
                {...register("notes")}
              />
            </Field>
          </div>
        </SectionCard>

        <SectionCard
          step="04"
          icon={FileImage}
          title="المرفقات"
          description="صورة شخصية ومستند الهوية — اختياريان."
          accent="red"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <FilePicker
              label="الصورة الشخصية (اختياري)"
              hint={avatarPreview ? "تغيير الصورة" : "اختر صورة شخصية"}
              previewUrl={avatarPreview}
              error={errors.avatar?.message}
              onPick={(file) => {
                setValue("avatar", file, { shouldValidate: true });
                setAvatarPreview(file ? URL.createObjectURL(file) : null);
              }}
            />
            <FilePicker
              label="مستند الهوية (اختياري)"
              hint={idPreview ? "تغيير المستند" : "ارفع صورة الهوية"}
              previewUrl={idPreview}
              error={errors.id_document?.message}
              rounded="xl"
              onPick={(file) => {
                setValue("id_document", file, { shouldValidate: true });
                setIdPreview(file ? URL.createObjectURL(file) : null);
              }}
            />
          </div>
        </SectionCard>

        {state.error && (
          <Alert variant="destructive">
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col-reverse gap-3 rounded-[1.5rem] border border-[#16445B]/8 bg-white p-4 shadow-[0_12px_40px_rgba(22,68,91,0.05)] sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <Link
            href="/admin/owners"
            className="inline-flex h-12 items-center justify-center rounded-full border px-6 text-sm font-semibold transition-colors hover:bg-[#f7fafb]"
            style={{ borderColor: `${BRAND.navy}22`, color: BRAND.navy }}
          >
            إلغاء
          </Link>
          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full px-8 text-sm font-semibold text-white transition-opacity hover:opacity-95 disabled:opacity-60"
            style={{ backgroundColor: BRAND.red }}
          >
            {pending && <Loader2 className="size-4 animate-spin" />}
            {pending ? "جارِ الإنشاء..." : "إنشاء الحساب"}
          </button>
        </div>
      </form>
    </div>
  );
}
