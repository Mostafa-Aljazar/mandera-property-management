import { z } from "zod";

export const createUnitSchema = z.object({
  property_id: z.string().uuid("معرّف العقار غير صالح"),
  floor: z.coerce.number().int("الطابق غير صالح"),
  unit_number: z.string().trim().min(1, "رقم الوحدة مطلوب").max(20, "رقم الوحدة طويل جداً"),
  type: z.enum(["apartment", "studio", "villa", "office", "shop", "warehouse"]),
  area: z.coerce.number().int().positive("المساحة يجب أن تكون أكبر من صفر"),
  rooms: z.coerce.number().int().min(0),
  bathrooms: z.coerce.number().int().min(0),
  amenities: z.array(z.string()),
  annual_rent: z.coerce.number().int().positive("قيمة الإيجار السنوي غير صالحة"),
  status: z.enum(["available", "rented", "maintenance"]),
});

export type CreateUnitValues = z.infer<typeof createUnitSchema>;
