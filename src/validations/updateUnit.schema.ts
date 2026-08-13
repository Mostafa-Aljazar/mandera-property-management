import { z } from "zod";

export const updateUnitSchema = z.object({
  unit_number: z.string().trim().min(1, "رقم الوحدة مطلوب").max(20, "رقم الوحدة طويل جداً").optional(),
  floor: z.string().trim().max(20, "الطابق طويل جداً").optional().nullable(),
  unit_type: z.enum(["apartment", "shop", "office", "other"]).optional(),
  area: z.coerce.number().positive("المساحة يجب أن تكون أكبر من صفر").optional().nullable(),
  bedrooms: z.coerce.number().int().min(0).optional().nullable(),
  bathrooms: z.coerce.number().int().min(0).optional().nullable(),
  rent_amount: z.coerce.number().min(0, "قيمة الإيجار غير صالحة").optional(),
});

export type UpdateUnitValues = z.infer<typeof updateUnitSchema>;
