import { z } from "zod";
import { isValidPhoneNumber } from "libphonenumber-js";

const MAX_IMAGE = 2 * 1024 * 1024;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

const imageFile = z
  .custom<File>((v) => typeof File !== "undefined" && v instanceof File, {
    message: "الملف غير صالح",
  })
  .refine((f) => f.size <= MAX_IMAGE, "حجم الصورة أكبر من 2 ميجا")
  .refine(
    (f) => (IMAGE_TYPES as readonly string[]).includes(f.type),
    "الصورة لازم تكون JPG أو PNG أو WEBP",
  );

export const createOwnerSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(2, "الاسم يجب ألا يقل عن حرفين")
    .max(120, "الاسم طويل جداً"),
  email: z
    .string()
    .trim()
    .email("البريد الإلكتروني غير صالح")
    .max(254),
  phone: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || isValidPhoneNumber(v), "رقم الهاتف غير صالح"),
  national_id: z
    .string()
    .trim()
    .min(5, "رقم الهوية مطلوب")
    .max(40, "رقم الهوية طويل جداً"),
  valid_until: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "تاريخ الصلاحية غير صالح"),
  company_name: z
    .string()
    .trim()
    .max(120, "اسم الشركة طويل جداً")
    .optional()
    .or(z.literal("")),
  city: z
    .string()
    .trim()
    .max(80, "اسم المدينة طويل جداً")
    .optional()
    .or(z.literal("")),
  notes: z
    .string()
    .trim()
    .max(1000, "الملاحظات طويلة جداً")
    .optional()
    .or(z.literal("")),
  avatar: imageFile.optional(),
  id_document: imageFile.optional(),
});

export type CreateOwnerValues = z.infer<typeof createOwnerSchema>;
