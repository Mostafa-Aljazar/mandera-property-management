import { z } from "zod";

export const createExpenseSchema = z.object({
  property_id: z.string().uuid("معرّف العقار غير صالح"),
  unit_id: z.string().uuid("معرّف الوحدة غير صالح"),
  category: z.enum(["maintenance", "electricity", "water", "cleaning", "services", "other"]),
  amount: z.coerce.number().positive("قيمة المصروف يجب أن تكون أكبر من صفر"),
  date: z.string().min(1, "تاريخ المصروف مطلوب"),
  vendor_name: z.string().trim().max(150).optional().nullable(),
  description: z.string().trim().max(500).optional().nullable(),
});

export type CreateExpenseValues = z.infer<typeof createExpenseSchema>;
