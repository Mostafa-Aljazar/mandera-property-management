"use client";

import { startTransition, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, FileImage, IdCard, Loader2, UserRound } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PhoneField } from "@/components/common/PhoneField";
import { OwnerFilePicker } from "@/components/admin/owners/OwnerFilePicker";
import { useActionToast } from "@/hooks/use-action-toast";
import {
  updateOwnerSchema,
  type UpdateOwnerValues,
} from "@/validations/updateOwner.schema";
import {
  updateOwner,
  type UpdateOwnerState,
} from "@/actions/admin/owners/updateOwner.action";

const initialState: UpdateOwnerState = {
  error: null,
  success: false,
  updatedAt: null,
};

export type EditOwnerInitial = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  national_id: string | null;
  valid_until: string | null;
  company_name: string | null;
  city: string | null;
  notes: string | null;
  avatar_url: string | null;
  id_document_url: string | null;
};

function SectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <CardHeader className="flex-row items-start gap-3 space-y-0">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-4.5" />
      </div>
      <div>
        <CardTitle>{title}</CardTitle>
        <CardDescription className="mt-1">{description}</CardDescription>
      </div>
    </CardHeader>
  );
}

export function EditOwnerForm({ owner }: { owner: EditOwnerInitial }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    updateOwner,
    initialState,
  );
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    owner.avatar_url,
  );
  const [idPreview, setIdPreview] = useState<string | null>(
    owner.id_document_url,
  );

  useActionToast(pending, state, {
    successMessage: "تم التعديل بنجاح",
    successDescription: "تم تحديث بيانات المالك",
    errorTitle: "تعذر تحديث الحساب",
  });

  const redirectedAt = useRef<number | null>(null);
  useEffect(() => {
    if (!state.success || !state.updatedAt) return;
    if (redirectedAt.current === state.updatedAt) return;
    redirectedAt.current = state.updatedAt;
    router.replace(`/admin/owners/${owner.id}`);
  }, [state.success, state.updatedAt, owner.id, router]);

  const form = useForm<UpdateOwnerValues>({
    resolver: zodResolver(updateOwnerSchema),
    defaultValues: {
      ownerId: owner.id,
      full_name: owner.full_name,
      email: owner.email ?? "",
      phone: owner.phone ?? "",
      national_id: owner.national_id ?? "",
      valid_until: owner.valid_until ?? "",
      company_name: owner.company_name ?? "",
      city: owner.city ?? "",
      notes: owner.notes ?? "",
    },
  });
  const { control, register, handleSubmit, setValue, watch } = form;

  const validUntil = watch("valid_until");
  const willBePending = useMemo(() => {
    if (!validUntil) return false;
    return validUntil < new Date().toISOString().slice(0, 10);
  }, [validUntil]);

  function onSubmit(values: UpdateOwnerValues) {
    const fd = new FormData();
    fd.set("ownerId", values.ownerId);
    fd.set("full_name", values.full_name);
    fd.set("email", values.email);
    fd.set("phone", values.phone ?? "");
    fd.set("national_id", values.national_id);
    fd.set("valid_until", values.valid_until);
    fd.set("company_name", values.company_name ?? "");
    fd.set("city", values.city ?? "");
    fd.set("notes", values.notes ?? "");
    if (values.avatar) fd.set("avatar", values.avatar);
    if (values.id_document) fd.set("id_document", values.id_document);
    startTransition(() => {
      formAction(fd);
    });
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">تعديل المالك</h1>
        <p className="mt-1 text-sm text-muted-foreground">{owner.full_name}</p>
      </div>

      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
          <input type="hidden" {...register("ownerId")} />

          <Card>
            <SectionHeader
              icon={UserRound}
              title="المعلومات الأساسية"
              description="الاسم وبيانات التواصل مع المالك."
            />
            <CardContent className="grid gap-5 sm:grid-cols-2">
              <FormField
                control={control}
                name="full_name"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>الاسم الكامل</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>البريد الإلكتروني</FormLabel>
                    <FormControl>
                      <Input type="email" dir="ltr" className="text-start" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Controller
                name="phone"
                control={control}
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>الهاتف</FormLabel>
                    <FormControl>
                      <PhoneField
                        value={field.value || undefined}
                        onChange={(value) => field.onChange(value ?? "")}
                        onBlur={field.onBlur}
                        invalid={!!fieldState.error}
                      />
                    </FormControl>
                    {fieldState.error && (
                      <p className="text-sm text-destructive">
                        {fieldState.error.message}
                      </p>
                    )}
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <SectionHeader
              icon={IdCard}
              title="بيانات الحساب"
              description="رقم الهوية وتاريخ انتهاء صلاحية الحساب على المنصة."
            />
            <CardContent className="grid gap-5 sm:grid-cols-2">
              <FormField
                control={control}
                name="national_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رقم الهوية</FormLabel>
                    <FormControl>
                      <Input dir="ltr" className="text-start" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="valid_until"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>صلاحية الحساب حتى</FormLabel>
                    <FormControl>
                      <Input type="date" dir="ltr" {...field} />
                    </FormControl>
                    {willBePending && (
                      <FormDescription className="text-amber-700">
                        تاريخ منتهٍ — سيصبح الحساب معلّقاً
                      </FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <SectionHeader
              icon={Building2}
              title="معلومات إضافية"
              description="بيانات اختيارية تساعد في تنظيم حسابات الملاك."
            />
            <CardContent className="grid gap-5 sm:grid-cols-2">
              <FormField
                control={control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>المدينة</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="company_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>اسم الشركة</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="notes"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>ملاحظات داخلية</FormLabel>
                    <FormControl>
                      <Textarea rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <SectionHeader
              icon={FileImage}
              title="المستندات"
              description="اترك الحقل فارغاً للإبقاء على الملف الحالي."
            />
            <CardContent className="grid gap-5 sm:grid-cols-2">
              <FormField
                control={control}
                name="avatar"
                render={() => (
                  <FormItem>
                    <FormLabel>الصورة الشخصية</FormLabel>
                    <FormControl>
                      <OwnerFilePicker
                        hint={avatarPreview ? "تغيير الصورة" : "رفع صورة"}
                        previewUrl={avatarPreview}
                        onPick={(file) => {
                          setValue("avatar", file, { shouldValidate: true });
                          setAvatarPreview(
                            file ? URL.createObjectURL(file) : owner.avatar_url,
                          );
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="id_document"
                render={() => (
                  <FormItem>
                    <FormLabel>مستند الهوية</FormLabel>
                    <FormControl>
                      <OwnerFilePicker
                        hint={idPreview ? "تغيير المستند" : "رفع مستند"}
                        previewUrl={idPreview}
                        rounded="xl"
                        onPick={(file) => {
                          setValue("id_document", file, {
                            shouldValidate: true,
                          });
                          setIdPreview(
                            file ? URL.createObjectURL(file) : owner.id_document_url,
                          );
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {state.error && (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          <div className="flex items-center justify-between border-t pt-6">
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link href={`/admin/owners/${owner.id}`} />}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="animate-spin" />}
              {pending ? "جارٍ الحفظ..." : "حفظ التعديلات"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
