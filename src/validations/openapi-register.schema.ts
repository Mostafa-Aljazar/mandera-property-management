import { z } from "zod";

export const openApiRegisterSchema = z.object({
  username: z.string().min(1, "اسم المستخدم مطلوب").min(3, "اسم المستخدم قصير جداً"),
  email: z.string().email("بريد إلكتروني غير صالح"),
  phone: z.string().min(1, "رقم الهاتف مطلوب"),
  password: z.string().min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل"),
});

export type OpenApiRegisterRequest = z.infer<typeof openApiRegisterSchema>;
