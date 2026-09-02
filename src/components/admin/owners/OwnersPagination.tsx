import { Card } from "@/components/ui/card";
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
    <Card className="flex-row flex-wrap items-center justify-between gap-3 px-3 py-3.5 sm:px-5 sm:py-4">
      <p className="text-xs text-muted-foreground sm:text-sm">
        عرض <span className="font-semibold text-foreground">{from}–{to}</span>{" "}
        من <span className="font-semibold text-foreground">{totalCount}</span>
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
                        "border-transparent bg-primary text-primary-foreground hover:bg-primary/90",
                    )}
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
    </Card>
  );
}
