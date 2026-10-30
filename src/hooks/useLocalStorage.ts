import { useCallback, useState } from 'react'
import { storage } from '@/lib/storage'

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => storage.get(key, initialValue))

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved = next instanceof Function ? next(prev) : next
        storage.set(key, resolved)
        return resolved
      })
    },
    [key],
  )

  return [value, update] as const
}
