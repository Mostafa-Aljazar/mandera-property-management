import { z } from "zod";

export const renewContractSchema = z
  .object({
    start_date: z.iso.date("تاريخ البداية غير صالح"),
    end_date: z.iso.date("تاريخ النهاية غير صالح"),
    rent_amount: z.coerce.number().positive("قيمة الإيجار يجب أن تكون أكبر من صفر").optional(),
    payment_cycle: z.enum(["monthly", "quarterly", "yearly"]).optional(),
    deposit_amount: z.coerce.number().min(0, "قيمة التأمين غير صالحة").optional().nullable(),
  })
  .refine((v) => v.end_date > v.start_date, {
    message: "تاريخ النهاية يجب أن يكون بعد تاريخ البداية",
    path: ["end_date"],
  });

export type RenewContractValues = z.infer<typeof renewContractSchema>;
