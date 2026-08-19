import { z } from "zod";

export const updateUnitStatusSchema = z.object({
  status: z.enum(["available", "rented", "maintenance"]),
});

export type UpdateUnitStatusValues = z.infer<typeof updateUnitStatusSchema>;
