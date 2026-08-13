import { z } from "zod";

export const createUnitSchema = z.object({
  property_id: z.string().uuid("معرّف العقار غير صالح"),
  unit_number: z.string().trim().min(1, "رقم الوحدة مطلوب").max(20, "رقم الوحدة طويل جداً"),
  floor: z.string().trim().max(20, "الطابق طويل جداً").optional().nullable(),
  unit_type: z.enum(["apartment", "shop", "office", "other"]).default("apartment"),
  area: z.coerce.number().positive("المساحة يجب أن تكون أكبر من صفر").optional().nullable(),
  bedrooms: z.coerce.number().int().min(0).optional().nullable(),
  bathrooms: z.coerce.number().int().min(0).optional().nullable(),
  rent_amount: z.coerce.number().min(0, "قيمة الإيجار غير صالحة").default(0),
});

export type CreateUnitValues = z.infer<typeof createUnitSchema>;
