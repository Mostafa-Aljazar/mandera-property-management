import { z } from "zod";

export const openApiForgotPasswordSchema = z.object({
  identifier: z
    .string()
    .min(1, "البريد الإلكتروني أو رقم الهاتف مطلوب")
    .min(3, "معرّف غير صالح"),
});

export type OpenApiForgotPasswordRequest = z.infer<
  typeof openApiForgotPasswordSchema
>;
