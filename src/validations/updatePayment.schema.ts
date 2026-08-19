import { z } from "zod";

export const updatePaymentSchema = z.object({
  amount: z.coerce.number().positive("قيمة الدفعة يجب أن تكون أكبر من صفر").optional(),
  due_date: z.iso.date("تاريخ الاستحقاق غير صالح").optional(),
  payment_method: z.enum(["cash", "bank_transfer", "card"]).optional().nullable(),
  paid_date: z.iso.date("تاريخ الدفع غير صالح").optional().nullable(),
  status: z.enum(["due", "paid", "overdue"]).optional(),
  notes: z.string().trim().max(500, "الملاحظات طويلة جداً").optional().nullable(),
});

export type UpdatePaymentValues = z.infer<typeof updatePaymentSchema>;
