import { z } from "zod";

export const openApiLoginSchema = z.object({
  identifier: z
    .string()
    .min(1, "البريد الإلكتروني أو رقم الهاتف مطلوب")
    .min(3, "معرّف غير صالح"),
  password: z.string().min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل"),
});

export type OpenApiLoginRequest = z.infer<typeof openApiLoginSchema>;
