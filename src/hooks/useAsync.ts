import { useCallback, useEffect, useRef, useState, type DependencyList } from 'react'

interface AsyncState<T> {
  data: T | undefined
  error: Error | null
  isLoading: boolean
}

/**
 * Runs an async loader whenever `deps` change and tracks its state.
 * A lightweight stand-in for a data-fetching library such as TanStack Query.
 */
export function useAsync<T>(loader: () => Promise<T>, deps: DependencyList) {
  const [state, setState] = useState<AsyncState<T>>({ data: undefined, error: null, isLoading: true })
  const loaderRef = useRef(loader)
  loaderRef.current = loader

  const run = useCallback(async () => {
    setState((s) => ({ ...s, isLoading: true, error: null }))
    try {
      const data = await loaderRef.current()
      setState({ data, error: null, isLoading: false })
      return data
    } catch (error) {
      setState({ data: undefined, error: error as Error, isLoading: false })
      return undefined
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    setState((s) => ({ ...s, isLoading: true, error: null }))
    loaderRef
      .current()
      .then((data) => !cancelled && setState({ data, error: null, isLoading: false }))
      .catch((error: Error) => !cancelled && setState({ data: undefined, error, isLoading: false }))
    return () => {
      cancelled = true
    }
  }, deps)

  return { ...state, reload: run }
}
