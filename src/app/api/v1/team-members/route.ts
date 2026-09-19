import { NextRequest } from "next/server";
import { requireOwnerOpenApi } from "@/lib/api/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { openApiError, openApiSuccess } from "@/lib/api/openapi-response";
import { createTeamMemberSchema } from "@/validations/openapi-team-member.schema";

export async function GET(request: NextRequest) {
    try {
        const auth = await requireOwnerOpenApi(request);
        if (!auth.ok) return auth.response;

        const { ownerId } = auth.ctx;
        const admin = createAdminClient();
        const { data: members, error } = await admin
            .from("users")
            .select("id, full_name, email, phone, role, rank, created_at")
            .eq("organization_id", ownerId)
            .neq("id", ownerId)
            .is("deleted_at", null)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("[GET team-members]", error);
            return openApiError("فشل جلب أعضاء الفريق", 500);
        }

        return openApiSuccess(members ?? []);
    } catch (error) {
        console.error("[GET team-members]", error);
        return openApiError("خطأ في الخادم", 500);
    }
}

export async function POST(request: NextRequest) {
    try {
        const auth = await requireOwnerOpenApi(request);
        if (!auth.ok) return auth.response;

        if (auth.ctx.profile.rank !== "manager") {
            return openApiError("فقط المدير يستطيع إضافة أعضاء الفريق", 403);
        }

        const body = await request.json();
        const parsed = createTeamMemberSchema.safeParse(body);
        if (!parsed.success) {
            return openApiError(parsed.error.issues[0]?.message ?? "بيانات غير صالحة", 422);
        }

        const { full_name, email, phone, password, rank } = parsed.data;
        const { ownerId } = auth.ctx;
        const admin = createAdminClient();
        const { data: created, error: createError } = await admin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
        });

        if (createError || !created.user) {
            const status = createError?.code === "email_exists" ? 409 : 422;
            return openApiError(
                createError?.code === "email_exists"
                    ? "هذا البريد مستخدم بحساب موجود مسبقاً"
                    : createError?.message ?? "تعذر إنشاء الحساب",
                status,
            );
        }

        const { data: member, error: profileError } = await admin
            .from("users")
            .insert({
                id: created.user.id,
                role: "owner",
                rank,
                organization_id: ownerId,
                created_by: ownerId,
                full_name,
                email,
                phone,
                is_active: true,
                account_status: "active",
            })
            .select("id, full_name, email, phone, role, rank, created_at")
            .single();

        if (profileError || !member) {
            try {
                await admin.auth.admin.deleteUser(created.user.id);
            } catch (cleanupError) {
                console.error("ORPHAN_AUTH_USER", created.user.id, cleanupError);
            }
            console.error("[POST team-members profile]", profileError);
            if (profileError?.code === "23505") {
                return openApiError("رقم الهاتف مستخدم بحساب آخر", 409);
            }
            return openApiError("تعذر إنشاء ملف عضو الفريق", 500);
        }

        return openApiSuccess(member, 201);
    } catch (error) {
        console.error("[POST team-members]", error);
        return openApiError("خطأ في الخادم", 500);
    }
}