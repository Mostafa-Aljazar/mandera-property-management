"use client";

import { TooltipProvider as UiTooltipProvider } from "@/components/ui/tooltip";

export function TooltipProvider({ children }: { children: React.ReactNode }) {
  return <UiTooltipProvider delay={200}>{children}</UiTooltipProvider>;
}
