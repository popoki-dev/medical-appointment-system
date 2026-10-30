import { addDays, format, getDay } from 'date-fns'
import { fromDateKey, toDateKey } from '@/lib/date'
import { buildScheduleSlots, timesOverlap } from '@/lib/schedule'
import type { Doctor, DoctorSchedule, DoctorStatus, TimeSlot, User } from '@/types'
import { createRepository, delay, nextSequence, ServiceError, type CreateInput } from './repository'
import { storageService } from './storageService'
import { userService } from './userService'

const repo = createRepository('doctors', {
  idPrefix: 'doc',
  unique: [
    { key: (d) => d.userId, message: 'This user already has a doctor profile' },
    { key: (d) => d.doctorNumber, message: 'Doctor number already in use' },
  ],
})

const scheduleRepo = createRepository('doctorSchedules', {
  idPrefix: 'sch',
  unique: [{ key: (s) => `${s.doctorId}|${s.dayOfWeek}`, message: 'This doctor already has a schedule for that day' }],
})

/** Appointment statuses that keep a time slot occupied. */
export const SLOT_BLOCKING_STATUSES = ['pending', 'confirmed', 'completed'] as const

export interface DoctorAvailability {
  /** The first free slot in the window, or null when fully booked or not working. */
  next: { date: string; startTime: string } | null
  /** Number of free slots per date ("yyyy-MM-dd"). */
  freeByDate: Record<string, number>
}

function computeSlots(doctorId: string, date: string, excludeAppointmentId?: string): TimeSlot[] {
  const doctor = storageService.getById('doctors', doctorId)
  if (!doctor || doctor.status !== 'active') return []
  const weekday = getDay(fromDateKey(date))
  const schedule = storageService.getAll('doctorSchedules').find((s) => s.doctorId === doctorId && s.dayOfWeek === weekday)
  if (!schedule) return []

  const booked = storageService
    .getAll('appointments')
    .filter(
      (a) =>
        a.doctorId === doctorId &&
        a.appointmentDate === date &&
        a.id !== excludeAppointmentId &&
        (SLOT_BLOCKING_STATUSES as readonly string[]).includes(a.status),
    )
  // Slots that have already started today can't be booked; past days have none.
  const now = new Date()
  const today = toDateKey(now)
  if (date < today) return buildScheduleSlots(schedule).map((slot) => ({ ...slot, available: false }))
  const cutoff = date === today ? format(now, 'HH:mm') : null
  return buildScheduleSlots(schedule).map((slot) => ({
    ...slot,
    available: (!cutoff || slot.startTime > cutoff) && !booked.some((a) => timesOverlap(slot, a)),
  }))
}

export interface DoctorFilters {
  departmentId?: string
  status?: DoctorStatus
  search?: string
}

export type CreateDoctorInput = Pick<User, 'email' | 'phone' | 'password'> &
  Omit<CreateInput<Doctor>, 'userId' | 'doctorNumber' | 'profileImage'>

function validateSchedule(s: Pick<DoctorSchedule, 'startTime' | 'endTime' | 'slotDuration' | 'breakStart' | 'breakEnd'>) {
  if (s.startTime >= s.endTime) throw new ServiceError('Start time must be before end time')
  if (s.slotDuration < 5) throw new ServiceError('Slots must be at least 5 minutes long')
  if (!!s.breakStart !== !!s.breakEnd) throw new ServiceError('Set both a break start and a break end, or neither')
  if (s.breakStart && s.breakEnd && (s.breakStart >= s.breakEnd || s.breakStart < s.startTime || s.breakEnd > s.endTime)) {
    throw new ServiceError('The break must fall within working hours')
  }
}

export const doctorService = {
  getAll: ({ departmentId, status, search }: DoctorFilters = {}) =>
    repo.getAll((d) => {
      if (departmentId && d.departmentId !== departmentId) return false
      if (status && d.status !== status) return false
      if (search) {
        const q = search.toLowerCase()
        return d.fullName.toLowerCase().includes(q) || d.specialization.toLowerCase().includes(q)
      }
      return true
    }),

  getById: repo.getById,

  async getByUserId(userId: string) {
    await delay()
    return storageService.getAll('doctors').find((d) => d.userId === userId) ?? null
  },

  /** Creates the doctor's user account and profile together. */
  async create({ email, phone, password, ...profile }: CreateDoctorInput) {
    if (!storageService.getById('departments', profile.departmentId)) throw new ServiceError('Department not found', 'NOT_FOUND')
    const user = await userService.create({ fullName: profile.fullName, email, phone, password, role: 'doctor' })
    const doctorNumber = nextSequence(storageService.getAll('doctors').map((d) => d.doctorNumber), 'DOC-', 4)
    return repo.create({ ...profile, userId: user.id, doctorNumber, profileImage: null })
  },

  async update(id: string, patch: Partial<Omit<Doctor, 'id' | 'userId' | 'doctorNumber'>>) {
    if (patch.departmentId && !storageService.getById('departments', patch.departmentId)) {
      throw new ServiceError('Department not found', 'NOT_FOUND')
    }
    const doctor = await repo.update(id, patch)
    // Keep the linked user account's name and photo in step.
    if (patch.fullName !== undefined || patch.profileImage !== undefined) {
      storageService.update('users', doctor.userId, { fullName: doctor.fullName, profileImage: doctor.profileImage })
    }
    return doctor
  },

  /** Deletes the profile and its schedules. Refused while appointments reference it. */
  async delete(id: string) {
    if (storageService.getAll('appointments').some((a) => a.doctorId === id)) {
      throw new ServiceError('This doctor has appointments on record. Set their status to inactive instead.', 'CONFLICT')
    }
    await repo.delete(id)
    storageService.removeWhere('doctorSchedules', (s) => s.doctorId === id)
  },

  // ---- Schedules ---------------------------------------------------------

  getSchedules: (doctorId: string) =>
    scheduleRepo.getAll((s) => s.doctorId === doctorId).then((rows) => rows.sort((a, b) => a.dayOfWeek - b.dayOfWeek)),

  async createSchedule(input: CreateInput<DoctorSchedule>) {
    if (!storageService.getById('doctors', input.doctorId)) throw new ServiceError('Doctor not found', 'NOT_FOUND')
    validateSchedule(input)
    return scheduleRepo.create(input)
  },

  async updateSchedule(id: string, patch: Partial<Omit<DoctorSchedule, 'id' | 'doctorId'>>) {
    const current = storageService.getById('doctorSchedules', id)
    if (current) validateSchedule({ ...current, ...patch })
    return scheduleRepo.update(id, patch)
  },

  deleteSchedule: scheduleRepo.delete,

  /**
   * Every slot the doctor works on `date` ("yyyy-MM-dd"), flagged with whether it is
   * still free. Returns [] when the doctor is inactive or not working that day.
   */
  async getAvailableSlots(doctorId: string, date: string, options: { excludeAppointmentId?: string } = {}): Promise<TimeSlot[]> {
    await delay()
    return computeSlots(doctorId, date, options.excludeAppointmentId)
  },

  /**
   * Free-slot counts per day for the next `days` days (today included), and the first
   * free slot, for each doctor. Used by the directory's availability filter and badges.
   */
  async getAvailability(doctorIds: string[], { days = 14 }: { days?: number } = {}): Promise<Record<string, DoctorAvailability>> {
    await delay()
    const dates = Array.from({ length: days }, (_, i) => toDateKey(addDays(new Date(), i)))
    return Object.fromEntries(
      doctorIds.map((doctorId) => {
        const freeByDate: Record<string, number> = {}
        let next: DoctorAvailability['next'] = null
        for (const date of dates) {
          const free = computeSlots(doctorId, date).filter((slot) => slot.available)
          freeByDate[date] = free.length
          if (!next && free.length) next = { date, startTime: free[0].startTime }
        }
        return [doctorId, { next, freeByDate }]
      }),
    )
  },
}
