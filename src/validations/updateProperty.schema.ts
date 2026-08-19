import { z } from "zod";

export const updatePropertySchema = z.object({
  name: z.string().trim().min(2, "اسم العقار قصير جداً").max(120, "اسم العقار طويل جداً").optional(),
  type: z.enum(["residential", "commercial", "mixed_use"]).optional(),
  city: z.string().trim().max(80, "اسم المدينة طويل جداً").optional().nullable(),
  address: z.string().trim().max(200, "العنوان طويل جداً").optional().nullable(),
  latitude: z.coerce.number().min(-90).max(90).optional().nullable(),
  longitude: z.coerce.number().min(-180).max(180).optional().nullable(),
});

export type UpdatePropertyValues = z.infer<typeof updatePropertySchema>;
