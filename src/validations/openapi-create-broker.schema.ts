import { z } from "zod";

export const createBrokerSchema = z.object({
  full_name: z.string().trim().min(1, "الاسم الكامل مطلوب").max(150, "الاسم طويل جداً"),
  // company_name is always sent (even empty string) per CreateBrokerRequest —
  // empty string means "no company" (independent broker), not a validation error.
  company_name: z
    .string()
    .trim()
    .max(150, "اسم الشركة طويل جداً")
    .optional()
    .transform((val) => (val && val.length > 0 ? val : null)),
  commercial_license_number: z
    .string()
    .trim()
    .min(1, "رقم الرخصة التجارية مطلوب")
    .max(30, "رقم الرخصة التجارية طويل جداً"),
  nationality_code: z.string().trim().length(2, "رمز الجنسية يجب أن يكون حرفين (ISO)"),
  nationality: z.string().trim().min(1, "الجنسية مطلوبة"),
  email: z.string().trim().email("البريد الإلكتروني غير صالح"),
  phone: z.string().trim().min(1, "رقم الهاتف مطلوب"),
  mobile: z.string().trim().min(1, "رقم الجوال مطلوب"),
});

export type CreateBrokerValues = z.infer<typeof createBrokerSchema>;
