import "server-only";
import { requireOwner } from "@/lib/api/auth";
import { buildPropertiesReport } from "@/lib/api/reports";
import { apiSuccess } from "@/lib/api/response";

export async function GET(request: Request) {
  const auth = await requireOwner(request);
  if (!auth.ok) return auth.response;
  const { supabase, ownerId } = auth.ctx;

  const report = await buildPropertiesReport(supabase, ownerId);

  return apiSuccess(report);
}
