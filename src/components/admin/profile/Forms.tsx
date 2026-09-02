"use client";

import { useActionState, useState } from "react";
import { Loader2 } from "lucide-react";
import { PasswordInput } from "@/components/common/PasswordInput";
import { PhoneField } from "@/components/common/PhoneField";
import { Button } from "@/components/ui/button";
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

const profileInitialState: UpdateProfileState = { error: null, success: false };
const passwordInitialState: ChangePasswordState = {
  error: null,
  success: false,
};

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
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint ? (
        <p className="text-xs leading-5 text-muted-foreground">{hint}</p>
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
    <form action={formAction} className="grid gap-5 sm:grid-cols-2">
      <Field
        label="البريد الإلكتروني"
        htmlFor="email_ro"
        hint="لا يمكن تغيير البريد من هنا"
      >
        <Input id="email_ro" type="email" value={email ?? ""} disabled dir="ltr" />
      </Field>

      <Field label="الاسم الكامل" htmlFor="full_name">
        <Input
          id="full_name"
          name="full_name"
          type="text"
          defaultValue={fullName}
          required
        />
      </Field>

      <Field label="رقم الهاتف" htmlFor="phone">
        <input type="hidden" name="phone" value={phoneValue} />
        <PhoneField
          id="phone"
          value={phoneValue || undefined}
          onChange={(value) => setPhoneValue(value ?? "")}
        />
      </Field>

      <div className="flex items-end justify-end sm:col-span-2">
        <Button type="submit" disabled={pending} className="w-full sm:w-auto">
          {pending && <Loader2 className="animate-spin" />}
          {pending ? "جارٍ الحفظ..." : "حفظ التعديلات"}
        </Button>
      </div>
    </form>
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
        />
      </Field>

      <Field label="كلمة المرور الجديدة" htmlFor="new_password">
        <PasswordInput
          id="new_password"
          name="new_password"
          autoComplete="new-password"
        />
      </Field>

      <Field label="تأكيد كلمة المرور الجديدة" htmlFor="confirm_password">
        <PasswordInput
          id="confirm_password"
          name="confirm_password"
          autoComplete="new-password"
        />
      </Field>

      <div className="flex items-end justify-end sm:col-span-2">
        <Button type="submit" disabled={pending} className="w-full sm:w-auto">
          {pending && <Loader2 className="animate-spin" />}
          {pending ? "جارٍ التغيير..." : "تغيير كلمة المرور"}
        </Button>
      </div>
    </form>
  );
}
