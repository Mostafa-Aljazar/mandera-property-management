import Link from "next/link";
import { Plus, Users } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { Reveal } from "@/components/common/Reveal";
import { OwnersList } from "@/components/admin/owners/OwnersList";
import { OwnersPagination } from "@/components/admin/owners/OwnersPagination";
import { OwnersToolbar } from "@/components/admin/owners/OwnersToolbar";
import { BRAND } from "@/lib/brand";
import {
  OWNERS_PAGE_SIZE,
  ownersFilterSchema,
  parseOwnersPage,
} from "@/validations/ownersFilter.schema";

type SearchParams = Promise<{ q?: string; status?: string; page?: string }>;

function applyOwnersFilters<
  T extends {
    eq: (column: string, value: string) => T;
    is: (column: string, value: null) => T;
    or: (filters: string) => T;
  },
>(query: T, q: string, status: string) {
  let next = query.eq("role", "owner").is("deleted_at", null);

  if (q) {
    const escaped = q.replace(/[%,]/g, "");
    next = next.or(
      `full_name.ilike.%${escaped}%,email.ilike.%${escaped}%,phone.ilike.%${escaped}%,national_id.ilike.%${escaped}%`,
    );
  }

  if (status === "active" || status === "inactive" || status === "pending") {
    next = next.eq("account_status", status);
  }

  return next;
}

async function getOwners(q: string, status: string, page: number) {
  const admin = createAdminClient();
  const from = (page - 1) * OWNERS_PAGE_SIZE;
  const to = from + OWNERS_PAGE_SIZE - 1;

  const countPromise = applyOwnersFilters(
    admin.from("users").select("id", { count: "exact", head: true }),
    q,
    status,
  );

  const dataPromise = applyOwnersFilters(
    admin
      .from("users")
      .select(
        "id, full_name, email, phone, is_active, account_status, national_id, valid_until, created_at, avatar_url",
      ),
    q,
    status,
  )
    .order("created_at", { ascending: false })
    .range(from, to);

  const [countResult, dataResult] = await Promise.all([
    countPromise,
    dataPromise,
  ]);

  if (countResult.error) throw countResult.error;
  if (dataResult.error) throw dataResult.error;

  return {
    owners: dataResult.data ?? [],
    totalCount: countResult.count ?? 0,
  };
}

export default async function OwnersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { q = "", status: statusParam = "all", page: pageParam } =
    await searchParams;
  const statusParsed = ownersFilterSchema.shape.status.safeParse(statusParam);
  const status = statusParsed.success ? statusParsed.data : "all";
  const requestedPage = parseOwnersPage(pageParam);

  let page = requestedPage;
  let { owners: pageOwners, totalCount } = await getOwners(q, status, page);
  const totalPages = Math.max(1, Math.ceil(totalCount / OWNERS_PAGE_SIZE));

  if (page > totalPages) {
    page = totalPages;
    ({ owners: pageOwners, totalCount } = await getOwners(q, status, page));
  }

  return (
    <div className="relative space-y-5 sm:space-y-7">
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-x-4 -top-6 h-48 bg-[radial-gradient(ellipse_at_top,rgba(22,68,91,0.06),transparent_60%)] sm:-inset-x-6 sm:-top-8 sm:h-56"
      />

      <Reveal>
        <div className="relative flex items-start justify-between gap-3 sm:items-end sm:gap-5">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#16445B]/10 bg-white px-2.5 py-1 text-[11px] font-semibold text-[#16445B]/70 shadow-sm sm:px-3 sm:text-xs">
              <Users className="size-3.5" style={{ color: BRAND.red }} />
              إدارة الحسابات
            </div>
            <h1
              className="mt-2.5 text-xl font-bold tracking-tight sm:mt-3 sm:text-3xl"
              style={{ color: BRAND.navy }}
            >
              الملاك
            </h1>
            <p className="mt-1.5 text-sm leading-6 text-[#5b6b73] sm:mt-2 sm:leading-7">
              {totalCount === 0
                ? "لا توجد نتائج مطابقة حالياً"
                : `${totalCount} حساب${totalCount === 1 ? "" : "ات"}`}
            </p>
          </div>

          <Link
            href="/admin/owners/new"
            className="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-full px-3.5 text-sm font-semibold text-white shadow-[0_10px_28px_rgba(237,27,36,0.28)] transition-all duration-300 hover:opacity-95 sm:h-11 sm:gap-2 sm:px-5"
            style={{ backgroundColor: BRAND.red }}
          >
            <Plus className="size-4" />
            <span className="sm:hidden">إضافة</span>
            <span className="hidden sm:inline">إضافة مالك</span>
          </Link>
        </div>
      </Reveal>

      <Reveal delay={80}>
        <OwnersToolbar q={q} status={status} />
      </Reveal>

      <Reveal delay={140}>
        {pageOwners.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#16445B]/15 bg-white px-6 py-16 text-center shadow-[0_10px_36px_rgba(15,42,55,0.03)]">
            <div
              className="mx-auto flex size-14 items-center justify-center rounded-full"
              style={{ backgroundColor: `${BRAND.navy}12`, color: BRAND.navy }}
            >
              <Users className="size-6" />
            </div>
            <h2
              className="mt-5 text-lg font-bold"
              style={{ color: BRAND.navy }}
            >
              لا يوجد ملاك هنا
            </h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-7 text-[#5b6b73]">
              جرّب تغيير البحث أو الفلتر، أو أضف مالكاً جديداً للمنصة.
            </p>
            <Link
              href="/admin/owners/new"
              className="mt-6 inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm font-semibold text-white"
              style={{ backgroundColor: BRAND.red }}
            >
              <Plus className="size-4" />
              إضافة مالك
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <OwnersList owners={pageOwners} />
            <OwnersPagination
              page={page}
              totalPages={totalPages}
              totalCount={totalCount}
              pageSize={OWNERS_PAGE_SIZE}
              q={q}
              status={status}
            />
          </div>
        )}
      </Reveal>
    </div>
  );
}
