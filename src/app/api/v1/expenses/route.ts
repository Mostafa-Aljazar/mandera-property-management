import { NextRequest } from "next/server";
import { requireOwnerOpenApi } from "@/lib/api/auth";
import { openApiError, openApiSuccess } from "@/lib/api/openapi-response";
import { createExpenseSchema } from "@/validations/createExpense.schema";
import { arabicDateLabel } from "@/lib/api/date-labels";
import { EXPENSE_CATEGORY_LABELS, propertyUnitLabel } from "@/lib/api/labels";

/**
 * GET /expenses - Return Expense[]
 * POST /expenses - Record an expense (application/json)
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireOwnerOpenApi(request);
    if (!auth.ok) return auth.response;

    const { supabase, ownerId } = auth.ctx;

    const { data: expenses, error } = await supabase
      .from("expenses")
      .select(
        `id, amount, expense_type, description, expense_date,
         properties(name),
         units(unit_number)`,
      )
      .eq("owner_id", ownerId)
      .order("expense_date", { ascending: false });

    if (error) {
      console.error("[GET expenses]", error);
      return openApiError("فشل جلب المصروفات", 500);
    }

    const expensesList = (expenses || []).map((e: any) => ({
      id: e.id,
      title: e.description?.trim() || EXPENSE_CATEGORY_LABELS[e.expense_type as keyof typeof EXPENSE_CATEGORY_LABELS] || EXPENSE_CATEGORY_LABELS.other,
      location_label: e.units
        ? propertyUnitLabel(e.properties?.name || "", e.units.unit_number)
        : e.properties?.name || "",
      amount: e.amount,
      date_label: arabicDateLabel(e.expense_date),
      category: e.expense_type,
    }));

    return openApiSuccess(expensesList);
  } catch (err) {
    console.error("[GET expenses]", err);
    return openApiError("خطأ في الخادم", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireOwnerOpenApi(request);
    if (!auth.ok) return auth.response;

    const { supabase, ownerId } = auth.ctx;

    const body = await request.json();
    const parsed = createExpenseSchema.safeParse(body);

    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "بيانات المصروف غير صالحة";
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

    const description = data.vendor_name
      ? `${data.vendor_name}${data.description ? ` - ${data.description}` : ""}`
      : data.description || null;

    const { data: expense, error: insertError } = await supabase
      .from("expenses")
      .insert({
        owner_id: ownerId,
        amount: data.amount,
        expense_type: data.category,
        description,
        expense_date: data.date.split("T")[0],
        property_id: data.property_id,
        unit_id: data.unit_id,
      })
      .select("*")
      .single();

    if (insertError) {
      console.error("[POST expenses insert]", insertError);
      return openApiError("فشل تسجيل المصروف", 500);
    }

    return openApiSuccess(
      {
        id: expense.id,
        title: expense.description?.trim() || EXPENSE_CATEGORY_LABELS[expense.expense_type as keyof typeof EXPENSE_CATEGORY_LABELS],
        location_label: propertyUnitLabel(property.name, unit.unit_number),
        amount: expense.amount,
        date_label: arabicDateLabel(expense.expense_date),
        category: expense.expense_type,
      },
      201,
    );
  } catch (err) {
    console.error("[POST expenses]", err);
    return openApiError("خطأ في الخادم", 500);
  }
}
