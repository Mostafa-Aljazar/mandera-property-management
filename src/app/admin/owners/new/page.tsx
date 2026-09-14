"use client";

import { startTransition, useActionState, useMemo, useState } from "react";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Building2,
  Check,
  CheckCircle2,
  Copy,
  FileImage,
  IdCard,
  Loader2,
  UserRound,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
  createOwnerSchema,
  type CreateOwnerValues,
} from "@/validations/createOwner.schema";
import {
  createOwner,
  type CreateOwnerState,
} from "@/actions/admin/owners/createOwner.action";

const initialState: CreateOwnerState = { error: null, success: null };

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

export default function NewOwnerPage() {
  const [state, formAction, pending] = useActionState(
    createOwner,
    initialState,
  );
  const [copied, setCopied] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [idPreview, setIdPreview] = useState<string | null>(null);

  useActionToast(pending, state, {
    successMessage: "تم إنشاء الحساب بنجاح",
    successDescription: "تم إنشاء حساب المالك — احفظ بيانات الدخول",
    errorTitle: "تعذر إنشاء الحساب",
  });

  const form = useForm<CreateOwnerValues>({
    resolver: zodResolver(createOwnerSchema),
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      national_id: "",
      valid_until: "",
      company_name: "",
      city: "",
      notes: "",
    },
  });
  const { control, handleSubmit, setValue, watch } = form;

  const validUntil = watch("valid_until");
  const willBePending = useMemo(() => {
    if (!validUntil) return false;
    return validUntil < new Date().toISOString().slice(0, 10);
  }, [validUntil]);

  function onSubmit(values: CreateOwnerValues) {
    const fd = new FormData();
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

  if (state.success) {
    const credentials = `الإيميل: ${state.success.email}\nكلمة المرور المؤقتة: ${state.success.password}`;

    return (
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader className="flex-row items-start gap-3 space-y-0">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <CheckCircle2 className="size-5" />
            </div>
            <div>
              <CardTitle>تم إنشاء حساب المالك</CardTitle>
              <CardDescription className="mt-1">
                انسخ بيانات الدخول الآن — تظهر مرة واحدة فقط.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {state.success.account_status === "pending" && (
              <Alert className="border-amber-200 bg-amber-50 text-amber-800">
                <AlertDescription className="text-amber-800">
                  الحساب معلّق (pending) لأن تاريخ الصلاحية منتهٍ.
                </AlertDescription>
              </Alert>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border bg-muted/40 px-4 py-3" dir="ltr">
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="mt-1 break-all font-mono text-sm font-semibold">
                  {state.success.email}
                </p>
              </div>
              <div className="rounded-lg border bg-muted/40 px-4 py-3" dir="ltr">
                <p className="text-xs text-muted-foreground">Password</p>
                <p className="mt-1 font-mono text-sm font-semibold">
                  {state.success.password}
                </p>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-wrap gap-3">
            <Button
              type="button"
              className="flex-1"
              onClick={() => {
                navigator.clipboard.writeText(credentials);
                setCopied(true);
              }}
            >
              {copied ? <Check /> : <Copy />}
              {copied ? "تم النسخ" : "نسخ البيانات"}
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              nativeButton={false}
              render={<Link href="/admin/owners" />}
            >
              قائمة الملاك
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          إضافة مالك جديد
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          سيتم إنشاء حساب دخول وكلمة مرور مؤقتة تلقائياً. إذا كان تاريخ
          الصلاحية منتهياً، يُحفظ الحساب بحالة معلّق (pending).
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
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
                    <FormLabel>رقم الهاتف (اختياري)</FormLabel>
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
                    <FormLabel>صالح حتى</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormDescription
                      className={willBePending ? "text-amber-700" : undefined}
                    >
                      {willBePending
                        ? "التاريخ منتهٍ — سيُحفظ بحالة معلّق (pending)"
                        : "إذا انتهى التاريخ يصبح الحساب معلّقاً تلقائياً"}
                    </FormDescription>
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
                name="company_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>اسم الشركة / المكتب (اختياري)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>المدينة (اختياري)</FormLabel>
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
                    <FormLabel>ملاحظات داخلية (اختياري)</FormLabel>
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
              description="صورة شخصية ومستند الهوية — اختياريان."
            />
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={control}
                name="avatar"
                render={() => (
                  <FormItem>
                    <FormLabel>الصورة الشخصية (اختياري)</FormLabel>
                    <FormControl>
                      <OwnerFilePicker
                        hint={avatarPreview ? "تغيير الصورة" : "اختر صورة شخصية"}
                        previewUrl={avatarPreview}
                        onPick={(file) => {
                          setValue("avatar", file, { shouldValidate: true });
                          setAvatarPreview(
                            file ? URL.createObjectURL(file) : null,
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
                    <FormLabel>مستند الهوية (اختياري)</FormLabel>
                    <FormControl>
                      <OwnerFilePicker
                        hint={idPreview ? "تغيير المستند" : "ارفع صورة الهوية"}
                        previewUrl={idPreview}
                        rounded="xl"
                        onPick={(file) => {
                          setValue("id_document", file, { shouldValidate: true });
                          setIdPreview(file ? URL.createObjectURL(file) : null);
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
              render={<Link href="/admin/owners" />}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="animate-spin" />}
              {pending ? "جارِ الإنشاء..." : "إنشاء الحساب"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
