import { addDays, isWeekend } from 'date-fns'
import type { Appointment, AppointmentStatus, AppointmentType } from '@/types'
import { toDateKey } from '@/lib/date'
import { mockDoctors } from './doctors'
import { mockPatients } from './patients'

const REASONS = [
  'Routine check-up',
  'Chest discomfort',
  'Recurring headaches',
  'Follow-up on lab results',
  'Knee pain after running',
  'Skin rash',
  'Annual physical',
  'Medication review',
]
const TYPES: AppointmentType[] = ['consultation', 'follow-up', 'check-up', 'consultation']
const TIMES = ['09:00', '09:30', '10:00', '11:00', '11:30', '13:00', '14:00', '14:30', '15:00', '16:00']

/**
 * Generates a deterministic set of appointments spread around "today" so the
 * dashboards always have past, current and upcoming data to show.
 */
export function generateMockAppointments(today = new Date()): Appointment[] {
  const appointments: Appointment[] = []
  let n = 0
  for (let offset = -21; offset <= 14; offset++) {
    const day = addDays(today, offset)
    if (isWeekend(day)) continue
    const perDay = offset === 0 ? 6 : 2 + (Math.abs(offset) % 3)
    for (let i = 0; i < perDay; i++, n++) {
      const doctor = mockDoctors[n % mockDoctors.length]
      // Ensure the demo patient and demo doctor regularly get appointments.
      const patient = n % 4 === 0 ? mockPatients[0] : mockPatients[n % mockPatients.length]
      let status: AppointmentStatus
      if (offset < 0) status = n % 9 === 0 ? 'cancelled' : n % 11 === 0 ? 'no-show' : 'completed'
      else if (offset === 0) status = (['completed', 'in-progress', 'checked-in', 'confirmed', 'confirmed', 'pending'] as const)[i]
      else status = n % 3 === 0 ? 'pending' : 'confirmed'

      const createdAt = addDays(day, -7).toISOString()
      appointments.push({
        id: `apt_${String(n + 1).padStart(4, '0')}`,
        patientId: patient.id,
        patientName: `${patient.firstName} ${patient.lastName}`,
        doctorId: doctor.id,
        doctorName: doctor.name,
        departmentId: doctor.departmentId,
        date: toDateKey(day),
        time: TIMES[(n + i) % TIMES.length],
        durationMinutes: doctor.slotDurationMinutes,
        type: TYPES[n % TYPES.length],
        status,
        reason: REASONS[n % REASONS.length],
        createdAt,
        updatedAt: createdAt,
      })
    }
  }
  return appointments
}
