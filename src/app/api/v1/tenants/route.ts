import { NextRequest } from "next/server";
import { requireOwnerOpenApi } from "@/lib/api/auth";
import { openApiError, openApiSuccess } from "@/lib/api/openapi-response";
import { resolveUploadedField } from "@/lib/api/upload";
import { createTenantSchema } from "@/validations/createTenant.schema";
import { arabicDateLabel } from "@/lib/api/date-labels";
import { propertyUnitLabel, unitTypeLabel } from "@/lib/api/labels";

function overdueLabel(days: number): string {
  if (days < 30) return `${days} يوم`;
  const months = Math.floor(days / 30);
  if (months === 1) return "شهر واحد";
  if (months === 2) return "شهران";
  return `${months} أشهر`;
}

/**
 * GET /tenants - Return Tenant[] with computed status (from active contract)
 * POST /tenants - Create tenant with personal_photo + id_photo
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireOwnerOpenApi(request);
    if (!auth.ok) return auth.response;

    const { supabase, ownerId } = auth.ctx;

    const { data: tenants, error } = await supabase
      .from("tenants")
      .select(
        `id, full_name, national_id, phone, email, photo_url, is_verified,
         contracts!contracts_tenant_id_fkey(id, start_date, end_date, status, contract_file_url,
          units(unit_number, unit_type, annual_rent, properties(name)),
          payments(amount, status, due_date))`,
      )
      .eq("owner_id", ownerId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[GET tenants]", error);
      return openApiError("فشل جلب المستأجرين", 500);
    }

    const tenantsList = (tenants || []).map((t: any) => {
      const activeContract = (t.contracts || []).find(
        (c: any) => c.status === "active" || c.status === "expiring_soon",
      );
      const unit = activeContract?.units;
      const payments = activeContract?.payments || [];
      const overduePayments = payments.filter((p: any) => p.status === "overdue");
      const pendingPayments = payments.filter(
        (p: any) => p.status === "due" || p.status === "overdue",
      );

      const monthlyRent = unit ? Math.round((unit.annual_rent || 0) / 12) : 0;

      let status: "active" | "expiring_soon" | "overdue" = "active";
      if (overduePayments.length > 0) status = "overdue";
      else if (activeContract?.status === "expiring_soon") status = "expiring_soon";

      let overdue_label: string | null = null;
      if (status === "overdue") {
        const earliestDue = overduePayments
          .map((p: any) => p.due_date)
          .sort()[0];
        const days = Math.floor(
          (Date.now() - new Date(earliestDue).getTime()) / (1000 * 60 * 60 * 24),
        );
        overdue_label = overdueLabel(Math.max(0, days));
      }

      const totalPaid = payments
        .filter((p: any) => p.status === "paid")
        .reduce((sum: number, p: any) => sum + p.amount, 0);
      const remainingAmount = pendingPayments.reduce(
        (sum: number, p: any) => sum + p.amount,
        0,
      );
      const nextPending = pendingPayments
        .slice()
        .sort((a: any, b: any) => (a.due_date > b.due_date ? 1 : -1))[0];

      return {
        id: t.id,
        full_name: t.full_name,
        national_id: t.national_id || "",
        phone: t.phone || "",
        email: t.email || null,
        avatar_url: t.photo_url || null,
        is_verified: t.is_verified || false,
        unit_type_label: unit ? unitTypeLabel(unit.unit_type, unit.unit_number) : "",
        property_unit_label: unit ? propertyUnitLabel(unit.properties?.name || "", unit.unit_number) : "",
        monthly_rent: monthlyRent,
        is_rent_paid: pendingPayments.length === 0,
        status,
        overdue_label,
        contract: activeContract
          ? {
              total_paid: totalPaid,
              remaining_amount: remainingAmount,
              next_payment_date_label: nextPending
                ? arabicDateLabel(nextPending.due_date)
                : arabicDateLabel(activeContract.end_date),
              start_date_label: arabicDateLabel(activeContract.start_date),
              end_date_label: arabicDateLabel(activeContract.end_date),
              progress_percent:
                totalPaid + remainingAmount > 0
                  ? totalPaid / (totalPaid + remainingAmount)
                  : 0,
              documents: activeContract.contract_file_url
                ? [
                    {
                      title: "عقد الإيجار",
                      file_type_label:
                        activeContract.contract_file_url.split(".").pop()?.toUpperCase() || "FILE",
                      file_size_label: "-",
                    },
                  ]
                : [],
            }
          : null,
      };
    });

    return openApiSuccess(tenantsList);
  } catch (err) {
    console.error("[GET tenants]", err);
    return openApiError("خطأ في الخادم", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireOwnerOpenApi(request);
    if (!auth.ok) return auth.response;

    const { supabase, ownerId } = auth.ctx;

    const formData = await request.formData();
    const parsed = createTenantSchema.safeParse({
      full_name: formData.get("full_name"),
      national_id: formData.get("national_id"),
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
      "tenant-photos",
      ownerId,
      `${ownerId}/tenant-${Date.now()}-personal`,
      formData.get("personal_photo"),
    );
    if ("error" in personalUploaded) {
      return openApiError(`فشل تحميل الصورة الشخصية: ${personalUploaded.error}`, 422);
    }
    if (!personalUploaded.url) {
      return openApiError("الصورة الشخصية مطلوبة", 422);
    }

    const idUploaded = await resolveUploadedField(
      supabase,
      "tenant-documents",
      ownerId,
      `${ownerId}/tenant-${Date.now()}-id`,
      formData.get("id_photo"),
    );
    if ("error" in idUploaded) {
      return openApiError(`فشل تحميل صورة الهوية: ${idUploaded.error}`, 422);
    }
    if (!idUploaded.url) {
      return openApiError("صورة الهوية مطلوبة", 422);
    }

    const { data: tenant, error: insertError } = await supabase
      .from("tenants")
      .insert({
        owner_id: ownerId,
        full_name: data.full_name,
        national_id: data.national_id,
        nationality: data.nationality,
        nationality_code: data.nationality_code,
        email: data.email,
        phone: data.mobile,
        photo_url: personalUploaded.url,
        id_document_url: idUploaded.url,
      })
      .select("*")
      .single();

    if (insertError) {
      console.error("[POST tenants insert]", insertError);
      return openApiError("فشل إنشاء المستأجر", 500);
    }

    return openApiSuccess(
      {
        id: tenant.id,
        full_name: tenant.full_name,
        national_id: tenant.national_id || "",
        phone: tenant.phone || "",
        email: tenant.email || null,
        avatar_url: tenant.photo_url || null,
        is_verified: tenant.is_verified || false,
        unit_type_label: "",
        property_unit_label: "",
        monthly_rent: 0,
        is_rent_paid: true,
        status: "active",
        overdue_label: null,
        contract: null,
      },
      201,
    );
  } catch (err) {
    console.error("[POST tenants]", err);
    return openApiError("خطأ في الخادم", 500);
  }
}
