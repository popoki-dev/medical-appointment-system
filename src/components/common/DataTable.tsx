import { useMemo, useState, type ReactNode } from 'react'
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { usePagination } from '@/hooks/usePagination'
import { cn } from '@/lib/utils'
import { EmptyState } from './EmptyState'
import { LoadingState } from './LoadingState'
import { Pagination } from './Pagination'

export interface DataTableColumn<T> {
  id: string
  header: ReactNode
  /** Renders the cell. Defaults to `String(row[id])`. */
  cell?: (row: T) => ReactNode
  /** Value used for sorting; enables sorting on the column when provided. */
  sortValue?: (row: T) => string | number
  className?: string
  headerClassName?: string
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  data: T[]
  getRowId: (row: T) => string
  loading?: boolean
  pageSize?: number
  onRowClick?: (row: T) => void
  emptyTitle?: string
  emptyDescription?: ReactNode
  emptyAction?: ReactNode
  /** Rendered above the table (search, filters, actions). */
  toolbar?: ReactNode
  className?: string
}

type SortState = { id: string; direction: 'asc' | 'desc' } | null

export function DataTable<T>({
  columns,
  data,
  getRowId,
  loading,
  pageSize = 10,
  onRowClick,
  emptyTitle = 'No results found',
  emptyDescription = 'Try adjusting your search or filters.',
  emptyAction,
  toolbar,
  className,
}: DataTableProps<T>) {
  const [sort, setSort] = useState<SortState>(null)

  const sorted = useMemo(() => {
    if (!sort) return data
    const column = columns.find((c) => c.id === sort.id)
    if (!column?.sortValue) return data
    const getValue = column.sortValue
    const factor = sort.direction === 'asc' ? 1 : -1
    return [...data].sort((a, b) => {
      const av = getValue(a)
      const bv = getValue(b)
      return (av < bv ? -1 : av > bv ? 1 : 0) * factor
    })
  }, [data, sort, columns])

  const { page, setPage, pageCount, pageItems, total } = usePagination(sorted, pageSize)

  const toggleSort = (id: string) =>
    setSort((prev) => {
      if (prev?.id !== id) return { id, direction: 'asc' }
      if (prev.direction === 'asc') return { id, direction: 'desc' }
      return null
    })

  return (
    <div className={cn('overflow-hidden rounded-xl border bg-card shadow-card', className)}>
      {toolbar && <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center">{toolbar}</div>}

      {loading ? (
        <LoadingState variant="table" />
      ) : total === 0 ? (
        <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {columns.map((column) => {
                const active = sort?.id === column.id
                return (
                  <TableHead key={column.id} className={column.headerClassName} aria-sort={active ? (sort.direction === 'asc' ? 'ascending' : 'descending') : undefined}>
                    {column.sortValue ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(column.id)}
                        className="-ml-1 inline-flex items-center gap-1 rounded px-1 py-0.5 uppercase hover:text-foreground"
                      >
                        {column.header}
                        {active ? (
                          sort.direction === 'asc' ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />
                        )}
                      </button>
                    ) : (
                      column.header
                    )}
                  </TableHead>
                )
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageItems.map((row) => (
              <TableRow
                key={getRowId(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(onRowClick && 'cursor-pointer')}
              >
                {columns.map((column) => (
                  <TableCell key={column.id} className={column.className}>
                    {column.cell ? column.cell(row) : String((row as Record<string, unknown>)[column.id] ?? '')}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {!loading && pageCount > 1 && (
        <div className="border-t px-4 py-3">
          <Pagination page={page} pageCount={pageCount} onPageChange={setPage} total={total} pageSize={pageSize} />
        </div>
      )}
    </div>
  )
}
