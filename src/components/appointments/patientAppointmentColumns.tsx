import { Ban, Eye } from 'lucide-react'
import type { DataTableColumn } from '@/components/common/DataTable'
import { Button } from '@/components/ui/button'
import { formatTime } from '@/lib/date'
import { canPatientCancel } from '@/services'
import type { AppointmentDetails } from '@/types'
import { AppointmentDoctor } from './AppointmentDoctor'
import { appointmentColumns } from './appointmentColumns'

type Action = (appointment: AppointmentDetails) => void

/**
 * Columns for the patient's own appointment tables: number, doctor, department, date,
 * time, status, and "View" / "Cancel" actions. Secondary detail drops away on narrower
 * screens so the table fits without scrolling.
 */
export function patientAppointmentColumns(viewDetails: Action, requestCancel: Action): DataTableColumn<AppointmentDetails>[] {
  const [number, department, date, time, status] = appointmentColumns(['number', 'department', 'date', 'time', 'status'])
  return [
    { ...number, className: 'hidden sm:table-cell', headerClassName: 'hidden sm:table-cell' },
    {
      id: 'doctor',
      header: 'Doctor',
      sortValue: (a) => a.doctorName,
      cell: (a) => <AppointmentDoctor appointment={a} size="sm" />,
    },
    { ...department, className: 'hidden xl:table-cell', headerClassName: 'hidden xl:table-cell' },
    date,
    {
      ...time,
      cell: (a) => (
        <span className="whitespace-nowrap tabular-nums">
          {formatTime(a.startTime)}
          <span className="hidden text-muted-foreground xl:inline"> – {formatTime(a.endTime)}</span>
        </span>
      ),
    },
    status,
    {
      id: 'actions',
      header: <span className="sr-only">Actions</span>,
      headerClassName: 'text-right',
      className: 'text-right',
      cell: (a) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="sm" title="View details" onClick={() => viewDetails(a)} aria-label={`View ${a.appointmentNumber}`}>
            <Eye /> <span className="hidden 2xl:inline">View</span>
          </Button>
          {canPatientCancel(a) && (
            <Button
              variant="ghost"
              size="sm"
              title="Cancel appointment"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => requestCancel(a)}
              aria-label={`Cancel ${a.appointmentNumber}`}
            >
              <Ban /> <span className="hidden 2xl:inline">Cancel</span>
            </Button>
          )}
        </div>
      ),
    },
  ]
}
