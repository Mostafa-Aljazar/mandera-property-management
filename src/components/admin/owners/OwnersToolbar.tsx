"use client";

import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";
import {
  buildOwnersHref,
  ownersFilterSchema,
  type OwnersFilterValues,
} from "@/validations/ownersFilter.schema";

const statusTabs = [
  { value: "all", label: "الكل" },
  { value: "active", label: "نشطون" },
  { value: "pending", label: "معلّقون" },
  { value: "inactive", label: "معطّلون" },
] as const;

export function OwnersToolbar({
  q,
  status,
}: {
  q: string;
  status: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const parsedStatus = ownersFilterSchema.shape.status.safeParse(status);
  const initialStatus = parsedStatus.success ? parsedStatus.data : "all";

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    reset,
    formState: { errors },
  } = useForm<OwnersFilterValues>({
    resolver: zodResolver(ownersFilterSchema) as any,
    defaultValues: {
      q,
      status: initialStatus,
    },
  });

  useEffect(() => {
    reset({
      q,
      status: initialStatus,
    });
  }, [q, initialStatus, reset]);

  const currentStatus = watch("status");

  function navigate(values: OwnersFilterValues) {
    startTransition(() => {
      router.push(buildOwnersHref({ ...values, page: 1 } as any));
    });
  }

  function onStatusChange(next: OwnersFilterValues["status"]) {
    setValue("status", next, { shouldValidate: true });
    navigate({ ...getValues(), status: next, page: 1 });
  }

  return (
    <div className="relative rounded-2xl border border-[#16445B]/8 bg-white p-3 shadow-[0_10px_36px_rgba(15,42,55,0.04)] sm:p-4">
      <form
        onSubmit={handleSubmit(navigate as any)}
        className="flex flex-col gap-3"
        noValidate
      >
        <div className="flex gap-2">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute top-1/2 inset-s-3 size-4 -translate-y-1/2 text-[#8a969c]" />
            <Input
              type="text"
              placeholder="ابحث بالاسم أو البريد أو الهاتف..."
              aria-invalid={!!errors.q}
              className="h-11 rounded-xl border-[#16445B]/12 bg-[#f7fafb] pe-3 ps-10 text-start"
              {...register("q")}
            />
          </div>

          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  type="submit"
                  disabled={pending}
                  aria-label="بحث"
                  className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl px-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60 sm:rounded-full sm:px-5"
                  style={{ backgroundColor: BRAND.navy }}
                />
              }
            >
              <Search className="size-4" />
              <span className="hidden sm:inline">
                {pending ? "جارٍ..." : "بحث"}
              </span>
            </TooltipTrigger>
            <TooltipContent>بحث في الملاك</TooltipContent>
          </Tooltip>
        </div>

        {errors.q && (
          <p className="text-xs text-[#ED1B24]">{errors.q.message}</p>
        )}

        <div className="-mx-1 overflow-x-auto px-1 scrollbar-none">
          <div className="flex w-max min-w-full gap-1 rounded-full border border-[#16445B]/10 bg-[#f7fafb] p-1 sm:w-full sm:min-w-0">
            {statusTabs.map((tab) => {
              const isActive = currentStatus === tab.value;

              return (
                <button
                  key={tab.value}
                  type="button"
                  disabled={pending}
                  onClick={() => onStatusChange(tab.value)}
                  className={cn(
                    "shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors disabled:opacity-60 sm:flex-1 sm:px-4",
                    isActive
                      ? "bg-[#16445B] text-white shadow-sm"
                      : "text-[#5b6b73] hover:text-[#16445B]",
                  )}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </form>
    </div>
  );
}
