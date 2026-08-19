import { z } from "zod";

export const updateOwnerPasswordSchema = z
  .object({
    current_password: z.string().min(1, "كلمة المرور الحالية مطلوبة"),
    new_password: z
      .string()
      .min(8, "كلمة المرور الجديدة لازم تكون 8 أحرف على الأقل")
      .max(72, "كلمة المرور طويلة جداً"),
    confirm_password: z.string(),
  })
  .refine((v) => v.new_password === v.confirm_password, {
    message: "كلمة المرور الجديدة وتأكيدها مش متطابقين",
    path: ["confirm_password"],
  });

export type UpdateOwnerPasswordValues = z.infer<typeof updateOwnerPasswordSchema>;
