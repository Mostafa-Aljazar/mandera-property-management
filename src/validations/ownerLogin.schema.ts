import { z } from "zod";

export const ownerLoginSchema = z.object({
  email: z.string().trim().email("البريد الإلكتروني غير صالح"),
  password: z.string().min(1, "كلمة المرور مطلوبة"),
});

export type OwnerLoginValues = z.infer<typeof ownerLoginSchema>;
