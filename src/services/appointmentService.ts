import { getDay } from 'date-fns'
import { generateMockAppointments } from '@/data'
import { buildTimeRange, fromDateKey } from '@/lib/date'
import { generateId } from '@/lib/utils'
import type { Appointment, AppointmentStatus, Doctor, TimeSlot } from '@/types'
import { LocalCollection, ServiceError } from './mockClient'

const appointments = new LocalCollection<Appointment>('appointments', () => generateMockAppointments())

/** Statuses that keep a slot occupied. */
const BLOCKING_STATUSES: AppointmentStatus[] = ['pending', 'confirmed', 'checked-in', 'in-progress', 'completed']

export interface AppointmentFilters {
  patientId?: string
  doctorId?: string
  date?: string
  status?: AppointmentStatus[]
}

export type NewAppointment = Omit<Appointment, 'id' | 'status' | 'createdAt' | 'updatedAt'>

export const appointmentService = {
  list: ({ patientId, doctorId, date, status }: AppointmentFilters = {}) =>
    appointments
      .list(
        (a) =>
          (!patientId || a.patientId === patientId) &&
          (!doctorId || a.doctorId === doctorId) &&
          (!date || a.date === date) &&
          (!status?.length || status.includes(a.status)),
      )
      .then((items) => [...items].sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))),

  get: (id: string) => appointments.get(id),

  async create(input: NewAppointment): Promise<Appointment> {
    const clash = await appointments.list(
      (a) => a.doctorId === input.doctorId && a.date === input.date && a.time === input.time && BLOCKING_STATUSES.includes(a.status),
    )
    if (clash.length) throw new ServiceError('This time slot has just been booked. Please choose another.', 'CONFLICT')
    const now = new Date().toISOString()
    return appointments.create({ ...input, id: generateId('apt'), status: 'pending', createdAt: now, updatedAt: now })
  },

  updateStatus: (id: string, status: AppointmentStatus) =>
    appointments.update(id, { status, updatedAt: new Date().toISOString() }),

  reschedule: (id: string, date: string, time: string) =>
    appointments.update(id, { date, time, status: 'pending', updatedAt: new Date().toISOString() }),

  /** Returns every slot in the doctor's working hours for a date, flagged with availability. */
  async getAvailableSlots(doctor: Doctor, date: string): Promise<TimeSlot[]> {
    const weekday = getDay(fromDateKey(date))
    const hours = doctor.workingHours.find((h) => h.day === weekday)
    if (!hours) return []
    const booked = new Set(
      (await appointments.list((a) => a.doctorId === doctor.id && a.date === date && BLOCKING_STATUSES.includes(a.status))).map(
        (a) => a.time,
      ),
    )
    return buildTimeRange(hours.start, hours.end, doctor.slotDurationMinutes).map((time) => ({
      time,
      available: !booked.has(time),
    }))
  },
}
