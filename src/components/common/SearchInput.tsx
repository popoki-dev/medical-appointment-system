import { useEffect, useState } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useDebounce } from '@/hooks/useDebounce'
import { cn } from '@/lib/utils'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  debounceMs?: number
  className?: string
}

/** Search box with a leading icon, clear button and debounced `onChange`. */
export function SearchInput({ value, onChange, placeholder = 'Search…', debounceMs = 300, className }: SearchInputProps) {
  const [draft, setDraft] = useState(value)
  const debounced = useDebounce(draft, debounceMs)

  useEffect(() => setDraft(value), [value])

  useEffect(() => {
    if (debounced !== value) onChange(debounced)
    // Only fire when the debounced draft settles.
  }, [debounced])

  return (
    <div className={cn('relative w-full sm:w-72', className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder={placeholder}
        className="pl-9 pr-9 [&::-webkit-search-cancel-button]:hidden"
        aria-label={placeholder}
      />
      {draft && (
        <button
          type="button"
          onClick={() => {
            setDraft('')
            onChange('')
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Clear search"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}
