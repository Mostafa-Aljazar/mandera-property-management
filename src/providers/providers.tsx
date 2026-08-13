"use client";

import { ToastProvider } from "@/providers/toast.provider";
import { TooltipProvider } from "@/providers/tooltip.provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      {children}
      <ToastProvider />
    </TooltipProvider>
  );
}
