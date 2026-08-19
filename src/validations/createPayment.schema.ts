import { z } from "zod";

export const createPaymentSchema = z.object({
  tenant_id: z.string().uuid("معرّف المستأجر غير صالح"),
  property_id: z.string().uuid("معرّف العقار غير صالح"),
  unit_label: z.string().trim().min(1, "تسمية الوحدة مطلوبة"),
  amount: z.coerce.number().positive("قيمة الدفعة يجب أن تكون أكبر من صفر"),
  payment_date: z.string().min(1, "تاريخ الدفع مطلوب"),
  method: z.enum(["bank_transfer", "cash", "mada", "sadad", "card", "other"]),
  reference_number: z.string().trim().max(100).optional().nullable(),
  notes: z.string().trim().max(500).optional().nullable(),
});

export type CreatePaymentValues = z.infer<typeof createPaymentSchema>;
