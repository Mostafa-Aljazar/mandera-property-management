import "server-only";
import { requireOwner } from "@/lib/api/auth";
import { buildFinancialSummaryReport, parseDateRange } from "@/lib/api/reports";
import { apiError, apiSuccess } from "@/lib/api/response";

export async function GET(request: Request) {
  const auth = await requireOwner(request);
  if (!auth.ok) return auth.response;
  const { supabase, ownerId } = auth.ctx;

  const parsed = parseDateRange(new URL(request.url));
  if (!parsed.ok) return apiError("validation_error", parsed.error, 422);

  const summary = await buildFinancialSummaryReport(supabase, ownerId, parsed.range);

  return apiSuccess(summary);
}
