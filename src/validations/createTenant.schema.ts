import { z } from "zod";

export const createTenantSchema = z.object({
  full_name: z.string().trim().min(1, "الاسم الكامل مطلوب").max(150, "الاسم طويل جداً"),
  national_id: z.string().trim().min(1, "رقم الهوية مطلوب").max(30, "رقم الهوية طويل جداً"),
  nationality_code: z.string().trim().length(2, "رمز الجنسية يجب أن يكون حرفين (ISO)"),
  nationality: z.string().trim().min(1, "الجنسية مطلوبة"),
  email: z.string().trim().email("البريد الإلكتروني غير صالح"),
  phone: z.string().trim().min(1, "رقم الهاتف مطلوب"),
  mobile: z.string().trim().min(1, "رقم الجوال مطلوب"),
});

export type CreateTenantValues = z.infer<typeof createTenantSchema>;
