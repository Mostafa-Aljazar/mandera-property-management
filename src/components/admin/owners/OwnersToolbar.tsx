"use client";

import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
    <Card className="p-3 sm:p-4">
      <form
        onSubmit={handleSubmit(navigate as any)}
        className="flex flex-col gap-3"
        noValidate
      >
        <div className="flex gap-2">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute top-1/2 inset-s-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="ابحث بالاسم أو البريد أو الهاتف..."
              aria-invalid={!!errors.q}
              className="h-10 pe-3 ps-10 text-start"
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
                  className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
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
          <p className="text-xs text-destructive">{errors.q.message}</p>
        )}

        <Tabs
          value={currentStatus}
          onValueChange={(value) =>
            onStatusChange(value as OwnersFilterValues["status"])
          }
        >
          <TabsList className="w-full sm:w-fit">
            {statusTabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} disabled={pending}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </form>
    </Card>
  );
}
