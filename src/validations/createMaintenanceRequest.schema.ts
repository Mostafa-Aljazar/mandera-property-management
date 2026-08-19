import { z } from "zod";

export const createMaintenanceRequestSchema = z.object({
  property_id: z.string().uuid("معرّف العقار غير صالح"),
  unit_id: z.string().uuid("معرّف الوحدة غير صالح"),
  category: z.enum([
    "plumbing",
    "electrical",
    "ac",
    "appliances",
    "doors_locks",
    "paint",
    "water_leak",
    "other",
  ]),
  priority: z.enum(["high", "medium", "low"]),
  description: z.string().trim().min(2, "الوصف مطلوب").max(1000, "الوصف طويل جداً"),
  notes: z.string().trim().max(500).optional().nullable(),
});

export type CreateMaintenanceRequestValues = z.infer<typeof createMaintenanceRequestSchema>;
