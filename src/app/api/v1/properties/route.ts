import { NextRequest } from "next/server";
import { requireOwnerOpenApi } from "@/lib/api/auth";
import { openApiError, openApiSuccess } from "@/lib/api/openapi-response";
import { openApiCreatePropertySchema } from "@/validations/openapi-create-property.schema";
import { resolveUploadedField } from "@/lib/api/upload";

/**
 * GET /properties - Return PropertiesSummary
 * POST /properties - Create new property with photo
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireOwnerOpenApi(request);
    if (!auth.ok) return auth.response;

    const { supabase, ownerId } = auth.ctx;

    // Fetch all properties for this owner
    const { data: properties, error } = await supabase
      .from("properties")
      .select(
        `id, name, type, city, district, address, image_url,
         units(id, status, rent_amount)`,
      )
      .eq("owner_id", ownerId)
      .is("deleted_at", null);

    if (error) {
      console.error("[GET properties]", error);
      return openApiError("فشل جلب العقارات", 500);
    }

    // Compute aggregates
    let totalUnits = 0;
    let rentedUnits = 0;
    let monthlyIncome = 0;

    const propertiesList = (properties || []).map((prop: any) => {
      const units = prop.units || [];
      const propTotalUnits = units.length;
      const propRentedUnits = units.filter(
        (u: any) => u.status === "rented",
      ).length;
      const propMonthlyIncome = units.reduce(
        (sum: number, u: any) => sum + (u.rent_amount || 0),
        0,
      );

      totalUnits += propTotalUnits;
      rentedUnits += propRentedUnits;
      monthlyIncome += propMonthlyIncome;

      return {
        id: prop.id,
        name: prop.name,
        city: prop.city || "",
        district: prop.district || "",
        image_url: prop.image_url || "",
        total_units: propTotalUnits,
        rented_units: propRentedUnits,
        monthly_income: propMonthlyIncome,
        monthly_expenses: 0, // TODO: compute from expenses table
        revenue_growth_percent: 0, // TODO: compute from historical data
        expenses_change_percent: 0, // TODO: compute from historical data
        needs_maintenance: false, // TODO: check maintenance_requests
      };
    });

    const occupancyRate =
      totalUnits > 0 ? rentedUnits / totalUnits : 0;

    return openApiSuccess({
      occupancy_rate: occupancyRate,
      total_properties_count: propertiesList.length,
      properties: propertiesList,
    });
  } catch (err) {
    console.error("[GET properties]", err);
    return openApiError("خطأ في الخادم", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireOwnerOpenApi(request);
    if (!auth.ok) return auth.response;

    const { supabase, ownerId } = auth.ctx;

    const formData = await request.formData();
    const parsed = openApiCreatePropertySchema.safeParse({
      name: formData.get("name"),
      type: formData.get("type"),
      country_code: formData.get("country_code"),
      country: formData.get("country"),
      city: formData.get("city"),
      region: formData.get("region"),
      district: formData.get("district"),
      address: formData.get("address"),
      latitude: formData.get("latitude")
        ? parseFloat(String(formData.get("latitude")))
        : undefined,
      longitude: formData.get("longitude")
        ? parseFloat(String(formData.get("longitude")))
        : undefined,
      units_count: parseInt(String(formData.get("units_count")) || "0"),
      description: formData.get("description"),
    });

    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "بيانات غير صالحة";
      return openApiError(message, 422);
    }

    const data = parsed.data;

    const uploaded = await resolveUploadedField(
      supabase,
      "property-images",
      ownerId,
      `${ownerId}/${Date.now()}`,
      formData.get("photo"),
    );
    if ("error" in uploaded) {
      return openApiError(`فشل رفع الصورة: ${uploaded.error}`, 422);
    }
    const imageUrl = uploaded.url || "";

    // Insert property
    const { data: newProperty, error: insertError } = await supabase
      .from("properties")
      .insert({
        owner_id: ownerId,
        name: data.name,
        type: data.type,
        city: data.city,
        district: data.district || null,
        address: data.address || null,
        latitude: data.latitude || null,
        longitude: data.longitude || null,
        image_url: imageUrl,
      })
      .select()
      .single();

    if (insertError || !newProperty) {
      return openApiError("فشل إنشاء العقار", 400);
    }

    return openApiSuccess(
      {
        id: newProperty.id,
        name: newProperty.name,
        city: newProperty.city || "",
        district: newProperty.district || "",
        image_url: newProperty.image_url || "",
        total_units: 0,
        rented_units: 0,
        monthly_income: 0,
        monthly_expenses: 0,
        revenue_growth_percent: 0,
        expenses_change_percent: 0,
        needs_maintenance: false,
      },
      201,
    );
  } catch (err) {
    console.error("[POST properties]", err);
    return openApiError("خطأ في الخادم", 500);
  }
}
