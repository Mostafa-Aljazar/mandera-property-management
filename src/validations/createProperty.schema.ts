import { z } from "zod";

export const createPropertySchema = z.object({
  name: z.string().trim().min(2, "اسم العقار قصير جداً").max(120, "اسم العقار طويل جداً"),
  type: z.enum(["building", "villa", "complex", "other"]).default("building"),
  city: z.string().trim().max(80, "اسم المدينة طويل جداً").optional().nullable(),
  address: z.string().trim().max(200, "العنوان طويل جداً").optional().nullable(),
  latitude: z.coerce.number().min(-90).max(90).optional().nullable(),
  longitude: z.coerce.number().min(-180).max(180).optional().nullable(),
});

export type CreatePropertyValues = z.infer<typeof createPropertySchema>;
