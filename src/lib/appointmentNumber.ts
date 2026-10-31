import { format } from 'date-fns'

/** "APT-20261030-" — appointment numbers are sequenced per booking day. */
export const appointmentNumberPrefix = (bookedOn: Date) => `APT-${format(bookedOn, 'yyyyMMdd')}-`

/** The next free number for the day, e.g. "APT-20261030-0001". */
export function nextAppointmentNumber(existing: string[], bookedOn: Date) {
  const prefix = appointmentNumberPrefix(bookedOn)
  const max = existing.reduce((highest, value) => {
    if (!value.startsWith(prefix)) return highest
    const n = Number(value.slice(prefix.length))
    return Number.isFinite(n) ? Math.max(highest, n) : highest
  }, 0)
  return `${prefix}${String(max + 1).padStart(4, '0')}`
}
