import { z } from "zod";

export const openApiCreatePropertySchema = z.object({
  name: z.string().min(1, "اسم العقار مطلوب"),
  type: z.enum(["residential", "commercial", "mixed_use"]).default("residential"),
  country_code: z.string().length(2, "رمز الدولة غير صالح"),
  country: z.string().min(1, "اسم الدولة مطلوب"),
  city: z.string().min(1, "اسم المدينة مطلوب"),
  region: z.string().optional().nullable(),
  district: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  units_count: z.number().int().min(1, "عدد الوحدات يجب أن يكون 1 على الأقل"),
  description: z.string().optional().nullable(),
  // photo is handled separately as FormData File
});

export type OpenApiCreatePropertyRequest = z.infer<
  typeof openApiCreatePropertySchema
>;
