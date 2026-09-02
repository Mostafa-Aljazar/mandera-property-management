import { NextRequest } from "next/server";
import { requireOwnerOpenApi } from "@/lib/api/auth";
import { openApiError, openApiSuccess } from "@/lib/api/openapi-response";
import { resolveUploadedField } from "@/lib/api/upload";

/**
 * POST /units/vacant-report/send - Store a client-rendered vacant-units PDF
 * report and record it against the referenced broker.
 *
 * TODO: actual delivery to the broker (email/WhatsApp/etc.) is an open
 * decision — see docs/new/backend-decisions.md point 1. This endpoint only
 * validates the broker, stores the file, and logs the send; no delivery
 * channel is wired up yet.
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireOwnerOpenApi(request);
    if (!auth.ok) return auth.response;

    const { supabase, ownerId } = auth.ctx;

    const formData = await request.formData();
    const brokerId = formData.get("broker_id");

    if (typeof brokerId !== "string" || !brokerId.trim()) {
      return openApiError("broker_id مطلوب", 422);
    }

    const { data: broker, error: brokerError } = await supabase
      .from("brokers")
      .select("id")
      .eq("id", brokerId.trim())
      .eq("owner_id", ownerId)
      .is("deleted_at", null)
      .maybeSingle();

    if (brokerError) {
      console.error("[POST vacant-report/send broker lookup]", brokerError);
      return openApiError("خطأ في الخادم", 500);
    }
    if (!broker) {
      return openApiError("السمسار غير موجود", 404);
    }

    const reportUploaded = await resolveUploadedField(
      supabase,
      "vacant-reports",
      ownerId,
      `${ownerId}/vacant-report-${Date.now()}`,
      formData.get("report"),
    );
    if ("error" in reportUploaded) {
      return openApiError(`فشل تحميل التقرير: ${reportUploaded.error}`, 422);
    }
    if (!reportUploaded.url) {
      return openApiError("ملف التقرير مطلوب", 422);
    }

    const { error: insertError } = await supabase.from("vacant_unit_reports").insert({
      owner_id: ownerId,
      broker_id: broker.id,
      report_url: reportUploaded.url,
    });

    if (insertError) {
      console.error("[POST vacant-report/send insert]", insertError);
      return openApiError("فشل تسجيل التقرير", 500);
    }

    // TODO: deliver reportUploaded.url to the broker (email/WhatsApp/etc.)
    // once the delivery channel decision is made.

    return openApiSuccess({ message: "تم استلام التقرير" }, 200);
  } catch (err) {
    console.error("[POST vacant-report/send]", err);
    return openApiError("خطأ في الخادم", 500);
  }
}
