"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { BAN_FOREVER, todayIsoDate, type OwnerActionResult } from "./_shared";

export type { OwnerActionResult };

export async function toggleOwnerActive(
  formData: FormData,
): Promise<OwnerActionResult> {
  const ownerId = String(formData.get("ownerId") ?? "");
  const nextActive = formData.get("nextActive") === "true";

  if (!ownerId) {
    return { error: "معرّف المالك غير صالح", success: false };
  }

  const admin = createAdminClient();

  let account_status: "active" | "inactive" | "pending" = nextActive
    ? "active"
    : "inactive";

  if (nextActive) {
    const { data: owner } = await admin
      .from("users")
      .select("valid_until")
      .eq("id", ownerId)
      .single();

    if (owner?.valid_until && owner.valid_until < todayIsoDate()) {
      account_status = "pending";
    }
  }

  const is_active = account_status === "active";

  const { error: updateError } = await admin
    .from("users")
    .update({ is_active, account_status })
    .eq("id", ownerId);

  if (updateError) {
    return { error: updateError.message, success: false };
  }

  const { error: authError } = await admin.auth.admin.updateUserById(ownerId, {
    ban_duration: is_active ? "none" : BAN_FOREVER,
  });

  if (authError) {
    return { error: authError.message, success: false };
  }

  revalidatePath("/admin/owners", "layout");
  return { error: null, success: true };
}
