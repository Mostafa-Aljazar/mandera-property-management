import { z } from "zod";

export const updateOwnerSettingsSchema = z.object({
  language: z.enum(["ar", "en"]).optional(),
  notification_preferences: z
    .object({
      overdue_payment: z.boolean().optional(),
      contract_expiring: z.boolean().optional(),
      payment_recorded: z.boolean().optional(),
      maintenance_update: z.boolean().optional(),
    })
    .optional(),
});

export type UpdateOwnerSettingsValues = z.infer<typeof updateOwnerSettingsSchema>;
