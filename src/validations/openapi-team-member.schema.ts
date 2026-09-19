import { z } from "zod";

export const userRankSchema = z.enum(["manager", "administrator", "assistant"]);

export const createTeamMemberSchema = z.object({
    full_name: z.string().min(1, "الاسم مطلوب"),
    email: z.string().email("البريد الإلكتروني غير صالح"),
    phone: z.string().min(1, "رقم الهاتف مطلوب"),
    password: z.string().min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل"),
    rank: userRankSchema,
});

export type CreateTeamMemberRequest = z.infer<typeof createTeamMemberSchema>;