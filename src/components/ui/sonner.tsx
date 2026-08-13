"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";
import { Check, Info, Loader2, TriangleAlert, X } from "lucide-react";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      position="top-center"
      dir="rtl"
      gap={8}
      offset={16}
      visibleToasts={3}
      icons={{
        success: <Check className="size-3.5 stroke-[2.5] text-[#16445B]" />,
        info: <Info className="size-3.5 text-[#16445B]" />,
        warning: <TriangleAlert className="size-3.5 text-amber-600" />,
        error: <X className="size-3.5 stroke-[2.5] text-[#ED1B24]" />,
        loading: <Loader2 className="size-3.5 animate-spin text-[#16445B]" />,
      }}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "flex w-[min(92vw,28rem)] items-start gap-3 rounded-xl border border-[#16445B]/08 bg-white px-3.5 py-3 shadow-[0_8px_30px_rgba(15,42,55,0.1)]",
          title: "text-[13px] font-semibold leading-5 text-[#16445B]",
          description: "mt-0.5 text-xs leading-5 text-[#6b7a82]",
          icon: "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#f3f6f8]",
          success: "border-[#16445B]/08",
          error: "border-[#ED1B24]/15",
          warning: "border-amber-200",
          info: "border-[#16445B]/08",
          content: "flex min-w-0 flex-1 flex-col pe-0.5",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
