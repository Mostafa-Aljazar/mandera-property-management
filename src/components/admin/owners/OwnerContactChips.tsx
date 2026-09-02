"use client";

import { Check, IdCard, Mail, Phone } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const chipClass =
  "flex w-full items-center gap-2 rounded-lg bg-muted px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground";

function whatsappHref(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return `https://wa.me/${digits}`;
}

export function OwnerContactChips({
  email,
  phone,
  nationalId,
}: {
  email: string | null;
  phone: string | null;
  nationalId: string | null;
}) {
  const [copied, setCopied] = useState(false);

  async function copyNationalId() {
    if (!nationalId) return;
    try {
      await navigator.clipboard.writeText(nationalId);
      setCopied(true);
      toast.success("تم النسخ", {
        description: "تم نسخ رقم الهوية",
      });
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("تعذر النسخ", {
        description: "لم نتمكن من نسخ رقم الهوية",
      });
    }
  }

  return (
    <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {email && (
        <Tooltip>
          <TooltipTrigger
            render={
              <a
                href={`mailto:${email}`}
                className={cn(chipClass, "min-w-0")}
              />
            }
          >
            <Mail className="size-3.5 shrink-0 text-muted-foreground" />
            <span className="truncate" dir="ltr">
              {email}
            </span>
          </TooltipTrigger>
          <TooltipContent side="top">فتح البريد</TooltipContent>
        </Tooltip>
      )}

      {phone && (
        <Tooltip>
          <TooltipTrigger
            render={
              <a
                href={whatsappHref(phone)}
                target="_blank"
                rel="noreferrer"
                className={chipClass}
              />
            }
          >
            <Phone className="size-3.5 shrink-0 text-muted-foreground" />
            <span dir="ltr">{phone}</span>
          </TooltipTrigger>
          <TooltipContent side="top">فتح واتساب</TooltipContent>
        </Tooltip>
      )}

      {nationalId && (
        <Tooltip>
          <TooltipTrigger
            render={
              <button
                type="button"
                onClick={copyNationalId}
                className={cn(chipClass, "cursor-pointer text-start")}
              />
            }
          >
            {copied ? (
              <Check className="size-3.5 shrink-0 text-emerald-600" />
            ) : (
              <IdCard className="size-3.5 shrink-0 text-muted-foreground" />
            )}
            <span dir="ltr">{nationalId}</span>
          </TooltipTrigger>
          <TooltipContent side="top">
            {copied ? "تم النسخ" : "نسخ رقم الهوية"}
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
