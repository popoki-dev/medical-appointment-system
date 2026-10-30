import { Building2 } from 'lucide-react'
import { EmptyState } from '@/components/common/EmptyState'
import { DepartmentIcon } from '@/components/doctors'
import { Skeleton } from '@/components/ui/skeleton'
import type { Department } from '@/types'
import { SelectableCard } from './SelectableCard'

interface DepartmentSelectProps {
  departments: Department[] | undefined
  /** Active doctors per department id. */
  doctorCounts: Record<string, number>
  value?: string
  onChange: (departmentId: string) => void
}

/** Step 1: every active department as a selectable card. */
export function DepartmentSelect({ departments, doctorCounts, value, onChange }: DepartmentSelectProps) {
  if (!departments) {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
    )
  }
  if (!departments.length) {
    return <EmptyState icon={Building2} title="No departments open" description="No department is taking bookings right now." />
  }
  return (
    <div role="radiogroup" aria-label="Department" className="grid gap-3 sm:grid-cols-2">
      {departments.map((department) => {
        const count = doctorCounts[department.id] ?? 0
        return (
          <SelectableCard
            key={department.id}
            selected={department.id === value}
            disabled={count === 0}
            onSelect={() => onChange(department.id)}
          >
            <div className="flex gap-4 pr-6">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary text-white">
                <DepartmentIcon name={department.icon} className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <span className="block font-semibold">{department.name}</span>
                <span className="mt-0.5 line-clamp-2 block text-sm text-muted-foreground">{department.description}</span>
                <span className="mt-2 block text-xs font-medium text-secondary">
                  {count ? `${count} ${count === 1 ? 'doctor' : 'doctors'} available` : 'No doctors taking bookings'}
                </span>
              </span>
            </div>
          </SelectableCard>
        )
      })}
    </div>
  )
}
