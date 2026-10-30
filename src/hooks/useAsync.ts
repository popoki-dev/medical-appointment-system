import { useCallback, useEffect, useRef, useState, type DependencyList } from 'react'
import { storageService } from '@/services/storageService'
import type { CollectionName } from '@/types'

interface AsyncState<T> {
  data: T | undefined
  error: Error | null
  /** True only until the first result arrives; background refreshes don't flip it. */
  isLoading: boolean
}

interface UseAsyncOptions {
  /** Re-run the loader whenever any of these collections change, anywhere in the app. */
  watch?: CollectionName[]
}

/**
 * Runs an async loader whenever `deps` change and tracks its state. With `watch`,
 * it also refreshes silently when the underlying data changes — so a booking made
 * on one screen shows up on every other screen without a reload.
 */
export function useAsync<T>(loader: () => Promise<T>, deps: DependencyList, { watch }: UseAsyncOptions = {}) {
  const [state, setState] = useState<AsyncState<T>>({ data: undefined, error: null, isLoading: true })
  const loaderRef = useRef(loader)
  loaderRef.current = loader
  const requestId = useRef(0)

  const run = useCallback(async (background: boolean) => {
    const id = ++requestId.current
    if (!background) setState((s) => ({ ...s, isLoading: true, error: null }))
    try {
      const data = await loaderRef.current()
      if (id === requestId.current) setState({ data, error: null, isLoading: false })
      return data
    } catch (error) {
      if (id === requestId.current) setState((s) => ({ data: background ? s.data : undefined, error: error as Error, isLoading: false }))
      return undefined
    }
  }, [])

  useEffect(() => {
    void run(false)
    return () => {
      requestId.current++ // ignore results from a stale request
    }
  }, deps)

  const watchKey = watch?.join(',')
  useEffect(() => {
    if (!watchKey) return
    const watched = watchKey.split(',')
    return storageService.subscribe((changed) => {
      if (changed.some((c) => watched.includes(c))) void run(true)
    })
  }, [watchKey, run])

  const reload = useCallback(() => run(true), [run])
  return { ...state, reload }
}
