import { NextRequest } from "next/server";
import { requireOwnerOpenApi } from "@/lib/api/auth";
import { openApiError, openApiSuccess } from "@/lib/api/openapi-response";
import { createUnitSchema } from "@/validations/createUnit.schema";
import { resolveUploadedField } from "@/lib/api/upload";
import { arabicMonthLabel } from "@/lib/api/date-labels";
import type { Database } from "@/lib/supabase/database.types";

type UnitType = Database["public"]["Enums"]["unit_type"];
const UNIT_TYPES: readonly UnitType[] = [
  "apartment",
  "studio",
  "villa",
  "office",
  "shop",
  "warehouse",
];

function monthsBetween(start: string, end: string): number {
  const s = new Date(start);
  const e = new Date(end);
  return Math.max(
    0,
    (e.getUTCFullYear() - s.getUTCFullYear()) * 12 + (e.getUTCMonth() - s.getUTCMonth()),
  );
}

/**
 * GET /units - Return flat Unit[] across all properties with current_contract
 * POST /units - Create unit with 0+ photos
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireOwnerOpenApi(request);
    if (!auth.ok) return auth.response;

    const { supabase, ownerId } = auth.ctx;

    const { data: units, error } = await supabase
      .from("units")
      .select(
        `id, property_id, unit_number, floor, rooms, bathrooms, area,
         unit_type, status, annual_rent, rent_period, images,
         properties(id, name),
         contracts!contracts_unit_id_fkey(id, start_date, end_date, status,
          tenants(full_name), payments(amount, status)),
         maintenance_requests(id, description, status, created_at)`,
      )
      .eq("owner_id", ownerId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[GET units]", error);
      return openApiError("فشل جلب الوحدات", 500);
    }

    const unitsList = (units || []).map((u: any) => {
      const activeContract = (u.contracts || []).find(
        (c: any) => c.status === "active" || c.status === "expiring_soon",
      );

      const monthlyRent = Math.round((u.annual_rent || 0) / 12);

      const openMaintenance = (u.maintenance_requests || [])
        .filter((m: any) => m.status === "new_request" || m.status === "in_progress")
        .sort((a: any, b: any) => (a.created_at < b.created_at ? 1 : -1))[0];

      return {
        id: u.id,
        property_id: u.property_id,
        property_name: u.properties?.name || "",
        unit_number: u.unit_number,
        type: UNIT_TYPES.includes(u.unit_type) ? u.unit_type : "apartment",
        status: u.status,
        floor: u.floor ?? 0,
        area: u.area ?? 0,
        rooms: u.rooms ?? 0,
        bathrooms: u.bathrooms ?? 0,
        annual_rent: u.annual_rent ?? 0,
        image_urls: u.images || [],
        current_contract: activeContract
          ? {
              tenant_name: activeContract.tenants?.full_name || "",
              duration_months: monthsBetween(activeContract.start_date, activeContract.end_date),
              end_label: arabicMonthLabel(activeContract.end_date),
              monthly_rent: monthlyRent,
              amount_due: (activeContract.payments || [])
                .filter((p: any) => p.status === "due" || p.status === "overdue")
                .reduce((sum: number, p: any) => sum + p.amount, 0),
            }
          : null,
        rent_amount: monthlyRent,
        rent_period: u.rent_period,
        maintenance_note: openMaintenance?.description || null,
      };
    });

    return openApiSuccess(unitsList);
  } catch (err) {
    console.error("[GET units]", err);
    return openApiError("خطأ في الخادم", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireOwnerOpenApi(request);
    if (!auth.ok) return auth.response;

    const { supabase, ownerId } = auth.ctx;

    const formData = await request.formData();
    const amenitiesRaw = formData.getAll("amenities");
    const amenities =
      amenitiesRaw.length > 0
        ? amenitiesRaw.map(String)
        : formData.get("amenities")
          ? JSON.parse(String(formData.get("amenities")))
          : [];

    const parsed = createUnitSchema.safeParse({
      property_id: formData.get("property_id"),
      floor: formData.get("floor"),
      unit_number: formData.get("unit_number"),
      type: formData.get("type"),
      area: formData.get("area"),
      rooms: formData.get("rooms"),
      bathrooms: formData.get("bathrooms"),
      amenities,
      annual_rent: formData.get("annual_rent"),
      status: formData.get("status"),
    });

    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "بيانات غير صالحة";
      return openApiError(message, 422);
    }

    const data = parsed.data;

    const { data: property, error: propError } = await supabase
      .from("properties")
      .select("id, name")
      .eq("id", data.property_id)
      .eq("owner_id", ownerId)
      .maybeSingle();

    if (propError || !property) {
      return openApiError("العقار غير موجود", 404);
    }

    const imageUrls: string[] = [];
    for (const entry of formData.getAll("photos")) {
      const resolved = await resolveUploadedField(
        supabase,
        "unit-images",
        ownerId,
        `${ownerId}/${Date.now()}-${Math.random()}`,
        entry,
      );
      if ("error" in resolved) {
        return openApiError(`فشل رفع الصورة: ${resolved.error}`, 422);
      }
      if (resolved.url) imageUrls.push(resolved.url);
    }

    const monthlyRent = Math.round(data.annual_rent / 12);

    const { data: unit, error: insertError } = await supabase
      .from("units")
      .insert({
        owner_id: ownerId,
        property_id: data.property_id,
        unit_number: data.unit_number,
        floor: data.floor,
        rooms: data.rooms,
        bathrooms: data.bathrooms,
        area: data.area,
        unit_type: data.type,
        status: data.status,
        rent_amount: monthlyRent,
        rent_period: "monthly",
        annual_rent: data.annual_rent,
        amenities: data.amenities,
        images: imageUrls,
      })
      .select("*")
      .single();

    if (insertError) {
      console.error("[POST units insert]", insertError);
      return openApiError("فشل إنشاء الوحدة", 500);
    }

    return openApiSuccess(
      {
        id: unit.id,
        property_id: unit.property_id,
        property_name: property.name,
        unit_number: unit.unit_number,
        type: unit.unit_type,
        status: unit.status,
        floor: unit.floor ?? 0,
        area: unit.area ?? 0,
        rooms: unit.rooms ?? 0,
        bathrooms: unit.bathrooms ?? 0,
        annual_rent: unit.annual_rent ?? 0,
        image_urls: unit.images || [],
        current_contract: null,
        rent_amount: monthlyRent,
        rent_period: unit.rent_period,
        maintenance_note: null,
      },
      201,
    );
  } catch (err) {
    console.error("[POST units]", err);
    return openApiError("خطأ في الخادم", 500);
  }
}
