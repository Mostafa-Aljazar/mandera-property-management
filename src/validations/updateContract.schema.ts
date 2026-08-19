import { z } from "zod";

export const updateContractSchema = z.object({
  end_date: z.iso.date("تاريخ النهاية غير صالح").optional(),
  rent_amount: z.coerce.number().positive("قيمة الإيجار يجب أن تكون أكبر من صفر").optional(),
  payment_cycle: z.enum(["monthly", "quarterly", "yearly"]).optional(),
  deposit_amount: z.coerce.number().min(0, "قيمة التأمين غير صالحة").optional().nullable(),
});

export type UpdateContractValues = z.infer<typeof updateContractSchema>;
