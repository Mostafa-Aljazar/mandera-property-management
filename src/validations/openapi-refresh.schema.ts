import { z } from "zod";

export const openApiRefreshSchema = z.object({
  refresh_token: z.string().min(1, "refresh_token مطلوب"),
});

export type OpenApiRefreshRequest = z.infer<typeof openApiRefreshSchema>;
