import { formatDate, formatTime, toDateKey } from '@/lib/date'
import { timesOverlap } from '@/lib/schedule'
import type { Appointment, AppointmentDetails, AppointmentStatus, PaymentStatus } from '@/types'
import { createRepository, nextSequence, ServiceError } from './repository'
import { doctorService, SLOT_BLOCKING_STATUSES } from './doctorService'
import { notificationService } from './notificationService'
import { storageService } from './storageService'
import { toAuthUser } from './userService'

const repo = createRepository('appointments', {
  idPrefix: 'apt',
  unique: [{ key: (a) => a.appointmentNumber, message: 'Appointment number already in use' }],
})

const isBlocking = (status: AppointmentStatus) => (SLOT_BLOCKING_STATUSES as readonly string[]).includes(status)

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
}

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

/** Throws unless the doctor works and is free for the slot, and the patient has no clash. */
async function assertSlotBookable(
  input: Pick<Appointment, 'patientId' | 'doctorId' | 'appointmentDate' | 'startTime'>,
  excludeAppointmentId?: string,
) {
  if (input.appointmentDate < toDateKey(new Date())) throw new ServiceError('Appointments cannot be booked in the past')
  const slots = await doctorService.getAvailableSlots(input.doctorId, input.appointmentDate, { excludeAppointmentId })
  const slot = slots.find((s) => s.startTime === input.startTime)
  if (!slot) throw new ServiceError('The doctor is not available at that time')
  if (!slot.available) throw new ServiceError('This time slot has just been booked. Please choose another.', 'CONFLICT')

  const patientClash = storageService
    .getAll('appointments')
    .some(
      (a) =>
        a.id !== excludeAppointmentId &&
        a.patientId === input.patientId &&
        a.appointmentDate === input.appointmentDate &&
        isBlocking(a.status) &&
        timesOverlap(a, slot),
    )
  if (patientClash) throw new ServiceError('The patient already has an appointment at this time', 'CONFLICT')
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

  /** Books a new appointment as `pending`, after checking availability and clashes. */
  async create(input: BookAppointmentInput) {
    const patient = storageService.getById('patients', input.patientId)
    const doctor = storageService.getById('doctors', input.doctorId)
    if (!patient) throw new ServiceError('Patient not found', 'NOT_FOUND')
    if (!doctor) throw new ServiceError('Doctor not found', 'NOT_FOUND')
    if (!input.reason.trim()) throw new ServiceError('Please give a reason for the visit')

    const slot = await assertSlotBookable(input)
    const now = new Date().toISOString()
    const appointment = await repo.create({
      appointmentNumber: nextSequence(storageService.getAll('appointments').map((a) => a.appointmentNumber), 'APT-', 6),
      patientId: input.patientId,
      doctorId: input.doctorId,
      departmentId: doctor.departmentId,
      appointmentDate: input.appointmentDate,
      startTime: slot.startTime,
      endTime: slot.endTime,
      reason: input.reason.trim(),
      status: 'pending',
      paymentStatus: 'unpaid',
      createdAt: now,
      updatedAt: now,
    })

    const patientName = storageService.getById('users', patient.userId)?.fullName ?? 'A patient'
    notificationService.notify({
      userId: doctor.userId,
      title: 'New appointment request',
      message: `${patientName} requested ${describe(appointment)}.`,
      type: 'appointment',
    })
    notificationService.notify({
      userId: patient.userId,
      title: 'Appointment requested',
      message: `Your request with ${doctor.fullName} for ${describe(appointment)} was received.`,
      type: 'appointment',
    })
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

  async reschedule(id: string, appointmentDate: string, startTime: string) {
    const current = storageService.getById('appointments', id)
    if (!current) throw new ServiceError('Appointment not found', 'NOT_FOUND')
    const slot = await assertSlotBookable({ ...current, appointmentDate, startTime }, id)
    const updated = await repo.update(id, {
      appointmentDate,
      startTime: slot.startTime,
      endTime: slot.endTime,
      status: 'pending',
      updatedAt: new Date().toISOString(),
    })
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
