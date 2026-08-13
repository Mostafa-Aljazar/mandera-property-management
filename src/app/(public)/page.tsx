import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Bell,
  Building2,
  ClipboardList,
  FileText,
  KeyRound,
  Users,
  Wallet,
} from "lucide-react";
import { Reveal } from "@/components/common/Reveal";
import { BRAND } from "@/lib/brand";

const red = BRAND.red;
const navy = BRAND.navy;

const heroCards = [
  {
    icon: Building2,
    title: "العقارات",
    text: "عقارات ووحدات بمواصفاتها وحالة الإشغال.",
  },
  {
    icon: FileText,
    title: "العقود",
    text: "عقود إيجار مرتبطة بالمستأجر والوحدة.",
  },
  {
    icon: Wallet,
    title: "المالية",
    text: "دفعات ومصروفات وتقارير صافي الدخل.",
  },
] as const;

const steps = [
  {
    n: "01",
    icon: KeyRound,
    title: "إنشاء حساب المالك",
    text: "مدير المنصة يضيف حساب صاحب العقار من لوحة الويب — بدون تسجيل ذاتي.",
  },
  {
    n: "02",
    icon: Building2,
    title: "إضافة العقارات والوحدات",
    text: "المالك يبني محفظته من التطبيق: عقارات، وحدات، ومواصفات كل وحدة.",
  },
  {
    n: "03",
    icon: Users,
    title: "المستأجرون والعقود",
    text: "ربط مستأجر بوحدة، توليد جدول الدفعات تلقائياً، ومتابعة التحصيل.",
  },
  {
    n: "04",
    icon: Bell,
    title: "تشغيل يومي بإشعارات",
    text: "صيانة، متأخرات، وعقود قربت تنتهي — بتنبيهات مباشرة داخل التطبيق.",
  },
] as const;

const modules = [
  {
    title: "إدارة كاملة للمحفظة العقارية",
    text: "تتبع كل عقار ووحدة: الطابق، المساحة، الغرف، الحمامات، الإيجار، وحالة الإشغال (شاغرة / مؤجرة / صيانة) بتحديث تلقائي مع العقود.",
    image: "/feature-property.jpg",
    imageAlt: "عقار حديث",
    reverse: false,
  },
  {
    title: "عقود وتحصيل أوضح",
    text: "إنشاء العقد يولّد الدفعات حسب الدورة الشهرية أو الربعية أو السنوية. المتأخرات تُحدَّث تلقائياً، والتجديد يحفظ أرشيف العقود كاملاً.",
    image: "/feature-contract.jpg",
    imageAlt: "مفاتيح وعقد",
    reverse: true,
  },
  {
    title: "تشغيل يومي منسّق",
    text: "مصروفات، طلبات صيانة، أولويات، وفنيون مسؤولون — مع تقارير إيرادات ومصروفات وصافي دخل قابلة للمتابعة من التطبيق.",
    image: "/feature-ops.jpg",
    imageAlt: "مساحة داخلية",
    reverse: false,
  },
] as const;

const roles = [
  {
    title: "مدير المنصة",
    channel: "ويب",
    points: [
      "إضافة وتفعيل وتعطيل حسابات الملاك",
      "مراقبة أعداد العقارات والوحدات فقط",
      "بدون وصول لتفاصيل تشغيل أي مالك",
    ],
  },
  {
    title: "صاحب العقار",
    channel: "تطبيق الموبايل",
    points: [
      "إدارة العقارات والوحدات والمستأجرين",
      "العقود والدفعات والمصروفات والصيانة",
      "إشعارات فورية وتقارير مالية",
    ],
  },
  {
    title: "المستأجر",
    channel: "بدون حساب",
    points: [
      "سجل بيانات يديره المالك بالكامل",
      "لا وصول للمنصة",
      "التواصل يتم خارج النظام",
    ],
  },
] as const;

export default function Home() {
  return (
    <>
      <main>
        <section className="relative isolate overflow-hidden pb-10 md:pb-12">
          <div className="relative min-h-[72svh] overflow-hidden md:min-h-[78svh]">
            <Image
              src="/hero-building.jpg"
              alt=""
              fill
              priority
              sizes="100vw"
              className="home-kenburns object-cover object-[center_28%]"
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-linear-to-t from-[#0b2430]/90 via-[#0b2430]/45 to-[#0b2430]/25"
            />

            <div className="relative mx-auto flex min-h-[72svh] max-w-6xl flex-col items-center justify-center px-6 pb-24 pt-16 text-center md:min-h-[78svh]">
              <p className="home-rise inline-flex items-center rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-white/90 backdrop-blur-sm">
                معيار أوضح لإدارة الإيجار
              </p>
              <h1 className="home-rise home-rise-1 mt-6 max-w-3xl text-[clamp(1.9rem,4.8vw,3.35rem)] font-bold leading-[1.3] text-white">
                أدِر عقاراتك المؤجرة بوضوح من العقد حتى التحصيل
              </h1>
              <p className="home-rise home-rise-2 mt-5 max-w-2xl text-base leading-8 text-white/75 md:text-lg">
                وحدات ومستأجرون وعقود ودفعات ومصروفات وصيانة وإشعارات — لصاحب
                العقار عبر تطبيق الموبايل، مع لوحة ويب لمدير المنصة.
              </p>
              <div className="home-rise home-rise-3 mt-8">
                <Link
                  href="/login"
                  className="inline-flex h-12 items-center gap-2 rounded-full px-7 text-[15px] font-semibold text-white transition-all duration-300 hover:gap-3 hover:opacity-90 hover:shadow-[0_10px_30px_rgba(237,27,36,0.35)]"
                  style={{ backgroundColor: red }}
                >
                  ابدأ من لوحة الإدارة
                  <ArrowLeft className="size-4" />
                </Link>
              </div>
            </div>
          </div>

          <div className="relative z-10 mx-auto -mt-20 grid max-w-6xl gap-4 px-6 sm:grid-cols-3">
            {heroCards.map(({ icon: Icon, title, text }, i) => (
              <Reveal key={title} delay={120 + i * 100}>
                <div className="group rounded-2xl border border-black/5 bg-white p-6 shadow-[0_12px_40px_rgba(15,42,55,0.08)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_44px_rgba(15,42,55,0.12)]">
                  <div
                    className="mb-4 flex size-11 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-110"
                    style={{ backgroundColor: `${navy}14`, color: navy }}
                  >
                    <Icon className="size-5" />
                  </div>
                  <h2 className="text-lg font-bold text-[#16445B]">{title}</h2>
                  <p className="mt-2 text-sm leading-7 text-[#5b6b73]">{text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <section id="how" className="scroll-mt-20 pt-10 pb-20 md:pt-12 md:pb-24">
          <div className="mx-auto max-w-6xl px-6">
            <Reveal>
              <div className="mx-auto max-w-2xl text-center">
                <p className="text-sm font-semibold" style={{ color: red }}>
                  كيف يعمل
                </p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#16445B] md:text-4xl">
                  أربع خطوات لتشغيل أوضح
                </h2>
                <p className="mt-4 text-base leading-8 text-[#5b6b73]">
                  من إضافة المالك إلى التحصيل والإشعارات — المسار واضح للفريق
                  بالكامل.
                </p>
              </div>
            </Reveal>

            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map(({ n, icon: Icon, title, text }, i) => (
                <Reveal key={n} delay={i * 90}>
                  <article className="group relative h-full rounded-2xl border border-black/5 bg-white p-6 shadow-[0_8px_30px_rgba(15,42,55,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(15,42,55,0.1)]">
                    <span className="text-4xl font-bold text-[#16445B]/10 transition-colors duration-300 group-hover:text-[#16445B]/18">
                      {n}
                    </span>
                    <div
                      className="mt-4 mb-4 flex size-11 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-110"
                      style={{ backgroundColor: `${navy}14`, color: navy }}
                    >
                      <Icon className="size-5" />
                    </div>
                    <h3 className="text-lg font-bold text-[#16445B]">{title}</h3>
                    <p className="mt-2 text-sm leading-7 text-[#5b6b73]">
                      {text}
                    </p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section id="platform" className="scroll-mt-20 bg-white py-20 md:py-24">
          <div className="mx-auto max-w-6xl px-6">
            <Reveal>
              <div className="mx-auto max-w-2xl text-center">
                <p className="text-sm font-semibold" style={{ color: red }}>
                  المنصة
                </p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#16445B] md:text-4xl">
                  كل ما تحتاجه في نظام واحد
                </h2>
                <p className="mt-4 text-base leading-8 text-[#5b6b73]">
                  وحدات تشغيلية مصممة لأصحاب العقارات المؤجرة.
                </p>
              </div>
            </Reveal>

            <div className="mt-16 space-y-20">
              {modules.map((mod) => (
                <div
                  key={mod.title}
                  className={`grid items-center gap-10 md:grid-cols-2 md:gap-14 ${
                    mod.reverse ? "md:[&>*:first-child]:order-2" : ""
                  }`}
                >
                  <Reveal from={mod.reverse ? "left" : "right"}>
                    <div className="group relative aspect-4/3 overflow-hidden rounded-2xl">
                      <Image
                        src={mod.image}
                        alt={mod.imageAlt}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                    </div>
                  </Reveal>
                  <Reveal from={mod.reverse ? "right" : "left"} delay={120}>
                    <div>
                      <div
                        className="mb-5 flex size-12 items-center justify-center rounded-full"
                        style={{ backgroundColor: `${navy}14`, color: navy }}
                      >
                        <ClipboardList className="size-5" />
                      </div>
                      <h3 className="text-2xl font-bold tracking-tight text-[#16445B] md:text-3xl">
                        {mod.title}
                      </h3>
                      <p className="mt-4 text-[16px] leading-8 text-[#5b6b73]">
                        {mod.text}
                      </p>
                    </div>
                  </Reveal>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="roles" className="scroll-mt-20 py-20 md:py-24">
          <div className="mx-auto max-w-6xl px-6">
            <Reveal>
              <div className="mx-auto max-w-2xl text-center">
                <p className="text-sm font-semibold" style={{ color: red }}>
                  الأدوار
                </p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#16445B] md:text-4xl">
                  صلاحيات واضحة وخصوصية كاملة
                </h2>
              </div>
            </Reveal>

            <div className="mt-14 grid gap-5 md:grid-cols-3">
              {roles.map((role, i) => (
                <Reveal key={role.title} delay={i * 100}>
                  <article className="h-full rounded-2xl border border-black/5 bg-white p-7 shadow-[0_8px_30px_rgba(15,42,55,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(15,42,55,0.1)]">
                    <h3 className="text-xl font-bold text-[#16445B]">
                      {role.title}
                    </h3>
                    <p
                      className="mt-1 text-sm font-semibold"
                      style={{ color: red }}
                    >
                      {role.channel}
                    </p>
                    <ul className="mt-5 space-y-3">
                      {role.points.map((p) => (
                        <li
                          key={p}
                          className="flex gap-2 text-sm leading-7 text-[#5b6b73]"
                        >
                          <span
                            className="mt-2 size-1.5 shrink-0 rounded-full"
                            style={{ backgroundColor: red }}
                          />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 pb-8">
          <Reveal>
            <div className="mx-auto max-w-4xl rounded-3xl bg-white px-8 py-12 text-center shadow-[0_12px_40px_rgba(15,42,55,0.08)] md:px-14">
              <h2 className="text-2xl font-bold text-[#16445B] md:text-3xl">
                لوحة إدارة المنصة جاهزة
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-base leading-8 text-[#5b6b73]">
                أضف حسابات الملاك، فعّلها أو عطّلها، وتابع الإحصائيات — دون
                الدخول لتفاصيل تشغيل أي مالك.
              </p>
              <Link
                href="/login"
                className="mt-8 inline-flex h-12 items-center gap-2 rounded-full px-7 text-[15px] font-semibold text-white transition-all duration-300 hover:gap-3 hover:opacity-90 hover:shadow-[0_10px_30px_rgba(237,27,36,0.35)]"
                style={{ backgroundColor: red }}
              >
                تسجيل الدخول
                <ArrowLeft className="size-4" />
              </Link>
            </div>
          </Reveal>
        </section>

        <section className="px-6 py-16 md:py-20">
          <Reveal>
            <div
              className="mx-auto flex max-w-6xl flex-col justify-between gap-10 overflow-hidden rounded-3xl px-8 py-12 text-white md:flex-row md:items-center md:gap-16 md:px-12 md:py-14"
              style={{ backgroundColor: navy }}
            >
              <div className="max-w-xl">
                <p className="text-sm font-semibold" style={{ color: red }}>
                  تجربة الموبايل
                </p>
                <h2 className="mt-3 text-2xl font-bold md:text-3xl">
                  تطبيقات الموبايل قريباً
                </h2>
                <p className="mt-4 text-base leading-8 text-white/70">
                  أدِر عقاراتك وعقودك ودفعاتك وطلبات الصيانة من هاتفك بسهولة، مع
                  إشعارات فورية بكل ما يحتاج انتباهك.
                </p>
                <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-white/80">
                  {["العقارات", "العقود", "التحصيل", "لوحة المتابعة"].map(
                    (item) => (
                      <li key={item} className="flex items-center gap-2">
                        <span
                          className="size-1.5 rounded-full"
                          style={{ backgroundColor: red }}
                        />
                        {item}
                      </li>
                    ),
                  )}
                </ul>
              </div>

              <div className="flex flex-col gap-3 sm:min-w-[280px]">
                <p className="text-xs font-semibold tracking-wide text-white/50">
                  قريباً
                </p>

                <a
                  href="#"
                  aria-label="Google Play — قريباً"
                  className="inline-flex h-14 items-center gap-3 rounded-xl bg-black px-4 text-white transition-opacity hover:opacity-90"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="size-8 shrink-0"
                    aria-hidden
                  >
                    <path
                      fill="#EA4335"
                      d="M3.6 2.1 14.1 12 3.6 21.9c-.4-.2-.6-.6-.6-1V3.1c0-.4.2-.8.6-1z"
                    />
                    <path
                      fill="#FBBC04"
                      d="m14.1 12 2.5-2.5 4.2 2.4c.7.4.7 1.4 0 1.8l-4.2 2.4L14.1 12z"
                    />
                    <path
                      fill="#4285F4"
                      d="M14.1 12 3.6 2.1c.3-.2.7-.2 1.1 0l11.9 6.9L14.1 12z"
                    />
                    <path
                      fill="#34A853"
                      d="M14.1 12 16.6 14.5 4.7 21.4c-.4.2-.8.2-1.1 0L14.1 12z"
                    />
                  </svg>
                  <span className="text-start leading-tight">
                    <span className="block text-[10px] text-white/65">
                      GET IT ON
                    </span>
                    <span className="block text-sm font-semibold">
                      Google Play
                    </span>
                  </span>
                </a>

                <a
                  href="#"
                  aria-label="App Store — قريباً"
                  className="inline-flex h-14 items-center gap-3 rounded-xl bg-black px-4 text-white transition-opacity hover:opacity-90"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="size-8 shrink-0 fill-white"
                    aria-hidden
                  >
                    <path d="M16.7 12.6c0-2.1 1.7-3.1 1.8-3.2-1-1.4-2.5-1.6-3-1.6-1.3-.1-2.5.8-3.1.8-.6 0-1.6-.7-2.7-.7-1.4 0-2.7.8-3.4 2.1-1.5 2.5-.4 6.3 1 8.4.7 1 1.5 2.2 2.6 2.1 1 0 1.4-.7 2.7-.7s1.6.7 2.7.6c1.1 0 1.8-1 2.5-2 .8-1.1 1.1-2.2 1.1-2.3-.1 0-2.1-.8-2.2-3.5zM14.6 6.5c.6-.7 1-1.7.9-2.7-.9.1-1.9.6-2.5 1.3-.6.6-1.1 1.6-.9 2.5 1 .1 1.9-.4 2.5-1.1z" />
                  </svg>
                  <span className="text-start leading-tight">
                    <span className="block text-[10px] text-white/65">
                      Download on the
                    </span>
                    <span className="block text-sm font-semibold">App Store</span>
                  </span>
                </a>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      <style>{`
        @keyframes homeRise {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes homeKenBurns {
          from { transform: scale(1); }
          to { transform: scale(1.06); }
        }
        .home-rise {
          animation: homeRise 0.8s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .home-rise-1 { animation-delay: 0.08s; }
        .home-rise-2 { animation-delay: 0.16s; }
        .home-rise-3 { animation-delay: 0.24s; }
        .home-kenburns {
          animation: homeKenBurns 18s ease-out forwards;
        }
        @media (prefers-reduced-motion: reduce) {
          .home-rise,
          .home-kenburns {
            animation: none !important;
          }
        }
      `}</style>
    </>
  );
}
