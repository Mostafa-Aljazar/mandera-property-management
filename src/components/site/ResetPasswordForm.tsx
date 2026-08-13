"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState } from "react";
import { ArrowRight, Loader2, LockKeyhole } from "lucide-react";
import { PasswordInput } from "@/components/common/PasswordInput";
import { Label } from "@/components/ui/label";
import { BRAND } from "@/lib/brand";
import {
  resetPassword,
  type ResetPasswordState,
} from "@/actions/(public)/login/resetPassword.action";
import { useActionToast } from "@/hooks/use-action-toast";

const initialState: ResetPasswordState = { error: null, success: false };

export function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState(
    resetPassword,
    initialState,
  );

  useActionToast(pending, state, {
    successMessage: "تم تغيير كلمة المرور",
    errorTitle: "تعذر تغيير كلمة المرور",
  });

  return (
    <main className="relative flex flex-1 items-stretch justify-center md:items-center md:px-8 md:py-12 lg:px-10 lg:py-14">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 hidden bg-[radial-gradient(ellipse_at_top,rgba(237,27,36,0.06),transparent_50%),radial-gradient(ellipse_at_bottom_left,rgba(22,68,91,0.08),transparent_45%)] md:block"
      />

      <div className="relative grid w-full flex-1 overflow-hidden bg-white md:max-w-6xl md:flex-none md:grid-cols-[1.05fr_0.95fr] md:rounded-3xl md:border md:border-black/5 md:shadow-[0_20px_60px_rgba(15,42,55,0.08)] lg:max-w-7xl">
        <div
          className="relative min-h-[220px] overflow-hidden sm:min-h-[260px] md:min-h-[560px]"
          style={{ backgroundColor: BRAND.navy }}
        >
          <Image
            src="/hero-building.jpg"
            alt=""
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover object-center opacity-45"
          />
          <div className="absolute inset-0 bg-linear-to-t from-[#0b2430] via-[#0b2430]/70 to-[#0b2430]/40" />
          <div className="relative z-10 flex h-full flex-col justify-end p-6 text-white sm:p-8 md:p-10 lg:p-12">
            <p className="text-sm font-semibold" style={{ color: BRAND.red }}>
              أمان الحساب
            </p>
            <h1 className="mt-2 text-2xl font-bold leading-snug md:mt-3 md:text-3xl lg:text-4xl">
              تعيين كلمة مرور جديدة
            </h1>
            <p className="mt-3 max-w-sm text-sm leading-7 text-white/70 md:mt-4 md:text-base md:leading-8">
              اختر كلمة مرور قوية لا تقل عن 8 أحرف، ثم سجّل الدخول من جديد.
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-center px-7 py-10 sm:px-10 md:px-12 lg:px-16">
          <div
            className="mb-5 flex size-11 items-center justify-center rounded-full"
            style={{
              backgroundColor: `${BRAND.navy}14`,
              color: BRAND.navy,
            }}
          >
            <LockKeyhole className="size-5" />
          </div>
          <h2 className="text-2xl font-bold text-[#16445B] md:text-3xl">
            كلمة مرور جديدة
          </h2>
          <p className="mt-2 text-sm leading-7 text-[#5b6b73]">
            أدخل كلمة المرور الجديدة لحساب مدير المنصة.
          </p>

          <form action={formAction} className="mt-8 space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-[#16445B]">
                كلمة المرور الجديدة
              </Label>
              <PasswordInput
                id="password"
                name="password"
                autoComplete="new-password"
                className="h-11 rounded-xl border-[#16445B]/15 bg-[#f7fafb] md:h-12"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirm_password" className="text-[#16445B]">
                تأكيد كلمة المرور
              </Label>
              <PasswordInput
                id="confirm_password"
                name="confirm_password"
                autoComplete="new-password"
                className="h-11 rounded-xl border-[#16445B]/15 bg-[#f7fafb] md:h-12"
              />
            </div>

            {state.error && (
              <p className="text-sm font-medium text-[#ED1B24]">{state.error}</p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60 md:h-12"
              style={{ backgroundColor: BRAND.red }}
            >
              {pending && <Loader2 className="size-4 animate-spin" />}
              {pending ? "جارٍ الحفظ..." : "حفظ كلمة المرور"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-[#8a969c]">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 font-medium text-[#16445B] transition-colors hover:text-[#ED1B24]"
            >
              <ArrowRight className="size-4" />
              العودة لتسجيل الدخول
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
