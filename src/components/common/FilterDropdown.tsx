import { ChevronDown, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { SelectOption } from '@/types'

interface FilterDropdownProps<T extends string> {
  label: string
  options: SelectOption<T>[]
  selected: T[]
  onChange: (selected: T[]) => void
  align?: 'start' | 'end'
}

/** Multi-select filter rendered as a dropdown of checkboxes. */
export function FilterDropdown<T extends string>({ label, options, selected, onChange, align = 'start' }: FilterDropdownProps<T>) {
  const toggle = (value: T) =>
    onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="justify-between gap-2">
          <Filter className="text-muted-foreground" />
          {label}
          {selected.length > 0 && (
            <span className="rounded-full bg-primary px-1.5 text-[11px] font-semibold leading-5 text-primary-foreground">
              {selected.length}
            </span>
          )}
          <ChevronDown className="text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-56">
        <DropdownMenuLabel className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {options.map((option) => (
          <DropdownMenuCheckboxItem
            key={option.value}
            checked={selected.includes(option.value)}
            onCheckedChange={() => toggle(option.value)}
            onSelect={(e) => e.preventDefault()}
          >
            {option.label}
          </DropdownMenuCheckboxItem>
        ))}
        {selected.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => onChange([])} className="justify-center text-primary">
              Clear filters
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
