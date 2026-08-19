import { NextRequest } from "next/server";
import { requireOwnerOpenApi } from "@/lib/api/auth";
import { openApiError, openApiSuccess } from "@/lib/api/openapi-response";
import { resolveUploadedField } from "@/lib/api/upload";
import { createMaintenanceRequestSchema } from "@/validations/createMaintenanceRequest.schema";
import { arabicDateLabel } from "@/lib/api/date-labels";
import { MAINTENANCE_ISSUE_LABELS, propertyUnitLabel } from "@/lib/api/labels";

/**
 * GET /maintenance-requests - Return MaintenanceRequest[] (no category field, per spec)
 * POST /maintenance-requests - Create with 0+ images; tenant resolved from the unit's active contract
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireOwnerOpenApi(request);
    if (!auth.ok) return auth.response;

    const { supabase, ownerId } = auth.ctx;

    const { data: requests, error } = await supabase
      .from("maintenance_requests")
      .select(
        `id, issue_type, priority, status, created_at,
         properties(name),
         units(unit_number),
         tenants(full_name)`,
      )
      .eq("owner_id", ownerId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[GET maintenance]", error);
      return openApiError("فشل جلب طلبات الصيانة", 500);
    }

    const requestsList = (requests || []).map((r: any) => ({
      id: r.id,
      title: MAINTENANCE_ISSUE_LABELS[r.issue_type as keyof typeof MAINTENANCE_ISSUE_LABELS] || MAINTENANCE_ISSUE_LABELS.other,
      tenant_name: r.tenants?.full_name || "",
      property_unit_label: propertyUnitLabel(r.properties?.name || "", r.units?.unit_number || ""),
      priority: r.priority,
      status: r.status,
      date_label: arabicDateLabel(r.created_at),
    }));

    return openApiSuccess(requestsList);
  } catch (err) {
    console.error("[GET maintenance]", err);
    return openApiError("خطأ في الخادم", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireOwnerOpenApi(request);
    if (!auth.ok) return auth.response;

    const { supabase, ownerId } = auth.ctx;

    const formData = await request.formData();
    const parsed = createMaintenanceRequestSchema.safeParse({
      property_id: formData.get("property_id"),
      unit_id: formData.get("unit_id"),
      category: formData.get("category"),
      priority: formData.get("priority"),
      description: formData.get("description"),
      notes: formData.get("notes"),
    });

    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "بيانات الطلب غير صالحة";
      return openApiError(message, 422);
    }

    const data = parsed.data;

    const { data: property } = await supabase
      .from("properties")
      .select("id, name")
      .eq("id", data.property_id)
      .eq("owner_id", ownerId)
      .maybeSingle();
    if (!property) return openApiError("العقار غير موجود", 404);

    const { data: unit } = await supabase
      .from("units")
      .select("id, unit_number")
      .eq("id", data.unit_id)
      .eq("owner_id", ownerId)
      .eq("property_id", data.property_id)
      .maybeSingle();
    if (!unit) return openApiError("الوحدة غير موجودة", 404);

    const { data: contract } = await supabase
      .from("contracts")
      .select("tenant_id, tenants(full_name)")
      .eq("unit_id", data.unit_id)
      .eq("owner_id", ownerId)
      .in("status", ["active", "expiring_soon"])
      .maybeSingle();

    const imageUrls: string[] = [];
    for (const entry of formData.getAll("images")) {
      const resolved = await resolveUploadedField(
        supabase,
        "maintenance-images",
        ownerId,
        `${ownerId}/${Date.now()}-${Math.random()}`,
        entry,
      );
      if ("error" in resolved) {
        return openApiError(`فشل رفع الصورة: ${resolved.error}`, 422);
      }
      if (resolved.url) imageUrls.push(resolved.url);
    }

    const description = data.notes ? `${data.description}\n${data.notes}` : data.description;

    const { data: maintenanceReq, error: insertError } = await supabase
      .from("maintenance_requests")
      .insert({
        owner_id: ownerId,
        description,
        issue_type: data.category,
        priority: data.priority,
        status: "new_request",
        property_id: data.property_id,
        unit_id: data.unit_id,
        tenant_id: contract?.tenant_id || null,
        images: imageUrls,
      })
      .select("*")
      .single();

    if (insertError) {
      console.error("[POST maintenance insert]", insertError);
      return openApiError("فشل إنشاء طلب الصيانة", 500);
    }

    return openApiSuccess(
      {
        id: maintenanceReq.id,
        title: MAINTENANCE_ISSUE_LABELS[maintenanceReq.issue_type as keyof typeof MAINTENANCE_ISSUE_LABELS],
        tenant_name: (contract as any)?.tenants?.full_name || "",
        property_unit_label: propertyUnitLabel(property.name, unit.unit_number),
        priority: maintenanceReq.priority,
        status: maintenanceReq.status,
        date_label: arabicDateLabel(maintenanceReq.created_at),
      },
      201,
    );
  } catch (err) {
    console.error("[POST maintenance]", err);
    return openApiError("خطأ في الخادم", 500);
  }
}
