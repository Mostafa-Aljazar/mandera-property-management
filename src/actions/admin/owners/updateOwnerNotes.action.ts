"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type UpdateOwnerNotesState = {
  error: string | null;
  success: boolean;
  updatedAt: number | null;
};

export async function updateOwnerNotes(
  _prevState: UpdateOwnerNotesState,
  formData: FormData,
): Promise<UpdateOwnerNotesState> {
  const ownerId = String(formData.get("ownerId") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!ownerId) {
    return { error: "معرّف المالك غير صالح", success: false, updatedAt: null };
  }

  if (notes.length > 2000) {
    return {
      error: "الملاحظات يجب ألا تتجاوز 2000 حرف",
      success: false,
      updatedAt: null,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "غير مصرح", success: false, updatedAt: null };
  }

  const { data: profile } = await supabase
    .from("users")
    .select("role, is_active")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "master_admin" || !profile.is_active) {
    return { error: "غير مصرح", success: false, updatedAt: null };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("users")
    .update({ notes: notes || null })
    .eq("id", ownerId)
    .eq("role", "owner")
    .is("deleted_at", null);

  if (error) {
    return { error: error.message, success: false, updatedAt: null };
  }

  revalidatePath(`/admin/owners/${ownerId}`);
  revalidatePath("/admin/owners");
  return { error: null, success: true, updatedAt: Date.now() };
}
