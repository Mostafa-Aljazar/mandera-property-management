"use server";

import { createClient } from "@/lib/supabase/server";

export type ChangePasswordState = {
  error: string | null;
  success: boolean;
};

export async function changePassword(
  _prevState: ChangePasswordState,
  formData: FormData,
): Promise<ChangePasswordState> {
  const currentPassword = String(formData.get("current_password") ?? "");
  const newPassword = String(formData.get("new_password") ?? "");
  const confirmPassword = String(formData.get("confirm_password") ?? "");

  if (!currentPassword || !newPassword) {
    return { error: "الرجاء تعبئة كل الحقول", success: false };
  }

  if (newPassword.length < 8) {
    return {
      error: "كلمة المرور الجديدة لازم تكون 8 أحرف على الأقل",
      success: false,
    };
  }

  if (newPassword !== confirmPassword) {
    return {
      error: "كلمة المرور الجديدة وتأكيدها مش متطابقين",
      success: false,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return { error: "غير مصرح", success: false };
  }

  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });

  if (verifyError) {
    return { error: "كلمة المرور الحالية غير صحيحة", success: false };
  }

  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (updateError) {
    return { error: updateError.message, success: false };
  }

  return { error: null, success: true };
}
