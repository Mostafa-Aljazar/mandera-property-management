import { z } from "zod";

export const updateMaintenanceRequestSchema = z.object({
  issue_type: z.enum(["plumbing", "electrical", "ac", "other"]).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  description: z.string().trim().min(2, "الوصف مطلوب").max(1000, "الوصف طويل جداً").optional(),
  status: z.enum(["new_request", "in_progress", "completed"]).optional(),
  technician_name: z.string().trim().max(120, "اسم الفني طويل جداً").optional().nullable(),
  cost: z.coerce.number().min(0, "التكلفة غير صالحة").optional().nullable(),
});

export type UpdateMaintenanceRequestValues = z.infer<typeof updateMaintenanceRequestSchema>;
