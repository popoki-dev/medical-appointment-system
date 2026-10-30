import { lazy, Suspense, type ComponentType } from 'react'
import { LoadingState } from '@/components/common/LoadingState'

/** Code-splits a named page export and renders it behind a loading fallback. */
export function lazyPage<K extends string>(loader: () => Promise<Record<K, ComponentType>>, name: K) {
  const Page = lazy(async () => ({ default: (await loader())[name] as ComponentType }))
  return (
    <Suspense fallback={<LoadingState variant="page" />}>
      <Page />
    </Suspense>
  )
}
