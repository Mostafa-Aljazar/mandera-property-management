import { z } from "zod";

export const closeMaintenanceRequestSchema = z.object({
  technician_name: z.string().trim().max(120, "اسم الفني طويل جداً").optional().nullable(),
  cost: z.coerce.number().min(0, "التكلفة غير صالحة").optional().nullable(),
});

export type CloseMaintenanceRequestValues = z.infer<typeof closeMaintenanceRequestSchema>;
