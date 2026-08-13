import { z } from "zod";

export const updateUnitStatusSchema = z.object({
  status: z.enum(["vacant", "occupied", "maintenance"]),
});

export type UpdateUnitStatusValues = z.infer<typeof updateUnitStatusSchema>;
