"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { createOwnerSchema } from "@/validations/createOwner.schema";
import {
  BAN_FOREVER,
  emptyToNull,
  generateTempPassword,
  todayIsoDate,
  uploadImage,
} from "./_shared";

export type CreateOwnerState = {
  error: string | null;
  success: {
    email: string;
    password: string;
    account_status: "active" | "pending";
  } | null;
};

export async function createOwner(
  _prevState: CreateOwnerState,
  formData: FormData,
): Promise<CreateOwnerState> {
  const parsed = createOwnerSchema.safeParse({
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
      success: null,
    };
  }

  const data = parsed.data;
  const account_status =
    data.valid_until < todayIsoDate() ? "pending" : "active";
  const is_active = account_status === "active";

  const supabase = await createClient();
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  if (!currentUser) {
    return { error: "غير مصرح", success: null };
  }

  const admin = createAdminClient();
  const password = generateTempPassword();

  const { data: created, error: createError } =
    await admin.auth.admin.createUser({
      email: data.email,
      password,
      email_confirm: true,
      ban_duration: is_active ? "none" : BAN_FOREVER,
    });

  if (createError || !created.user) {
    const message =
      createError?.code === "email_exists"
        ? "هذا البريد مستخدم بحساب موجود مسبقاً"
        : (createError?.message ?? "تعذر إنشاء الحساب");
    return { error: message, success: null };
  }

  const userId = created.user.id;
  let avatar_url: string | null = null;
  let id_document_url: string | null = null;

  if (data.avatar) {
    const uploaded = await uploadImage(admin, userId, data.avatar, "avatar");
    if (uploaded.error) {
      await admin.auth.admin.deleteUser(userId);
      return { error: `تعذر رفع الصورة: ${uploaded.error}`, success: null };
    }
    avatar_url = uploaded.url;
  }

  if (data.id_document) {
    const uploaded = await uploadImage(
      admin,
      userId,
      data.id_document,
      "id-document",
    );
    if (uploaded.error) {
      await admin.auth.admin.deleteUser(userId);
      return {
        error: `تعذر رفع مستند الهوية: ${uploaded.error}`,
        success: null,
      };
    }
    id_document_url = uploaded.url;
  }

  const { error: profileError } = await admin.from("users").insert({
    id: userId,
    role: "owner",
    full_name: data.full_name,
    email: data.email,
    phone: emptyToNull(data.phone),
    national_id: data.national_id,
    valid_until: data.valid_until,
    account_status,
    is_active,
    company_name: emptyToNull(data.company_name),
    city: emptyToNull(data.city),
    notes: emptyToNull(data.notes),
    avatar_url,
    id_document_url,
    created_by: currentUser.id,
  });

  if (profileError) {
    await admin.auth.admin.deleteUser(userId);
    return { error: profileError.message, success: null };
  }

  revalidatePath("/admin/owners");
  return {
    error: null,
    success: { email: data.email, password, account_status },
  };
}
