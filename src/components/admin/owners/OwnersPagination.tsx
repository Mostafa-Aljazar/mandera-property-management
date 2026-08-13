import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { buildOwnersHref } from "@/validations/ownersFilter.schema";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";

function pageNumbers(current: number, total: number) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages = new Set<number>([1, total, current]);
  for (let i = current - 1; i <= current + 1; i++) {
    if (i >= 1 && i <= total) pages.add(i);
  }

  return Array.from(pages).sort((a, b) => a - b);
}

export function OwnersPagination({
  page,
  totalPages,
  totalCount,
  pageSize,
  q,
  status,
}: {
  page: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  q: string;
  status: string;
}) {
  if (totalPages <= 1) return null;

  const pages = pageNumbers(page, totalPages);
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalCount);

  function hrefFor(p: number) {
    return buildOwnersHref({ q, status, page: p });
  }

  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-[#16445B]/8 bg-white px-3 py-3.5 shadow-[0_10px_36px_rgba(15,42,55,0.04)] sm:flex-row sm:justify-between sm:gap-4 sm:px-5 sm:py-4">
      <p className="text-xs text-[#5b6b73] sm:text-sm">
        عرض{" "}
        <span className="font-semibold" style={{ color: BRAND.navy }}>
          {from}–{to}
        </span>{" "}
        من{" "}
        <span className="font-semibold" style={{ color: BRAND.navy }}>
          {totalCount}
        </span>
      </p>

      <Pagination className="mx-0 w-full justify-center sm:w-auto sm:justify-end">
        <PaginationContent className="flex-wrap justify-center gap-0.5">
          <PaginationItem>
            <PaginationPrevious
              href={page > 1 ? hrefFor(page - 1) : "#"}
              text="السابق"
              aria-disabled={page <= 1}
              className={cn(page <= 1 && "pointer-events-none opacity-40")}
            />
          </PaginationItem>

          {pages.map((p, index) => {
            const prev = pages[index - 1];
            const showEllipsis = prev !== undefined && p - prev > 1;

            return (
              <span key={p} className="contents">
                {showEllipsis ? (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : null}
                <PaginationItem>
                  <PaginationLink
                    href={hrefFor(p)}
                    isActive={p === page}
                    className={cn(
                      p === page &&
                        "border-transparent hover:opacity-90",
                    )}
                    style={
                      p === page
                        ? { backgroundColor: BRAND.navy, color: "white" }
                        : undefined
                    }
                  >
                    {p}
                  </PaginationLink>
                </PaginationItem>
              </span>
            );
          })}

          <PaginationItem>
            <PaginationNext
              href={page < totalPages ? hrefFor(page + 1) : "#"}
              text="التالي"
              aria-disabled={page >= totalPages}
              className={cn(
                page >= totalPages && "pointer-events-none opacity-40",
              )}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
