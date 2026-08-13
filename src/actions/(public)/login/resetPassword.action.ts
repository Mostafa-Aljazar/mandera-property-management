"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { resetPasswordSchema } from "@/validations/forgotPassword.schema";

export type ResetPasswordState = {
  error: string | null;
  success: boolean;
};

export async function resetPassword(
  _prevState: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  const parsed = resetPasswordSchema.safeParse({
    password: formData.get("password"),
    confirm_password: formData.get("confirm_password"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "البيانات غير صالحة",
      success: false,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: "رابط الاستعادة غير صالح أو منتهي. اطلب رابطاً جديداً.",
      success: false,
    };
  }

  const { data: profile } = await supabase
    .from("users")
    .select("role, is_active")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "master_admin" || !profile.is_active) {
    await supabase.auth.signOut();
    return {
      error: "هذا الحساب غير مصرح له باستعادة كلمة مرور مدير المنصة",
      success: false,
    };
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    return {
      error: error.message || "تعذر تحديث كلمة المرور",
      success: false,
    };
  }

  await supabase.auth.signOut();
  redirect("/login?reset=success");
}
