import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { addDays, getDay } from 'date-fns'
import { CalendarDays, CalendarSearch, Stethoscope, Trash2, Users } from 'lucide-react'
import { appointmentColumns } from '@/components/appointments/appointmentColumns'
import {
  ConfirmationDialog,
  DataTable,
  DatePicker,
  EmptyState,
  FilterDropdown,
  FormField,
  LoadingState,
  Modal,
  PageHeader,
  Pagination,
  SearchInput,
  StatCard,
  StatusBadge,
  TimeSlotPicker,
  toast,
} from '@/components/common'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { APPOINTMENT_STATUS_META } from '@/config/status'
import { mockDoctors } from '@/data'
import { useAppointments } from '@/hooks/useAppointments'
import { useAsync } from '@/hooks/useAsync'
import { useDisclosure } from '@/hooks/useDisclosure'
import { toDateKey } from '@/lib/date'
import { appointmentService } from '@/services'
import type { AppointmentStatus, SelectOption } from '@/types'

const STATUS_OPTIONS: SelectOption<AppointmentStatus>[] = (Object.keys(APPOINTMENT_STATUS_META) as AppointmentStatus[]).map(
  (value) => ({ value, label: APPOINTMENT_STATUS_META[value].label }),
)

const demoSchema = z.object({
  doctorId: z.string().min(1, 'Select a doctor'),
  date: z.date({ required_error: 'Pick a date' }),
  reason: z.string().trim().min(5, 'Tell us a little more (min. 5 characters)'),
})
type DemoForm = z.infer<typeof demoSchema>

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

const SWATCHES = [
  { name: 'Primary', className: 'bg-primary', hex: '#2563EB' },
  { name: 'Secondary', className: 'bg-secondary', hex: '#0D9488' },
  { name: 'Background', className: 'bg-background border', hex: '#F8FAFC' },
  { name: 'Foreground', className: 'bg-foreground', hex: '#1E293B' },
  { name: 'Destructive', className: 'bg-destructive', hex: '#DC2626' },
  { name: 'Muted', className: 'bg-muted border', hex: '#F1F5F9' },
]

export function UiKitPage() {
  const [search, setSearch] = useState('')
  const [statuses, setStatuses] = useState<AppointmentStatus[]>([])
  const [page, setPage] = useState(4)
  const [date, setDate] = useState<Date | undefined>(addDays(new Date(), 1))
  const [time, setTime] = useState<string>()
  const modal = useDisclosure()
  const confirm = useDisclosure()

  const doctor = mockDoctors[0]
  const dateKey = date ? toDateKey(date) : ''
  const { data: slots = [], isLoading: slotsLoading } = useAsync(
    () => (dateKey ? appointmentService.getAvailableSlots(doctor, dateKey) : Promise.resolve([])),
    [dateKey],
  )

  const { data: appointments = [], isLoading } = useAppointments()
  const filtered = useMemo(
    () =>
      appointments.filter(
        (a) =>
          (!statuses.length || statuses.includes(a.status)) &&
          (!search || a.patientName.toLowerCase().includes(search.toLowerCase())),
      ),
    [appointments, search, statuses],
  )

  const form = useForm<DemoForm>({ resolver: zodResolver(demoSchema), defaultValues: { doctorId: '', reason: '' } })
  const onSubmit = form.handleSubmit((values) => {
    toast.success('Form is valid', `${values.reason.slice(0, 40)}…`)
    form.reset()
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="UI Kit"
        description="The design system and reusable components every module is built from."
        actions={<Button variant="outline" onClick={() => toast.info('Toasts work', 'Triggered from the page header.')}>Show toast</Button>}
      />

      <Section title="Colour tokens">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {SWATCHES.map((s) => (
            <div key={s.name} className="space-y-2">
              <div className={`h-16 rounded-lg ${s.className}`} />
              <div>
                <p className="text-sm font-medium">{s.name}</p>
                <p className="text-xs uppercase text-muted-foreground">{s.hex}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Buttons & status badges">
        <div className="flex flex-wrap gap-2">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="link">Link</Button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((s) => (
            <StatusBadge key={s.value} status={s.value} />
          ))}
          <StatusBadge label="Custom tone" tone="teal" />
        </div>
      </Section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Appointments" value="1,284" icon={CalendarDays} trend={{ value: 12.5, label: 'vs. last month' }} />
        <StatCard title="Doctors" value={42} icon={Stethoscope} tone="teal" description="Across 6 departments" />
        <StatCard title="Patients" value="8,930" icon={Users} tone="amber" trend={{ value: -2.1, label: 'vs. last month' }} />
        <StatCard title="Loading" value={0} icon={Users} tone="rose" loading />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Form with validation" description="React Hook Form + Zod via the FormField wrapper.">
          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <FormField
              control={form.control}
              name="doctorId"
              label="Doctor"
              required
              render={({ field, inputProps }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger {...inputProps} onBlur={field.onBlur}>
                    <SelectValue placeholder="Choose a doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockDoctors.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name} — {d.specialization}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              label="Preferred date"
              required
              description="Weekdays only."
              render={({ field, inputProps }) => (
                <DatePicker
                  id={inputProps.id}
                  invalid={inputProps['aria-invalid']}
                  value={field.value}
                  onChange={field.onChange}
                  disabled={[{ before: new Date() }, { dayOfWeek: [0, 6] }]}
                />
              )}
            />
            <FormField
              control={form.control}
              name="reason"
              label="Reason for visit"
              required
              render={({ field, inputProps }) => <Textarea rows={3} placeholder="Describe your symptoms" {...field} {...inputProps} />}
            />
            <div className="flex gap-2">
              <Button type="submit">Validate</Button>
              <Button type="button" variant="ghost" onClick={() => form.reset()}>
                Reset
              </Button>
            </div>
          </form>
        </Section>

        <Section title="Date & time slot picker" description={`Live availability for ${doctor.name}.`}>
          <div className="space-y-5">
            <DatePicker
              value={date}
              onChange={(d) => {
                setDate(d)
                setTime(undefined)
              }}
              disabled={[{ before: new Date() }, (d) => !doctor.workingHours.some((h) => h.day === getDay(d))]}
            />
            <TimeSlotPicker slots={slots} value={time} onChange={setTime} loading={slotsLoading} />
          </div>
        </Section>
      </div>

      <Section title="Data table" description="Sortable columns, search, filters, pagination, loading and empty states.">
        <DataTable
          className="shadow-none"
          columns={appointmentColumns(['patient', 'doctor', 'date', 'time', 'type', 'status'])}
          data={filtered}
          getRowId={(a) => a.id}
          loading={isLoading}
          pageSize={6}
          onRowClick={(a) => toast.info(a.patientName, `${a.reason} · ${a.doctorName}`)}
          toolbar={
            <>
              <SearchInput value={search} onChange={setSearch} placeholder="Search patients" />
              <FilterDropdown label="Status" options={STATUS_OPTIONS} selected={statuses} onChange={setStatuses} />
            </>
          }
        />
      </Section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Dialogs">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={modal.open}>
              Open modal
            </Button>
            <Button variant="destructive" onClick={confirm.open}>
              <Trash2 /> Cancel appointment
            </Button>
          </div>
        </Section>
        <Section title="Pagination">
          <Pagination page={page} pageCount={12} onPageChange={setPage} total={118} pageSize={10} />
        </Section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Empty state">
          <EmptyState
            icon={CalendarSearch}
            title="No appointments found"
            description="Try a different date range or clear your filters."
            action={<Button size="sm">Book appointment</Button>}
            className="py-6"
          />
        </Section>
        <Section title="Loading states">
          <div className="space-y-4">
            <LoadingState className="py-4" />
            <LoadingState variant="table" rows={2} className="p-0" />
          </div>
        </Section>
      </div>

      <Modal
        open={modal.isOpen}
        onOpenChange={modal.setIsOpen}
        title="Add a note"
        description="Notes are visible to the care team only."
        footer={
          <>
            <Button variant="outline" onClick={modal.close}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                modal.close()
                toast.success('Note saved')
              }}
            >
              Save note
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Input placeholder="Title" />
          <Textarea rows={4} placeholder="Write your note…" />
        </div>
      </Modal>

      <ConfirmationDialog
        open={confirm.isOpen}
        onOpenChange={confirm.setIsOpen}
        variant="destructive"
        title="Cancel this appointment?"
        description="The patient will be notified and the slot released. This can't be undone."
        confirmLabel="Yes, cancel it"
        cancelLabel="Keep appointment"
        onConfirm={async () => {
          await new Promise((r) => setTimeout(r, 800))
          toast.success('Appointment cancelled')
        }}
      />
    </div>
  )
}
