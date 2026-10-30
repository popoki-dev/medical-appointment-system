import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface PaginationProps {
  page: number
  pageCount: number
  onPageChange: (page: number) => void
  total?: number
  pageSize?: number
  className?: string
}

/** Returns page numbers with `null` marking an ellipsis gap, e.g. [1, null, 4, 5, 6, null, 10]. */
function getPageItems(page: number, pageCount: number): (number | null)[] {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1)
  const pages = new Set([1, pageCount, page - 1, page, page + 1])
  const sorted = [...pages].filter((p) => p >= 1 && p <= pageCount).sort((a, b) => a - b)
  return sorted.flatMap((p, i) => (i > 0 && p - sorted[i - 1] > 1 ? [null, p] : [p]))
}

export function Pagination({ page, pageCount, onPageChange, total, pageSize, className }: PaginationProps) {
  const from = total && pageSize ? (page - 1) * pageSize + 1 : null
  const to = total && pageSize ? Math.min(page * pageSize, total) : null

  return (
    <div className={cn('flex flex-col items-center justify-between gap-3 sm:flex-row', className)}>
      <p className="text-sm text-muted-foreground">
        {total !== undefined && from !== null ? (
          <>
            Showing <span className="font-medium text-foreground">{from}</span>–
            <span className="font-medium text-foreground">{to}</span> of{' '}
            <span className="font-medium text-foreground">{total}</span>
          </>
        ) : (
          <>
            Page {page} of {pageCount}
          </>
        )}
      </p>
      <nav className="flex items-center gap-1" aria-label="Pagination">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
        >
          <ChevronLeft />
          <span className="hidden sm:inline">Previous</span>
        </Button>
        <div className="hidden items-center gap-1 sm:flex">
          {getPageItems(page, pageCount).map((p, i) =>
            p === null ? (
              <span key={`gap-${i}`} className="px-2 text-sm text-muted-foreground">
                …
              </span>
            ) : (
              <Button
                key={p}
                variant={p === page ? 'default' : 'ghost'}
                size="sm"
                className="w-9 px-0"
                onClick={() => onPageChange(p)}
                aria-current={p === page ? 'page' : undefined}
              >
                {p}
              </Button>
            ),
          )}
        </div>
        <span className="px-2 text-sm text-muted-foreground sm:hidden">
          {page} / {pageCount}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pageCount}
          aria-label="Next page"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight />
        </Button>
      </nav>
    </div>
  )
}
