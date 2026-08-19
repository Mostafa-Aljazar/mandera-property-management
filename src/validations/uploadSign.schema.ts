import { z } from "zod";
import { UPLOAD_BUCKET_NAMES } from "@/lib/api/upload";

export const uploadSignSchema = z.object({
  bucket: z.enum(UPLOAD_BUCKET_NAMES as [string, ...string[]], {
    message: `bucket يجب أن يكون أحد: ${UPLOAD_BUCKET_NAMES.join(", ")}`,
  }),
  content_type: z.string().min(1, "content_type مطلوب"),
});

export type UploadSignValues = z.infer<typeof uploadSignSchema>;
