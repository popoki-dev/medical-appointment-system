import type { DataTableColumn } from '@/components/common/DataTable'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { formatDate, formatTime } from '@/lib/date'
import { getInitials } from '@/lib/utils'
import type { Appointment } from '@/types'

type ColumnKey = 'patient' | 'doctor' | 'date' | 'time' | 'type' | 'reason' | 'status'

const ALL: Record<ColumnKey, DataTableColumn<Appointment>> = {
  patient: {
    id: 'patient',
    header: 'Patient',
    sortValue: (a) => a.patientName,
    cell: (a) => (
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="text-xs">{getInitials(a.patientName)}</AvatarFallback>
        </Avatar>
        <span className="font-medium">{a.patientName}</span>
      </div>
    ),
  },
  doctor: { id: 'doctor', header: 'Doctor', sortValue: (a) => a.doctorName, cell: (a) => a.doctorName },
  date: {
    id: 'date',
    header: 'Date',
    sortValue: (a) => `${a.date} ${a.time}`,
    cell: (a) => <span className="whitespace-nowrap">{formatDate(a.date)}</span>,
  },
  time: {
    id: 'time',
    header: 'Time',
    sortValue: (a) => a.time,
    cell: (a) => <span className="whitespace-nowrap tabular-nums">{formatTime(a.time)}</span>,
  },
  type: {
    id: 'type',
    header: 'Type',
    cell: (a) => <span className="capitalize text-muted-foreground">{a.type.replace('-', ' ')}</span>,
    headerClassName: 'hidden md:table-cell',
    className: 'hidden md:table-cell',
  },
  reason: {
    id: 'reason',
    header: 'Reason',
    cell: (a) => <span className="text-muted-foreground">{a.reason}</span>,
    headerClassName: 'hidden lg:table-cell',
    className: 'hidden lg:table-cell',
  },
  status: { id: 'status', header: 'Status', sortValue: (a) => a.status, cell: (a) => <StatusBadge status={a.status} /> },
}

/** Picks a consistent set of appointment columns for a DataTable. */
export const appointmentColumns = (keys: ColumnKey[]) => keys.map((k) => ALL[k])
