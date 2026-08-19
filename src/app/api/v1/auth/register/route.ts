import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { openApiError, openApiSuccess } from "@/lib/api/openapi-response";
import { openApiRegisterSchema } from "@/validations/openapi-register.schema";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = openApiRegisterSchema.safeParse(body);

    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "بيانات غير صالحة";
      return openApiError(message, 422);
    }

    const { username: _, email, phone, password } = parsed.data;

    const admin = createAdminClient();

    // Check if email already exists
    const { data: existingByEmail } = await admin
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existingByEmail) {
      return openApiError("هذا البريد الإلكتروني مستخدم بالفعل", 409);
    }

    // Check if phone already exists
    const { data: existingByPhone } = await admin
      .from("users")
      .select("id")
      .eq("phone", phone)
      .maybeSingle();

    if (existingByPhone) {
      return openApiError("هذا رقم الهاتف مستخدم بالفعل", 409);
    }

    // Create auth user
    const { data: authData, error: authError } =
      await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: false, // Require email verification
      });

    if (authError || !authData.user?.id) {
      if (authError?.message?.includes("already exists")) {
        return openApiError("البريد الإلكتروني مستخدم بالفعل", 409);
      }
      return openApiError("فشل التسجيل", 400);
    }

    const userId = authData.user.id;

    // Create public.users row with role='owner', account_status='pending'
    const { error: profileError } = await admin
      .from("users")
      .insert({
        id: userId,
        email,
        phone,
        role: "owner",
        account_status: "pending",
        is_active: false,
        full_name: "", // Empty for now, owner can update later
      });

    if (profileError) {
      // Rollback: delete the auth user
      await admin.auth.admin.deleteUser(userId);
      return openApiError("فشل إنشاء الملف الشخصي", 400);
    }

    return openApiSuccess(
      {
        user_id: userId,
        message: "تم التسجيل بنجاح، في انتظار تفعيل الحساب من قبل المسؤول",
      },
      201,
    );
  } catch (err) {
    console.error("[register]", err);
    return openApiError("خطأ في الخادم", 500);
  }
}
