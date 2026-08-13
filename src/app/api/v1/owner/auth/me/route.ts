import "server-only";
import { requireOwner } from "@/lib/api/auth";
import { apiSuccess } from "@/lib/api/response";

export async function GET(request: Request) {
  const auth = await requireOwner(request);
  if (!auth.ok) return auth.response;

  return apiSuccess(auth.ctx.profile);
}
