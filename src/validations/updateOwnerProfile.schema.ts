import { z } from "zod";
import { isValidPhoneNumber } from "libphonenumber-js";

export const updateOwnerProfileSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(2, "الاسم يجب ألا يقل عن حرفين")
    .max(120, "الاسم طويل جداً")
    .optional(),
  phone: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || isValidPhoneNumber(v), "رقم الهاتف غير صالح"),
  company_name: z.string().trim().max(120, "اسم الشركة طويل جداً").optional().nullable(),
  city: z.string().trim().max(80, "اسم المدينة طويل جداً").optional().nullable(),
});

export type UpdateOwnerProfileValues = z.infer<typeof updateOwnerProfileSchema>;
