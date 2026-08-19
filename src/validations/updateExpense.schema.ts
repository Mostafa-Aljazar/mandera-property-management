import { z } from "zod";

export const updateExpenseSchema = z.object({
  unit_id: z.string().uuid("معرّف الوحدة غير صالح").optional().nullable(),
  expense_type: z.enum(["maintenance", "water", "electricity", "other"]).optional(),
  amount: z.coerce.number().positive("قيمة المصروف يجب أن تكون أكبر من صفر").optional(),
  expense_date: z.iso.date("تاريخ المصروف غير صالح").optional(),
  description: z.string().trim().max(500, "الوصف طويل جداً").optional().nullable(),
});

export type UpdateExpenseValues = z.infer<typeof updateExpenseSchema>;
