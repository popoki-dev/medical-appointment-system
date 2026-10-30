import type { DataTableColumn } from '@/components/common/DataTable'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { PAYMENT_STATUS_META } from '@/config/status'
import { formatDate, formatTime } from '@/lib/date'
import { getInitials } from '@/lib/utils'
import type { AppointmentDetails } from '@/types'

type ColumnKey = 'number' | 'patient' | 'doctor' | 'department' | 'date' | 'time' | 'reason' | 'status' | 'payment'

const ALL: Record<ColumnKey, DataTableColumn<AppointmentDetails>> = {
  number: {
    id: 'number',
    header: 'No.',
    sortValue: (a) => a.appointmentNumber,
    cell: (a) => <span className="whitespace-nowrap font-mono text-xs text-muted-foreground">{a.appointmentNumber}</span>,
    headerClassName: 'hidden xl:table-cell',
    className: 'hidden xl:table-cell',
  },
  patient: {
    id: 'patient',
    header: 'Patient',
    sortValue: (a) => a.patientName,
    cell: (a) => (
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8">
          {a.patientUser?.profileImage && <AvatarImage src={a.patientUser.profileImage} alt="" />}
          <AvatarFallback className="text-xs">{getInitials(a.patientName)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate font-medium">{a.patientName}</p>
          {a.patient && <p className="text-xs text-muted-foreground">{a.patient.patientNumber}</p>}
        </div>
      </div>
    ),
  },
  doctor: { id: 'doctor', header: 'Doctor', sortValue: (a) => a.doctorName, cell: (a) => a.doctorName },
  department: {
    id: 'department',
    header: 'Department',
    sortValue: (a) => a.departmentName,
    cell: (a) => <span className="text-muted-foreground">{a.departmentName}</span>,
    headerClassName: 'hidden md:table-cell',
    className: 'hidden md:table-cell',
  },
  date: {
    id: 'date',
    header: 'Date',
    sortValue: (a) => `${a.appointmentDate} ${a.startTime}`,
    cell: (a) => <span className="whitespace-nowrap">{formatDate(a.appointmentDate)}</span>,
  },
  time: {
    id: 'time',
    header: 'Time',
    sortValue: (a) => a.startTime,
    cell: (a) => (
      <span className="whitespace-nowrap tabular-nums">
        {formatTime(a.startTime)}
        <span className="text-muted-foreground"> – {formatTime(a.endTime)}</span>
      </span>
    ),
  },
  reason: {
    id: 'reason',
    header: 'Reason',
    cell: (a) => <span className="text-muted-foreground">{a.reason}</span>,
    headerClassName: 'hidden lg:table-cell',
    className: 'hidden lg:table-cell',
  },
  status: { id: 'status', header: 'Status', sortValue: (a) => a.status, cell: (a) => <StatusBadge status={a.status} /> },
  payment: {
    id: 'payment',
    header: 'Payment',
    sortValue: (a) => a.paymentStatus,
    cell: (a) => <StatusBadge label={PAYMENT_STATUS_META[a.paymentStatus].label} tone={PAYMENT_STATUS_META[a.paymentStatus].tone} />,
    headerClassName: 'hidden lg:table-cell',
    className: 'hidden lg:table-cell',
  },
}

/** Picks a consistent set of appointment columns for a DataTable. */
export const appointmentColumns = (keys: ColumnKey[]) => keys.map((k) => ALL[k])
