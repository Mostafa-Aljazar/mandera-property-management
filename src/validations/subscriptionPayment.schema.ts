import { z } from "zod";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export const subscriptionPaymentSchema = z
  .object({
    ownerId: z.string().uuid("معرّف المالك غير صالح"),
    amount: z.coerce
      .number({ message: "المبلغ يجب أن يكون رقماً" })
      .positive("المبلغ يجب أن يكون أكبر من صفر"),
    period_start: z.string().regex(DATE_RE, "تاريخ (من) غير صالح"),
    period_end: z.string().regex(DATE_RE, "تاريخ (الى) غير صالح"),
  })
  .refine((v) => v.period_end >= v.period_start, {
    message: "تاريخ (الى) يجب أن يكون بعد أو يساوي تاريخ (من)",
    path: ["period_end"],
  });
