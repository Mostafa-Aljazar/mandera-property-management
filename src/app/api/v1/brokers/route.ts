import { NextRequest } from "next/server";
import { requireOwnerOpenApi } from "@/lib/api/auth";
import { openApiError, openApiSuccess } from "@/lib/api/openapi-response";
import { resolveUploadedField } from "@/lib/api/upload";
import { createBrokerSchema } from "@/validations/openapi-create-broker.schema";

/**
 * GET /brokers - Return Broker[]
 * POST /brokers - Create broker with personal_photo (required)
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireOwnerOpenApi(request);
    if (!auth.ok) return auth.response;

    const { supabase, ownerId } = auth.ctx;

    const { data: brokers, error } = await supabase
      .from("brokers")
      .select(
        "id, full_name, company_name, commercial_license_number, phone, mobile, email, avatar_url, nationality, is_verified",
      )
      .eq("owner_id", ownerId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[GET brokers]", error);
      return openApiError("فشل جلب السماسرة", 500);
    }

    const brokersList = (brokers || []).map((b: any) => ({
      id: b.id,
      full_name: b.full_name,
      company_name: b.company_name || null,
      commercial_license_number: b.commercial_license_number,
      phone: b.phone || "",
      mobile: b.mobile || "",
      email: b.email || null,
      avatar_url: b.avatar_url || null,
      nationality_label: b.nationality || "",
      is_verified: b.is_verified || false,
    }));

    return openApiSuccess(brokersList);
  } catch (err) {
    console.error("[GET brokers]", err);
    return openApiError("خطأ في الخادم", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireOwnerOpenApi(request);
    if (!auth.ok) return auth.response;

    const { supabase, ownerId } = auth.ctx;

    const formData = await request.formData();
    const parsed = createBrokerSchema.safeParse({
      full_name: formData.get("full_name"),
      company_name: formData.get("company_name"),
      commercial_license_number: formData.get("commercial_license_number"),
      nationality_code: formData.get("nationality_code"),
      nationality: formData.get("nationality"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      mobile: formData.get("mobile"),
    });

    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "بيانات غير صالحة";
      return openApiError(message, 422);
    }

    const data = parsed.data;

    const personalUploaded = await resolveUploadedField(
      supabase,
      "broker-photos",
      ownerId,
      `${ownerId}/broker-${Date.now()}-personal`,
      formData.get("personal_photo"),
    );
    if ("error" in personalUploaded) {
      return openApiError(`فشل تحميل الصورة الشخصية: ${personalUploaded.error}`, 422);
    }
    if (!personalUploaded.url) {
      return openApiError("الصورة الشخصية مطلوبة", 422);
    }

    const { data: broker, error: insertError } = await supabase
      .from("brokers")
      .insert({
        owner_id: ownerId,
        full_name: data.full_name,
        company_name: data.company_name,
        commercial_license_number: data.commercial_license_number,
        nationality: data.nationality,
        nationality_code: data.nationality_code,
        email: data.email,
        phone: data.phone,
        mobile: data.mobile,
        avatar_url: personalUploaded.url,
      })
      .select("*")
      .single();

    if (insertError) {
      console.error("[POST brokers insert]", insertError);
      return openApiError("فشل إنشاء السمسار", 500);
    }

    return openApiSuccess(
      {
        id: broker.id,
        full_name: broker.full_name,
        company_name: broker.company_name || null,
        commercial_license_number: broker.commercial_license_number,
        phone: broker.phone || "",
        mobile: broker.mobile || "",
        email: broker.email || null,
        avatar_url: broker.avatar_url || null,
        nationality_label: broker.nationality || "",
        is_verified: broker.is_verified || false,
      },
      201,
    );
  } catch (err) {
    console.error("[POST brokers]", err);
    return openApiError("خطأ في الخادم", 500);
  }
}
