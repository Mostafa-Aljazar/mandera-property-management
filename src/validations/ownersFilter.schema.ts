import { z } from "zod";

export const OWNERS_PAGE_SIZE = 8;

export const ownersFilterSchema = z.object({
  q: z.string().trim().max(100, "البحث يجب ألا يتجاوز 100 حرف"),
  status: z.enum(["all", "active", "inactive", "pending"]),
  page: z.coerce.number().int().min(1).optional(),
});

export type OwnersFilterValues = z.infer<typeof ownersFilterSchema>;

export function buildOwnersHref(values: {
  q?: string;
  status?: string;
  page?: number;
}) {
  const params = new URLSearchParams();
  const q = (values.q ?? "").trim();
  if (q) params.set("q", q);
  if (values.status && values.status !== "all") {
    params.set("status", values.status);
  }
  if (values.page && values.page > 1) {
    params.set("page", String(values.page));
  }
  const qs = params.toString();
  return qs ? `/admin/owners?${qs}` : "/admin/owners";
}

export function parseOwnersPage(raw: string | undefined) {
  const n = Number(raw ?? "1");
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.floor(n);
}
