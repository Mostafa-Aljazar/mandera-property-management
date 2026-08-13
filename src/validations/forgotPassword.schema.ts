import { z } from "zod";

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .email("البريد الإلكتروني غير صالح")
    .max(254),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "كلمة المرور الجديدة لازم تكون 8 أحرف على الأقل")
      .max(72, "كلمة المرور طويلة جداً"),
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "كلمة المرور الجديدة وتأكيدها مش متطابقين",
    path: ["confirm_password"],
  });
