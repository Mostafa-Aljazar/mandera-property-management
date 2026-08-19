import { z } from "zod";

export const registerDeviceTokenSchema = z.object({
  fcm_token: z.string().trim().min(1, "رمز الجهاز مطلوب").max(512, "رمز الجهاز طويل جداً"),
  device_type: z.enum(["android", "ios"]).optional().nullable(),
});

export type RegisterDeviceTokenValues = z.infer<typeof registerDeviceTokenSchema>;
