import { z } from "zod";
import { isValidPhoneNumber } from "libphonenumber-js";

export const updateTenantSchema = z.object({
  full_name: z.string().trim().min(2, "الاسم يجب ألا يقل عن حرفين").max(120, "الاسم طويل جداً").optional(),
  national_id: z.string().trim().max(40, "رقم الهوية طويل جداً").optional().nullable(),
  phone: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || isValidPhoneNumber(v), "رقم الهاتف غير صالح"),
  email: z.string().trim().email("البريد الإلكتروني غير صالح").max(254).optional().or(z.literal("")),
});

export type UpdateTenantValues = z.infer<typeof updateTenantSchema>;
