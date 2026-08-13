"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, CheckCircle2, KeyRound, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BRAND } from "@/lib/brand";
import {
  requestPasswordReset,
  type ForgotPasswordState,
} from "@/actions/(public)/login/forgotPassword.action";
import { useActionToast } from "@/hooks/use-action-toast";

const initialState: ForgotPasswordState = { error: null, success: false };

export default function ForgotPasswordClient() {
  const searchParams = useSearchParams();
  const invalidLink = searchParams.get("error") === "invalid_link";
  const [state, formAction, pending] = useActionState(
    requestPasswordReset,
    initialState,
  );

  useActionToast(pending, state, {
    successMessage: "تم إرسال الرابط",
    successDescription:
      "إذا كان البريد مسجلاً كمدير منصة، وصلك رابط الاستعادة",
    errorTitle: "تعذر إرسال الرابط",
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
              استعادة الوصول
            </p>
            <h1 className="mt-2 text-2xl font-bold leading-snug md:mt-3 md:text-3xl lg:text-4xl">
              نسيت كلمة المرور؟
            </h1>
            <p className="mt-3 max-w-sm text-sm leading-7 text-white/70 md:mt-4 md:text-base md:leading-8">
              أدخل بريد مدير المنصة وسنرسل رابطاً آمناً لإعادة تعيين كلمة المرور.
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
            <KeyRound className="size-5" />
          </div>

          {state.success ? (
            <>
              <div
                className="mb-4 flex size-12 items-center justify-center rounded-2xl"
                style={{
                  backgroundColor: `${BRAND.navy}12`,
                  color: BRAND.navy,
                }}
              >
                <CheckCircle2 className="size-6" />
              </div>
              <h2 className="text-2xl font-bold text-[#16445B] md:text-3xl">
                تحقق من بريدك
              </h2>
              <p className="mt-2 text-sm leading-7 text-[#5b6b73]">
                إذا كان البريد مسجلاً كمدير منصة نشط، وصلك رابط إعادة التعيين.
                قد يستغرق الأمر دقيقة — وتأكد من مجلد الرسائل غير المرغوب فيها.
              </p>
              <Link
                href="/login"
                className="mt-8 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90 md:h-12"
                style={{ backgroundColor: BRAND.navy }}
              >
                العودة لتسجيل الدخول
              </Link>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-[#16445B] md:text-3xl">
                نسيت كلمة المرور
              </h2>
              <p className="mt-2 text-sm leading-7 text-[#5b6b73]">
                أدخل بريد حساب مدير المنصة لإرسال رابط الاستعادة.
              </p>

              {invalidLink && (
                <p className="mt-4 rounded-xl bg-[#ED1B24]/08 px-3 py-2.5 text-sm font-medium text-[#ED1B24]">
                  رابط الاستعادة غير صالح أو منتهي. اطلب رابطاً جديداً.
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

                {state.error && (
                  <p className="text-sm font-medium text-[#ED1B24]">
                    {state.error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={pending}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60 md:h-12"
                  style={{ backgroundColor: BRAND.red }}
                >
                  {pending && <Loader2 className="size-4 animate-spin" />}
                  {pending ? "جارٍ الإرسال..." : "إرسال رابط الاستعادة"}
                </button>
              </form>
            </>
          )}

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
