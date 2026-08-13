"use client";

import { useActionState, useState } from "react";
import { KeyRound, Loader2, UserRound } from "lucide-react";
import { PasswordInput } from "@/components/common/PasswordInput";
import { PhoneField } from "@/components/common/PhoneField";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  changePassword,
  type ChangePasswordState,
} from "@/actions/admin/profile/changePassword.action";
import {
  updateProfile,
  type UpdateProfileState,
} from "@/actions/admin/profile/updateProfile.action";
import { useActionToast } from "@/hooks/use-action-toast";
import { BRAND } from "@/lib/brand";

const profileInitialState: UpdateProfileState = { error: null, success: false };
const passwordInitialState: ChangePasswordState = {
  error: null,
  success: false,
};

const fieldClass =
  "h-12 rounded-2xl border-[#16445B]/12 bg-[#f7fafb] transition-all focus-visible:border-[#16445B]/30 focus-visible:bg-white focus-visible:ring-[#16445B]/15";

function Section({
  icon: Icon,
  title,
  description,
  accent = "navy",
  children,
}: {
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
        className="flex items-start gap-3 border-b border-[#16445B]/6 px-4 py-4 sm:gap-4 sm:px-6"
        style={{
          background: `linear-gradient(135deg, ${color}0F 0%, transparent 70%)`,
        }}
      >
        <div
          className="flex size-10 shrink-0 items-center justify-center rounded-2xl text-white shadow-sm sm:size-11"
          style={{ backgroundColor: color }}
        >
          <Icon className="size-5" />
        </div>
        <div className="min-w-0">
          <h2 className="text-base font-bold sm:text-lg" style={{ color: BRAND.navy }}>
            {title}
          </h2>
          <p className="mt-1 text-sm leading-6 text-[#5b6b73]">{description}</p>
        </div>
      </div>
      <div className="px-4 py-5 sm:px-6 sm:py-6">{children}</div>
    </section>
  );
}

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor} className="text-[13px] text-[#16445B]">
        {label}
      </Label>
      {children}
      {hint ? (
        <p className="text-xs leading-5 text-[#8a969c]">{hint}</p>
      ) : null}
    </div>
  );
}

export function ProfileForm({
  fullName,
  phone,
  email,
}: {
  fullName: string;
  phone: string | null;
  email: string | null;
}) {
  const [state, formAction, pending] = useActionState(
    updateProfile,
    profileInitialState,
  );
  const [phoneValue, setPhoneValue] = useState(phone ?? "");

  useActionToast(pending, state, {
    successMessage: "تم التعديل بنجاح",
    successDescription: "تم حفظ البيانات الشخصية",
    errorTitle: "تعذر حفظ الملف الشخصي",
  });

  return (
    <Section
      icon={UserRound}
      title="البيانات الشخصية"
      description="الاسم ورقم الهاتف الظاهران في لوحة التحكم"
    >
      <form action={formAction} className="grid gap-5 sm:grid-cols-2">
        <Field
          label="البريد الإلكتروني"
          htmlFor="email_ro"
          hint="لا يمكن تغيير البريد من هنا"
        >
          <Input
            id="email_ro"
            type="email"
            value={email ?? ""}
            disabled
            dir="ltr"
            className={fieldClass}
          />
        </Field>

        <Field label="الاسم الكامل" htmlFor="full_name">
          <Input
            id="full_name"
            name="full_name"
            type="text"
            defaultValue={fullName}
            required
            className={fieldClass}
          />
        </Field>

        <Field label="رقم الهاتف" htmlFor="phone">
          <input type="hidden" name="phone" value={phoneValue} />
          <PhoneField
            id="phone"
            value={phoneValue || undefined}
            onChange={(value) => setPhoneValue(value ?? "")}
            className="h-12 rounded-2xl border-[#16445B]/12 bg-[#f7fafb]"
          />
        </Field>

        <div className="flex items-end justify-end sm:col-span-2">
          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60 sm:w-auto"
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
    </Section>
  );
}

export function PasswordForm() {
  const [state, formAction, pending] = useActionState(
    changePassword,
    passwordInitialState,
  );

  useActionToast(pending, state, {
    successMessage: "تم التعديل بنجاح",
    successDescription: "تم تغيير كلمة المرور",
    errorTitle: "تعذر تغيير كلمة المرور",
  });

  return (
    <Section
      icon={KeyRound}
      title="تغيير كلمة المرور"
      description="استخدم كلمة مرور قوية لا تقل عن 8 أحرف"
      accent="red"
    >
      <form
        action={formAction}
        className="grid gap-5 sm:grid-cols-2"
        key={state.success ? "reset" : "form"}
      >
        <Field label="كلمة المرور الحالية" htmlFor="current_password">
          <PasswordInput
            id="current_password"
            name="current_password"
            autoComplete="current-password"
            className={fieldClass}
          />
        </Field>

        <Field label="كلمة المرور الجديدة" htmlFor="new_password">
          <PasswordInput
            id="new_password"
            name="new_password"
            autoComplete="new-password"
            className={fieldClass}
          />
        </Field>

        <Field label="تأكيد كلمة المرور الجديدة" htmlFor="confirm_password">
          <PasswordInput
            id="confirm_password"
            name="confirm_password"
            autoComplete="new-password"
            className={fieldClass}
          />
        </Field>

        <div className="flex items-end justify-end sm:col-span-2">
          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60 sm:w-auto"
            style={{ backgroundColor: BRAND.red }}
          >
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                جارٍ التغيير...
              </>
            ) : (
              "تغيير كلمة المرور"
            )}
          </button>
        </div>
      </form>
    </Section>
  );
}
