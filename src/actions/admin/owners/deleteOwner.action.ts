"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { BAN_FOREVER, type OwnerActionResult } from "./_shared";

export async function deleteOwner(
  formData: FormData,
): Promise<OwnerActionResult> {
  const ownerId = String(formData.get("ownerId") ?? "");
  if (!ownerId) {
    return { error: "معرّف المالك غير صالح", success: false };
  }

  const admin = createAdminClient();

  const { error: updateError } = await admin
    .from("users")
    .update({
      deleted_at: new Date().toISOString(),
      is_active: false,
      account_status: "inactive",
    })
    .eq("id", ownerId);

  if (updateError) {
    return { error: updateError.message, success: false };
  }

  const { error: authError } = await admin.auth.admin.updateUserById(ownerId, {
    ban_duration: BAN_FOREVER,
  });

  if (authError) {
    return { error: authError.message, success: false };
  }

  revalidatePath("/admin/owners", "layout");
  return { error: null, success: true };
}
