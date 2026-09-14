"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { subscriptionPaymentSchema } from "@/validations/subscriptionPayment.schema";
import { BAN_FOREVER, todayIsoDate } from "./_shared";

export type RecordSubscriptionPaymentState = {
  error: string | null;
  success: boolean;
};

export async function recordSubscriptionPayment(
  _prevState: RecordSubscriptionPaymentState,
  formData: FormData,
): Promise<RecordSubscriptionPaymentState> {
  const parsed = subscriptionPaymentSchema.safeParse({
    ownerId: formData.get("ownerId"),
    amount: formData.get("amount"),
    period_start: formData.get("period_start"),
    period_end: formData.get("period_end"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "البيانات غير صالحة",
      success: false,
    };
  }

  const data = parsed.data;

  const supabase = await createClient();
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  if (!currentUser) {
    return { error: "غير مصرح", success: false };
  }

  const admin = createAdminClient();

  const { data: owner, error: fetchError } = await admin
    .from("users")
    .select("id, account_status, deleted_at")
    .eq("id", data.ownerId)
    .eq("role", "owner")
    .single();

  if (fetchError || !owner) {
    return { error: "المالك غير موجود", success: false };
  }

  if (owner.deleted_at) {
    return { error: "لا يمكن تعديل حساب محذوف", success: false };
  }

  const { error: insertError } = await admin.from("subscription_payments").insert({
    owner_id: data.ownerId,
    amount: data.amount,
    period_start: data.period_start,
    period_end: data.period_end,
    created_by: currentUser.id,
  });

  if (insertError) {
    return { error: insertError.message, success: false };
  }

  const expired = data.period_end < todayIsoDate();
  let account_status: "active" | "inactive" | "pending";
  let is_active: boolean;

  if (expired) {
    account_status = "pending";
    is_active = false;
  } else if (owner.account_status === "inactive") {
    account_status = "inactive";
    is_active = false;
  } else {
    account_status = "active";
    is_active = true;
  }

  const { error: updateError } = await admin
    .from("users")
    .update({ valid_until: data.period_end, account_status, is_active })
    .eq("id", data.ownerId);

  if (updateError) {
    return { error: updateError.message, success: false };
  }

  await admin.auth.admin.updateUserById(data.ownerId, {
    ban_duration: is_active ? "none" : BAN_FOREVER,
  });

  revalidatePath(`/admin/owners/${data.ownerId}`);
  revalidatePath("/admin/owners", "layout");
  revalidatePath("/admin/reports");

  return { error: null, success: true };
}
