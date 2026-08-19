import { z } from "zod";

export const createContractSchema = z.object({
  tenant_id: z.string().uuid("معرّف المستأجر غير صالح"),
  property_id: z.string().uuid("معرّف العقار غير صالح"),
  unit_id: z.string().uuid("معرّف الوحدة غير صالح"),
  start_date: z.string().min(1, "تاريخ البداية مطلوب"),
  end_date: z.string().min(1, "تاريخ النهاية مطلوب"),
  total_rent_value: z.coerce.number().positive("قيمة الإيجار الإجمالية يجب أن تكون أكبر من صفر"),
  deposit_amount: z.coerce.number().min(0, "قيمة التأمين غير صالحة"),
  notes: z.string().trim().max(500).optional().nullable(),
});

export const contractPaymentSchema = z.object({
  amount: z.coerce.number().positive("قيمة الدفعة يجب أن تكون أكبر من صفر"),
  date: z.string().min(1, "تاريخ الدفعة مطلوب"),
});

export type CreateContractValues = z.infer<typeof createContractSchema>;
