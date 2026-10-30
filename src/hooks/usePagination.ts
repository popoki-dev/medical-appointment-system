import { useEffect, useMemo, useState } from 'react'
import { APP_CONFIG } from '@/config/app'

export function usePagination<T>(items: T[], pageSize: number = APP_CONFIG.defaultPageSize) {
  const [page, setPage] = useState(1)
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize))

  // Clamp when the data shrinks (e.g. after filtering).
  useEffect(() => {
    if (page > pageCount) setPage(pageCount)
  }, [page, pageCount])

  const pageItems = useMemo(() => items.slice((page - 1) * pageSize, page * pageSize), [items, page, pageSize])

  return { page, setPage, pageCount, pageSize, pageItems, total: items.length }
}
