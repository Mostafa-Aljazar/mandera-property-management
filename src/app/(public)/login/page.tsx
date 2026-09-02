"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense, useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, ShieldCheck } from "lucide-react";
import { PasswordInput } from "@/components/common/PasswordInput";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BRAND } from "@/lib/brand";
import {
  login,
  type LoginState,
} from "@/actions/(public)/login/login.action";
import { useActionToast } from "@/hooks/use-action-toast";

const initialState: LoginState = { error: null };

function LoginForm() {
  const searchParams = useSearchParams();
  const resetSuccess = searchParams.get("reset") === "success";
  const [state, formAction, pending] = useActionState(login, initialState);

  useActionToast(pending, state, {
    successMessage: "تم تسجيل الدخول",
    errorTitle: "تعذر تسجيل الدخول",
  });

  return (
    <>
      {resetSuccess && (
        <p className="mt-5 rounded-xl bg-emerald-50 px-3 py-2.5 text-sm font-medium text-emerald-800">
          تم تغيير كلمة المرور بنجاح. سجّل الدخول بالكلمة الجديدة.
        </p>
      )}

      <form action={formAction} className="mt-8 space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-[#16445B]">
            البريد الإلكتروني
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            dir="ltr"
            placeholder="name@example.com"
            className="h-11 rounded-xl border-[#16445B]/15 bg-[#f7fafb] text-start md:h-12"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="password" className="text-[#16445B]">
              كلمة المرور
            </Label>
            <Link
              href="/forgot-password"
              className="text-xs font-semibold text-[#16445B]/70 transition-colors hover:text-[#ED1B24]"
            >
              نسيت كلمة المرور؟
            </Link>
          </div>
          <PasswordInput
            id="password"
            name="password"
            autoComplete="current-password"
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
          {pending ? "جارِ التحقق..." : "تسجيل الدخول"}
        </button>
      </form>
    </>
  );
}

export default function LoginPage() {
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
              لوحة إدارة المنصة
            </p>
            <h1 className="mt-2 text-2xl font-bold leading-snug md:mt-3 md:text-3xl lg:text-4xl">
              دخول آمن لإدارة حسابات الملاك
            </h1>
            <p className="mt-3 max-w-sm text-sm leading-7 text-white/70 md:mt-4 md:text-base md:leading-8">
              هذه المساحة مخصّصة لمدير المنصة فقط. يمكنك إضافة الملاك ومتابعة
              الإحصائيات دون الاطلاع على تفاصيل تشغيلهم.
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
            <ShieldCheck className="size-5" />
          </div>
          <h2 className="text-2xl font-bold text-[#16445B] md:text-3xl">
            تسجيل الدخول
          </h2>
          <p className="mt-2 text-sm leading-7 text-[#5b6b73]">
            أدخل بيانات حساب مدير المنصة للمتابعة.
          </p>

          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
