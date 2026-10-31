import { addDays } from 'date-fns'
import { BOOKING_CONFIG } from '@/config/booking'
import { nextAppointmentNumber } from '@/lib/appointmentNumber'
import { formatDate, formatTime, toDateKey } from '@/lib/date'
import { timesOverlap } from '@/lib/schedule'
import { generateId } from '@/lib/utils'
import { bookingDetailsSchema } from '@/lib/validation'
import type { Appointment, AppointmentContact, AppointmentDetails, AppointmentStatus, PaymentStatus } from '@/types'
import { createRepository, delay, ServiceError } from './repository'
import { computeSlots, SLOT_BLOCKING_STATUSES } from './doctorService'
import { notificationService } from './notificationService'
import { storageService } from './storageService'
import { toAuthUser } from './userService'

const repo = createRepository('appointments', {
  idPrefix: 'apt',
  unique: [{ key: (a) => a.appointmentNumber, message: 'Appointment number already in use' }],
})

const isBlocking = (status: AppointmentStatus) => (SLOT_BLOCKING_STATUSES as readonly string[]).includes(status)

/** Statuses a patient may still cancel themselves. */
export const PATIENT_CANCELLABLE_STATUSES: readonly AppointmentStatus[] = ['pending', 'confirmed']

export const canPatientCancel = (appointment: Pick<Appointment, 'status'>) =>
  PATIENT_CANCELLABLE_STATUSES.includes(appointment.status)

/** Pending or confirmed, and not yet started. */
export const isUpcoming = (appointment: Pick<Appointment, 'status' | 'appointmentDate' | 'startTime'>, now = new Date()) =>
  canPatientCancel(appointment) &&
  `${appointment.appointmentDate} ${appointment.startTime}` >= `${toDateKey(now)} ${formatDate(now, 'HH:mm')}`

export interface AppointmentFilters {
  patientId?: string
  doctorId?: string
  departmentId?: string
  date?: string
  from?: string
  to?: string
  status?: AppointmentStatus[]
}

export interface BookAppointmentInput {
  patientId: string
  doctorId: string
  appointmentDate: string
  startTime: string
  reason: string
  notes?: string
  contact?: AppointmentContact
}

/** The last date ("yyyy-MM-dd") that can be booked today, given the booking horizon. */
export const lastBookableDate = (now = new Date()) => toDateKey(addDays(now, BOOKING_CONFIG.horizonDays - 1))

const byDateTime = (a: Appointment, b: Appointment) =>
  `${a.appointmentDate}${a.startTime}`.localeCompare(`${b.appointmentDate}${b.startTime}`)

const matches = (f: AppointmentFilters) => (a: Appointment) =>
  (!f.patientId || a.patientId === f.patientId) &&
  (!f.doctorId || a.doctorId === f.doctorId) &&
  (!f.departmentId || a.departmentId === f.departmentId) &&
  (!f.date || a.appointmentDate === f.date) &&
  (!f.from || a.appointmentDate >= f.from) &&
  (!f.to || a.appointmentDate <= f.to) &&
  (!f.status?.length || f.status.includes(a.status))

/** Joins appointments with their patient, doctor and department in one pass. */
function withDetails(appointments: Appointment[]): AppointmentDetails[] {
  const users = new Map(storageService.getAll('users').map((u) => [u.id, u]))
  const patients = new Map(storageService.getAll('patients').map((p) => [p.id, p]))
  const doctors = new Map(storageService.getAll('doctors').map((d) => [d.id, d]))
  const departments = new Map(storageService.getAll('departments').map((d) => [d.id, d]))
  return appointments.map((a) => {
    const patient = patients.get(a.patientId) ?? null
    const patientUser = patient ? users.get(patient.userId) : undefined
    const doctor = doctors.get(a.doctorId) ?? null
    const department = departments.get(a.departmentId) ?? null
    return {
      ...a,
      patient,
      patientUser: patientUser ? toAuthUser(patientUser) : null,
      patientName: patientUser?.fullName ?? 'Unknown patient',
      doctor,
      doctorName: doctor?.fullName ?? 'Unknown doctor',
      department,
      departmentName: department?.name ?? '—',
    }
  })
}

/**
 * Throws unless the slot can be booked: within the booking window, the doctor active and
 * working then, nothing overlapping on the doctor's calendar, and no clash for the patient.
 * Synchronous on purpose: callers check and write in one step, so two submissions can't
 * both pass.
 */
function checkSlotBookable(
  input: Pick<Appointment, 'patientId' | 'doctorId' | 'appointmentDate' | 'startTime'>,
  excludeAppointmentId?: string,
) {
  const today = toDateKey(new Date())
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.appointmentDate)) throw new ServiceError('Please choose a valid date')
  if (input.appointmentDate < today) throw new ServiceError('Appointments cannot be booked in the past')
  if (input.appointmentDate > lastBookableDate()) {
    throw new ServiceError(`Appointments can be booked up to ${BOOKING_CONFIG.horizonDays} days ahead`)
  }

  const doctor = storageService.getById('doctors', input.doctorId)
  if (!doctor) throw new ServiceError('Doctor not found', 'NOT_FOUND')
  if (doctor.status !== 'active') throw new ServiceError(`${doctor.fullName} is not taking appointments at the moment`, 'CONFLICT')
  if (storageService.getById('departments', doctor.departmentId)?.status !== 'active') {
    throw new ServiceError('This department is not taking appointments at the moment', 'CONFLICT')
  }

  // Slot availability already accounts for overlapping appointments on the doctor's calendar.
  const slot = computeSlots(input.doctorId, input.appointmentDate, excludeAppointmentId).find((s) => s.startTime === input.startTime)
  if (!slot) throw new ServiceError('The doctor is not available at that time')
  if (!slot.available) throw new ServiceError('This time slot has just been booked. Please choose another.', 'CONFLICT')

  const patientClash = storageService
    .getAll('appointments')
    .find(
      (a) =>
        a.id !== excludeAppointmentId &&
        a.patientId === input.patientId &&
        a.appointmentDate === input.appointmentDate &&
        isBlocking(a.status) &&
        timesOverlap(a, slot),
    )
  if (patientClash) {
    throw new ServiceError(
      `You already have an appointment (${patientClash.appointmentNumber}) at ${formatTime(patientClash.startTime)} that day.`,
      'CONFLICT',
    )
  }
  return slot
}

function notifyParties(appointment: Appointment, title: string, message: string, { toDoctor = true, toPatient = true } = {}) {
  const patient = storageService.getById('patients', appointment.patientId)
  const doctor = storageService.getById('doctors', appointment.doctorId)
  if (toPatient && patient) notificationService.notify({ userId: patient.userId, title, message, type: 'appointment' })
  if (toDoctor && doctor) notificationService.notify({ userId: doctor.userId, title, message, type: 'appointment' })
}

const describe = (a: Appointment) => `${formatDate(a.appointmentDate, 'EEE, MMM d')} at ${formatTime(a.startTime)}`

const STATUS_MESSAGES: Partial<Record<AppointmentStatus, string>> = {
  confirmed: 'Appointment confirmed',
  cancelled: 'Appointment cancelled',
  rejected: 'Appointment request declined',
  completed: 'Appointment completed',
  'no-show': 'Missed appointment',
}

export const appointmentService = {
  getAll: (filters: AppointmentFilters = {}) => repo.getAll(matches(filters)).then((items) => items.sort(byDateTime)),

  /** Appointments joined with patient, doctor and department details — what most screens need. */
  async getAllWithDetails(filters: AppointmentFilters = {}) {
    return withDetails(await appointmentService.getAll(filters))
  },

  getById: repo.getById,

  async getByIdWithDetails(id: string) {
    return withDetails([await repo.getById(id)])[0]
  },

  /**
   * Books a new appointment as `pending`. Re-validates the details, rechecks the slot
   * and both calendars, numbers it (APT-yyyyMMdd-NNNN) and notifies the patient, the
   * doctor and the front desk.
   */
  async create(input: BookAppointmentInput) {
    await delay()
    // From here to the insert everything is synchronous, so a double submit can't slip through.
    const patient = storageService.getById('patients', input.patientId)
    if (!patient) throw new ServiceError('Patient not found', 'NOT_FOUND')
    const patientUser = storageService.getById('users', patient.userId)
    const details = bookingDetailsSchema.safeParse({
      reason: input.reason,
      notes: input.notes ?? '',
      phone: input.contact?.phone ?? patientUser?.phone ?? '',
      email: input.contact?.email ?? patientUser?.email ?? '',
    })
    if (!details.success) {
      const issue = details.error.issues[0]
      throw new ServiceError(issue.message, 'VALIDATION', String(issue.path[0]))
    }
    const slot = checkSlotBookable(input)
    const doctor = storageService.getById('doctors', input.doctorId)!

    const now = new Date()
    const { reason, notes, phone, email } = details.data
    const appointment = storageService.insert('appointments', {
      id: generateId('apt'),
      appointmentNumber: nextAppointmentNumber(storageService.getAll('appointments').map((a) => a.appointmentNumber), now),
      patientId: patient.id,
      doctorId: doctor.id,
      departmentId: doctor.departmentId,
      appointmentDate: input.appointmentDate,
      startTime: slot.startTime,
      endTime: slot.endTime,
      reason,
      ...(notes ? { notes } : {}),
      contact: { phone, email },
      status: 'pending',
      paymentStatus: 'unpaid',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    })

    const patientName = patientUser?.fullName ?? 'A patient'
    const when = describe(appointment)
    notificationService.notify({
      userId: patient.userId,
      title: 'Appointment requested',
      message: `${appointment.appointmentNumber} with ${doctor.fullName} on ${when} is pending confirmation.`,
      type: 'appointment',
    })
    notificationService.notify({
      userId: doctor.userId,
      title: 'New appointment request',
      message: `${patientName} requested ${when} (${appointment.appointmentNumber}).`,
      type: 'appointment',
    })
    storageService
      .getAll('users')
      .filter((u) => u.role === 'receptionist' && u.status === 'active')
      .forEach((u) =>
        notificationService.notify({
          userId: u.id,
          title: 'Appointment awaiting confirmation',
          message: `${patientName} booked ${doctor.fullName} for ${when} (${appointment.appointmentNumber}).`,
          type: 'appointment',
        }),
      )
    return appointment
  },

  async updateStatus(id: string, status: AppointmentStatus) {
    const current = storageService.getById('appointments', id)
    if (!current) throw new ServiceError('Appointment not found', 'NOT_FOUND')
    const paymentStatus: PaymentStatus | undefined =
      status === 'cancelled' && current.paymentStatus === 'paid' ? 'refunded' : undefined
    const updated = await repo.update(id, {
      status,
      ...(paymentStatus ? { paymentStatus } : {}),
      updatedAt: new Date().toISOString(),
    })
    const title = STATUS_MESSAGES[status]
    if (title) notifyParties(updated, title, `${title}: ${describe(updated)}.`, { toDoctor: status === 'cancelled' })
    return updated
  },

  /**
   * Cancels an appointment on the patient's behalf. Only the patient who owns it may
   * cancel, and only while it is still pending or confirmed.
   */
  async cancelByPatient(id: string, patientId: string) {
    const current = storageService.getById('appointments', id)
    if (!current || current.patientId !== patientId) throw new ServiceError('Appointment not found', 'NOT_FOUND')
    if (!canPatientCancel(current)) {
      throw new ServiceError('Only pending or confirmed appointments can be cancelled.', 'CONFLICT')
    }
    const updated = await repo.update(id, {
      status: 'cancelled',
      ...(current.paymentStatus === 'paid' ? { paymentStatus: 'refunded' as const } : {}),
      updatedAt: new Date().toISOString(),
    })

    const patient = storageService.getById('patients', patientId)
    const doctor = storageService.getById('doctors', updated.doctorId)
    const patientName = (patient && storageService.getById('users', patient.userId)?.fullName) ?? 'A patient'
    if (patient) {
      notificationService.notify({
        userId: patient.userId,
        title: 'Appointment cancelled',
        message: `You cancelled ${updated.appointmentNumber} with ${doctor?.fullName ?? 'your doctor'} on ${describe(updated)}.`,
        type: 'appointment',
      })
    }
    if (doctor) {
      notificationService.notify({
        userId: doctor.userId,
        title: 'Appointment cancelled by patient',
        message: `${patientName} cancelled ${updated.appointmentNumber} on ${describe(updated)}. The slot is free again.`,
        type: 'appointment',
      })
    }
    return updated
  },

  async reschedule(id: string, appointmentDate: string, startTime: string) {
    await delay()
    // Check and write in one synchronous step, as in `create`.
    const current = storageService.getById('appointments', id)
    if (!current) throw new ServiceError('Appointment not found', 'NOT_FOUND')
    const slot = checkSlotBookable({ ...current, appointmentDate, startTime }, id)
    const updated = storageService.update('appointments', id, {
      appointmentDate,
      startTime: slot.startTime,
      endTime: slot.endTime,
      status: 'pending',
      updatedAt: new Date().toISOString(),
    })!
    notifyParties(updated, 'Appointment rescheduled', `Your appointment was moved to ${describe(updated)}.`)
    return updated
  },

  updatePayment: (id: string, paymentStatus: PaymentStatus) =>
    repo.update(id, { paymentStatus, updatedAt: new Date().toISOString() }),

  /** General-purpose update. Use `reschedule` to change the date or time safely. */
  update: (id: string, patch: Partial<Pick<Appointment, 'reason' | 'status' | 'paymentStatus'>>) =>
    repo.update(id, { ...patch, updatedAt: new Date().toISOString() }),

  delete: repo.delete,

}
