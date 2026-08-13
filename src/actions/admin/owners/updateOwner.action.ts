"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { updateOwnerSchema } from "@/validations/updateOwner.schema";
import {
  BAN_FOREVER,
  emptyToNull,
  todayIsoDate,
  uploadImage,
} from "./_shared";

export type UpdateOwnerState = {
  error: string | null;
  success: boolean;
  updatedAt: number | null;
};

export async function updateOwner(
  _prevState: UpdateOwnerState,
  formData: FormData,
): Promise<UpdateOwnerState> {
  const parsed = updateOwnerSchema.safeParse({
    ownerId: formData.get("ownerId"),
    full_name: formData.get("full_name"),
    email: formData.get("email"),
    phone: formData.get("phone") ?? "",
    national_id: formData.get("national_id"),
    valid_until: formData.get("valid_until"),
    company_name: formData.get("company_name") ?? "",
    city: formData.get("city") ?? "",
    notes: formData.get("notes") ?? "",
    avatar: (() => {
      const f = formData.get("avatar");
      return f instanceof File && f.size > 0 ? f : undefined;
    })(),
    id_document: (() => {
      const f = formData.get("id_document");
      return f instanceof File && f.size > 0 ? f : undefined;
    })(),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "البيانات غير صالحة",
      success: false,
      updatedAt: null,
    };
  }

  const data = parsed.data;

  const supabase = await createClient();
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  if (!currentUser) {
    return { error: "غير مصرح", success: false, updatedAt: null };
  }

  const admin = createAdminClient();

  const { data: existing, error: fetchError } = await admin
    .from("users")
    .select(
      "id, email, account_status, is_active, avatar_url, id_document_url, deleted_at",
    )
    .eq("id", data.ownerId)
    .eq("role", "owner")
    .single();

  if (fetchError || !existing) {
    return { error: "المالك غير موجود", success: false, updatedAt: null };
  }

  if (existing.deleted_at) {
    return {
      error: "لا يمكن تعديل حساب محذوف",
      success: false,
      updatedAt: null,
    };
  }

  let avatar_url = existing.avatar_url as string | null;
  let id_document_url = existing.id_document_url as string | null;

  if (data.avatar) {
    const uploaded = await uploadImage(
      admin,
      data.ownerId,
      data.avatar,
      "avatar",
    );
    if (uploaded.error) {
      return {
        error: `تعذر رفع الصورة: ${uploaded.error}`,
        success: false,
        updatedAt: null,
      };
    }
    avatar_url = uploaded.url;
  }

  if (data.id_document) {
    const uploaded = await uploadImage(
      admin,
      data.ownerId,
      data.id_document,
      "id-document",
    );
    if (uploaded.error) {
      return {
        error: `تعذر رفع مستند الهوية: ${uploaded.error}`,
        success: false,
        updatedAt: null,
      };
    }
    id_document_url = uploaded.url;
  }

  const expired = data.valid_until < todayIsoDate();
  let account_status: "active" | "inactive" | "pending";
  let is_active: boolean;

  if (expired) {
    account_status = "pending";
    is_active = false;
  } else if (existing.account_status === "inactive") {
    account_status = "inactive";
    is_active = false;
  } else {
    account_status = "active";
    is_active = true;
  }

  if (data.email !== existing.email) {
    const { error: authEmailError } = await admin.auth.admin.updateUserById(
      data.ownerId,
      { email: data.email, email_confirm: true },
    );
    if (authEmailError) {
      const message =
        authEmailError.message?.toLowerCase().includes("already") ||
        authEmailError.code === "email_exists"
          ? "هذا البريد مستخدم بحساب موجود مسبقاً"
          : authEmailError.message;
      return { error: message, success: false, updatedAt: null };
    }
  }

  const { error: updateError } = await admin
    .from("users")
    .update({
      full_name: data.full_name,
      email: data.email,
      phone: emptyToNull(data.phone),
      national_id: data.national_id,
      valid_until: data.valid_until,
      company_name: emptyToNull(data.company_name),
      city: emptyToNull(data.city),
      notes: emptyToNull(data.notes),
      avatar_url,
      id_document_url,
      account_status,
      is_active,
    })
    .eq("id", data.ownerId);

  if (updateError) {
    return { error: updateError.message, success: false, updatedAt: null };
  }

  const { error: authBanError } = await admin.auth.admin.updateUserById(
    data.ownerId,
    { ban_duration: is_active ? "none" : BAN_FOREVER },
  );

  if (authBanError) {
    return { error: authBanError.message, success: false, updatedAt: null };
  }

  revalidatePath("/admin/owners", "layout");
  revalidatePath(`/admin/owners/${data.ownerId}`);
  revalidatePath(`/admin/owners/${data.ownerId}/edit`);

  return { error: null, success: true, updatedAt: Date.now() };
}
