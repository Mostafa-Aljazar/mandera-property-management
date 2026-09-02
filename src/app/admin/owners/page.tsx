import Link from "next/link";
import { Plus, Users } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { Button } from "@/components/ui/button";
import { OwnersList } from "@/components/admin/owners/OwnersList";
import { OwnersPagination } from "@/components/admin/owners/OwnersPagination";
import { OwnersToolbar } from "@/components/admin/owners/OwnersToolbar";
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
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3 sm:items-center">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight">الملاك</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {totalCount === 0
              ? "لا توجد نتائج مطابقة حالياً"
              : `${totalCount} حساب${totalCount === 1 ? "" : "ات"}`}
          </p>
        </div>

        <Button nativeButton={false} render={<Link href="/admin/owners/new" />}>
          <Plus />
          <span className="sm:hidden">إضافة</span>
          <span className="hidden sm:inline">إضافة مالك</span>
        </Button>
      </div>

      <OwnersToolbar q={q} status={status} />

      {pageOwners.length === 0 ? (
        <div className="rounded-xl border border-dashed px-6 py-16 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Users className="size-6" />
          </div>
          <h2 className="mt-5 text-lg font-semibold">لا يوجد ملاك هنا</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-7 text-muted-foreground">
            جرّب تغيير البحث أو الفلتر، أو أضف مالكاً جديداً للمنصة.
          </p>
          <Button
            nativeButton={false}
            render={<Link href="/admin/owners/new" />}
            className="mt-6"
          >
            <Plus />
            إضافة مالك
          </Button>
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
    </div>
  );
}
