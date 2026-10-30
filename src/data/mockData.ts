/**
 * The single source of seed data for the whole application.
 *
 * `createMockDatabase()` builds the initial dataset; `storageService` writes it to
 * localStorage on first launch and again whenever the demo data is reset. No screen
 * should import seed records directly — read through the services instead.
 */
import { addDays, getDay, subDays, subHours, subMinutes } from 'date-fns'
import { buildScheduleSlots } from '@/lib/schedule'
import { toDateKey } from '@/lib/date'
import type {
  Appointment,
  AppointmentStatus,
  AppNotification,
  BloodGroup,
  Database,
  DayOfWeek,
  Department,
  Doctor,
  DoctorSchedule,
  Gender,
  Patient,
  PaymentStatus,
  User,
  UserRole,
} from '@/types'

/** Every seeded account uses this password. Demo only. */
export const DEMO_PASSWORD = 'Demo123!'

/** The demo login for each role, shown on the login page. */
export const DEMO_ACCOUNTS: Record<UserRole, string> = {
  admin: 'admin@hospital.demo',
  receptionist: 'receptionist@hospital.demo',
  doctor: 'doctor@hospital.demo',
  patient: 'patient@hospital.demo',
}

const pad = (n: number, width = 3) => String(n).padStart(width, '0')
const SEED_CREATED_AT = '2025-01-06T09:00:00.000Z'

// ---------------------------------------------------------------------------
// Departments
// ---------------------------------------------------------------------------

const departments: Department[] = [
  {
    id: 'dep_001',
    name: 'Cardiology',
    description: 'Diagnosis and treatment of heart and blood-vessel conditions, from hypertension to heart failure.',
    icon: 'HeartPulse',
    image: null,
    status: 'active',
  },
  {
    id: 'dep_002',
    name: 'Neurology',
    description: 'Care for disorders of the brain, spinal cord and nerves, including migraine, epilepsy and stroke.',
    icon: 'Brain',
    image: null,
    status: 'active',
  },
  {
    id: 'dep_003',
    name: 'Pediatrics',
    description: 'Preventive and acute care for infants, children and adolescents.',
    icon: 'Baby',
    image: null,
    status: 'active',
  },
  {
    id: 'dep_004',
    name: 'Orthopedics',
    description: 'Bones, joints, ligaments and sports injuries — from physiotherapy referrals to joint replacement.',
    icon: 'Bone',
    image: null,
    status: 'active',
  },
]

// ---------------------------------------------------------------------------
// Users (doctors, patients, receptionists, admins)
// ---------------------------------------------------------------------------

type DoctorSeed = [
  fullName: string,
  email: string,
  departmentId: string,
  specialization: string,
  qualification: string,
  experience: number,
  fee: number,
  languages: string[],
  rating: number,
  biography: string,
]

const DOCTORS: DoctorSeed[] = [
  ['Dr. James Wilson', DEMO_ACCOUNTS.doctor, 'dep_001', 'Interventional Cardiologist', 'MD, FACC', 14, 150, ['English'], 4.9,
    'Specialises in coronary artery disease and minimally invasive cardiac procedures.'],
  ['Dr. Amara Okonkwo', 'a.okonkwo@hospital.demo', 'dep_001', 'Cardiac Electrophysiologist', 'MD, FHRS', 11, 165, ['English', 'Igbo'], 4.8,
    'Treats heart-rhythm disorders including atrial fibrillation, and manages pacemaker patients.'],
  ['Dr. Henrik Larsen', 'h.larsen@hospital.demo', 'dep_001', 'Preventive Cardiologist', 'MD, MPH', 8, 130, ['English', 'Danish'], 4.7,
    'Focuses on cholesterol, blood pressure and lifestyle programmes to prevent heart disease.'],
  ['Dr. Aisha Rahman', 'a.rahman@hospital.demo', 'dep_002', 'Neurologist', 'MD, PhD', 12, 170, ['English', 'Bengali', 'Hindi'], 4.8,
    'Sub-specialises in migraine, epilepsy and neurodegenerative disorders.'],
  ['Dr. Mateo Alvarez', 'm.alvarez@hospital.demo', 'dep_002', 'Stroke & Vascular Neurologist', 'MD', 9, 160, ['English', 'Spanish'], 4.6,
    'Leads the stroke-prevention clinic and post-stroke rehabilitation follow-up.'],
  ['Dr. Yuki Tanaka', 'y.tanaka@hospital.demo', 'dep_002', 'Neuromuscular Specialist', 'MD, FAAN', 15, 175, ['English', 'Japanese'], 4.9,
    'Diagnoses and manages neuropathy, myasthenia gravis and muscular dystrophies.'],
  ['Dr. Michael Chen', 'm.chen@hospital.demo', 'dep_003', 'General Pediatrician', 'MD, FAAP', 10, 110, ['English', 'Mandarin'], 4.9,
    'Gentle, family-centred care from newborn check-ups through adolescence.'],
  ['Dr. Sofia Rossi', 's.rossi@hospital.demo', 'dep_003', 'Pediatric Allergist', 'MD', 7, 120, ['English', 'Italian'], 4.7,
    'Helps children with asthma, eczema and food allergies live full, active lives.'],
  ['Dr. Laura Bennett', 'l.bennett@hospital.demo', 'dep_004', 'Orthopedic Surgeon', 'MD, FAAOS', 16, 180, ['English'], 4.7,
    'Performs hip and knee replacements and complex fracture repair.'],
  ['Dr. Kwame Mensah', 'k.mensah@hospital.demo', 'dep_004', 'Sports Medicine Physician', 'MD, CAQSM', 6, 140, ['English', 'French', 'Twi'], 4.8,
    'Treats sports injuries and designs return-to-play rehabilitation plans.'],
]

type PatientSeed = [
  fullName: string,
  email: string,
  dateOfBirth: string,
  gender: Gender,
  bloodGroup: BloodGroup,
  address: string,
  emergency: [name: string, relationship: string, phone: string],
  medicalNotes?: string,
]

const PATIENTS: PatientSeed[] = [
  ['Emily Carter', DEMO_ACCOUNTS.patient, '1990-06-14', 'female', 'O+', '42 Maple Street, Springfield, IL 62704', ['Daniel Carter', 'Spouse', '+1 (555) 210-0001'], 'Penicillin allergy.'],
  ['Marcus Johnson', 'marcus.johnson@example.com', '1984-02-03', 'male', 'A+', '718 Oak Avenue, Springfield, IL 62702', ['Tanya Johnson', 'Sister', '+1 (555) 210-0002'], 'Type 2 diabetes, metformin.'],
  ['Hannah Lee', 'hannah.lee@example.com', '2016-09-21', 'female', 'B+', '9 Birch Lane, Chatham, IL 62629', ['Grace Lee', 'Mother', '+1 (555) 210-0003'], 'Mild asthma.'],
  ['Omar Haddad', 'omar.haddad@example.com', '1972-11-30', 'male', 'AB-', '305 Cedar Court, Springfield, IL 62711', ['Leila Haddad', 'Spouse', '+1 (555) 210-0004']],
  ['Grace Kim', 'grace.kim@example.com', '1995-01-09', 'female', 'O-', '1220 Elm Drive, Rochester, IL 62563', ['Joon Kim', 'Father', '+1 (555) 210-0005']],
  ['Lucas Silva', 'lucas.silva@example.com', '1988-04-17', 'male', 'A-', '57 Willow Way, Springfield, IL 62703', ['Ana Silva', 'Spouse', '+1 (555) 210-0006'], 'ACL reconstruction 2023.'],
  ['Zara Ahmed', 'zara.ahmed@example.com', '2001-12-25', 'female', 'B-', '88 Pine Street, Sherman, IL 62684', ['Farid Ahmed', 'Father', '+1 (555) 210-0007']],
  ['Thomas Wright', 'thomas.wright@example.com', '1958-07-08', 'male', 'O+', '14 Aspen Road, Springfield, IL 62707', ['Margaret Wright', 'Spouse', '+1 (555) 210-0008'], 'Hypertension, atrial fibrillation.'],
  ['Priya Patel', 'priya.patel@example.com', '1992-03-28', 'female', 'A+', '603 Spruce Avenue, Springfield, IL 62704', ['Raj Patel', 'Brother', '+1 (555) 210-0009']],
  ['Noah Williams', 'noah.williams@example.com', '2019-05-11', 'male', 'O+', '21 Hawthorn Close, Chatham, IL 62629', ['Olivia Williams', 'Mother', '+1 (555) 210-0010'], 'Peanut allergy.'],
  ['Isabella Garcia', 'isabella.garcia@example.com', '1979-08-02', 'female', 'B+', '450 Chestnut Street, Springfield, IL 62701', ['Carlos Garcia', 'Spouse', '+1 (555) 210-0011'], 'Chronic migraine.'],
  ['Ethan Brown', 'ethan.brown@example.com', '1999-10-19', 'male', 'AB+', '77 Poplar Lane, Riverton, IL 62561', ['Susan Brown', 'Mother', '+1 (555) 210-0012']],
  ['Mia Nguyen', 'mia.nguyen@example.com', '1986-12-04', 'female', 'O-', '132 Magnolia Drive, Springfield, IL 62712', ['Bao Nguyen', 'Spouse', '+1 (555) 210-0013']],
  ['Samuel Osei', 'samuel.osei@example.com', '1965-02-15', 'male', 'A-', '9 Sycamore Street, Springfield, IL 62702', ['Abena Osei', 'Daughter', '+1 (555) 210-0014'], 'Post-stroke follow-up.'],
  ['Chloe Martin', 'chloe.martin@example.com', '2012-07-30', 'female', 'B+', '260 Linden Avenue, Sherman, IL 62684', ['Julien Martin', 'Father', '+1 (555) 210-0015']],
  ['Daniel Novak', 'daniel.novak@example.com', '1975-09-23', 'male', 'O+', '18 Juniper Court, Springfield, IL 62704', ['Eva Novak', 'Spouse', '+1 (555) 210-0016']],
  ['Aaliyah Brooks', 'aaliyah.brooks@example.com', '1997-04-06', 'female', 'A+', '391 Redwood Road, Springfield, IL 62703', ['Marcus Brooks', 'Brother', '+1 (555) 210-0017']],
  ['Benjamin Cohen', 'benjamin.cohen@example.com', '1969-01-27', 'male', 'AB-', '45 Walnut Street, Rochester, IL 62563', ['Rachel Cohen', 'Spouse', '+1 (555) 210-0018'], 'Peripheral neuropathy.'],
  ['Sophie Dubois', 'sophie.dubois@example.com', '1983-11-12', 'female', 'O+', '612 Beech Avenue, Springfield, IL 62711', ['Luc Dubois', 'Spouse', '+1 (555) 210-0019']],
  ['Ryan Murphy', 'ryan.murphy@example.com', '2005-06-01', 'male', 'B-', '83 Alder Lane, Chatham, IL 62629', ['Karen Murphy', 'Mother', '+1 (555) 210-0020'], 'Recurring ankle sprain.'],
]

const RECEPTIONISTS: [string, string][] = [
  ['Sofia Martinez', DEMO_ACCOUNTS.receptionist],
  ['Liam O’Connor', 'l.oconnor@hospital.demo'],
  ['Mei Lin', 'm.lin@hospital.demo'],
]

const ADMINS: [string, string][] = [
  ['Daniel Okafor', DEMO_ACCOUNTS.admin],
  ['Rebecca Stein', 'r.stein@hospital.demo'],
]

function buildPeople() {
  const users: User[] = []
  const doctors: Doctor[] = []
  const patients: Patient[] = []
  let userSeq = 0
  const addUser = (fullName: string, email: string, role: UserRole, phone: string): User => {
    const user: User = {
      id: `usr_${pad(++userSeq)}`,
      fullName,
      email,
      password: DEMO_PASSWORD,
      phone,
      role,
      profileImage: null,
      status: 'active',
      createdAt: SEED_CREATED_AT,
    }
    users.push(user)
    return user
  }

  ADMINS.forEach(([name, email], i) => addUser(name, email, 'admin', `+1 (555) 500-${pad(i + 1, 4)}`))
  RECEPTIONISTS.forEach(([name, email], i) => addUser(name, email, 'receptionist', `+1 (555) 400-${pad(i + 1, 4)}`))

  DOCTORS.forEach(([fullName, email, departmentId, specialization, qualification, experience, fee, languages, rating, biography], i) => {
    const user = addUser(fullName, email, 'doctor', `+1 (555) 300-${pad(i + 1, 4)}`)
    doctors.push({
      id: `doc_${pad(i + 1)}`,
      userId: user.id,
      doctorNumber: `DOC-${1001 + i}`,
      fullName,
      departmentId,
      specialization,
      qualification,
      experience,
      consultationFee: fee,
      languages,
      biography,
      profileImage: null,
      rating,
      // One doctor on leave shows the status in the UI.
      status: i === 5 ? 'on-leave' : 'active',
    })
  })

  PATIENTS.forEach(([fullName, email, dateOfBirth, gender, bloodGroup, address, [ecName, ecRel, ecPhone], medicalNotes], i) => {
    const user = addUser(fullName, email, 'patient', `+1 (555) 200-${pad(i + 1, 4)}`)
    patients.push({
      id: `pat_${pad(i + 1)}`,
      userId: user.id,
      patientNumber: `PAT-${pad(i + 1, 5)}`,
      dateOfBirth,
      gender,
      bloodGroup,
      address,
      emergencyContact: { name: ecName, relationship: ecRel, phone: ecPhone },
      ...(medicalNotes ? { medicalNotes } : {}),
    })
  })

  return { users, doctors, patients }
}

// ---------------------------------------------------------------------------
// Doctor schedules
// ---------------------------------------------------------------------------

type SchedulePattern = { days: DayOfWeek[]; start: string; end: string; slot: number; break?: [string, string]; offDay?: DayOfWeek }

/** One working pattern per doctor (same order as DOCTORS). */
const SCHEDULE_PATTERNS: SchedulePattern[] = [
  { days: [1, 2, 3, 4, 5], start: '09:00', end: '17:00', slot: 30, break: ['12:30', '13:30'] },
  { days: [1, 2, 3, 4], start: '08:00', end: '14:00', slot: 30, break: ['11:00', '11:30'] },
  { days: [2, 3, 4, 5, 6], start: '10:00', end: '18:00', slot: 30, break: ['13:00', '14:00'] },
  { days: [1, 2, 3, 4, 5], start: '09:00', end: '16:00', slot: 30, break: ['12:00', '13:00'], offDay: 3 },
  { days: [1, 3, 5], start: '08:30', end: '15:30', slot: 30, break: ['12:00', '12:30'] },
  { days: [2, 4], start: '09:00', end: '17:00', slot: 45, break: ['12:45', '13:30'] },
  { days: [1, 2, 3, 4, 5, 6], start: '08:00', end: '14:00', slot: 20, break: ['11:00', '11:20'] },
  { days: [1, 2, 4, 5], start: '12:00', end: '19:00', slot: 20, break: ['15:00', '15:40'] },
  { days: [1, 3, 4], start: '09:00', end: '15:00', slot: 30, break: ['12:00', '13:00'] },
  { days: [1, 2, 3, 4, 5], start: '10:00', end: '18:00', slot: 30, break: ['13:30', '14:00'] },
]

function buildSchedules(doctors: Doctor[]): DoctorSchedule[] {
  let seq = 0
  return doctors.flatMap((doctor, i) => {
    const p = SCHEDULE_PATTERNS[i]
    return p.days.map((dayOfWeek) => ({
      id: `sch_${pad(++seq)}`,
      doctorId: doctor.id,
      dayOfWeek,
      startTime: p.start,
      endTime: p.end,
      slotDuration: p.slot,
      breakStart: p.break?.[0] ?? null,
      breakEnd: p.break?.[1] ?? null,
      isAvailable: p.offDay !== dayOfWeek,
    }))
  })
}

// ---------------------------------------------------------------------------
// Appointments
// ---------------------------------------------------------------------------

const REASONS = [
  'Routine check-up',
  'Chest discomfort when climbing stairs',
  'Recurring headaches',
  'Follow-up on blood test results',
  'Knee pain after running',
  'Palpitations at night',
  'Annual physical examination',
  'Medication review',
  'Persistent lower back pain',
  'Numbness in fingers',
  'Child vaccination schedule',
  'Seasonal allergy flare-up',
]

const PAST_STATUSES: AppointmentStatus[] = ['completed', 'completed', 'cancelled', 'completed', 'no-show', 'completed', 'rejected']
const TODAY_STATUSES: AppointmentStatus[] = ['completed', 'confirmed', 'confirmed', 'pending', 'confirmed']
const FUTURE_STATUSES: AppointmentStatus[] = ['confirmed', 'pending', 'confirmed', 'pending', 'cancelled']

function paymentFor(status: AppointmentStatus, n: number): PaymentStatus {
  if (status === 'completed') return 'paid'
  if (status === 'confirmed') return n % 2 === 0 ? 'paid' : 'unpaid'
  if (status === 'cancelled' || status === 'rejected') return n % 3 === 0 ? 'refunded' : 'unpaid'
  return 'unpaid'
}

/**
 * Spreads appointments from three weeks ago to two weeks ahead of `today`, only on
 * days and slots each doctor actually works, with no double-bookings. The demo
 * patient and demo doctor are guaranteed a steady share so their dashboards are full.
 */
function buildAppointments(today: Date, doctors: Doctor[], schedules: DoctorSchedule[], patients: Patient[]): Appointment[] {
  const appointments: Appointment[] = []
  const taken = new Set<string>()
  let n = 0

  for (let offset = -21; offset <= 14; offset++) {
    const day = addDays(today, offset)
    const date = toDateKey(day)
    const weekday = getDay(day)
    const perDay = offset === 0 ? 5 : 1 + (Math.abs(offset) % 2)

    for (let k = 0; k < perDay; k++) {
      // The first booking of every other day (and of today) goes to the demo doctor.
      const doctor =
        k === 0 && offset % 2 === 0 ? doctors[0] : doctors[(Math.abs(offset) * 3 + k * 7) % doctors.length]
      if (doctor.status !== 'active') continue
      const schedule = schedules.find((s) => s.doctorId === doctor.id && s.dayOfWeek === weekday && s.isAvailable)
      if (!schedule) continue
      const slots = buildScheduleSlots(schedule)
      const first = (Math.abs(offset) + k * 3) % slots.length
      const slot = [...slots.slice(first), ...slots.slice(0, first)].find(
        (s) => !taken.has(`${doctor.id}|${date}|${s.startTime}`),
      )
      if (!slot) continue
      taken.add(`${doctor.id}|${date}|${slot.startTime}`)

      const patient = n % 4 === 0 ? patients[0] : patients[(n * 7) % patients.length]
      const statuses = offset < 0 ? PAST_STATUSES : offset === 0 ? TODAY_STATUSES : FUTURE_STATUSES
      const status = statuses[(offset === 0 ? k : n) % statuses.length]
      // Booked 5–13 days ahead of the visit, but never later than "now".
      const bookedAt = subDays(day, 5 + (n % 9))
      const createdAt = (bookedAt > today ? subHours(today, 2 + n) : bookedAt).toISOString()
      n++
      appointments.push({
        id: `apt_${pad(n)}`,
        appointmentNumber: `APT-${pad(n, 6)}`,
        patientId: patient.id,
        doctorId: doctor.id,
        departmentId: doctor.departmentId,
        appointmentDate: date,
        startTime: slot.startTime,
        endTime: slot.endTime,
        reason: REASONS[n % REASONS.length],
        status,
        paymentStatus: paymentFor(status, n),
        createdAt,
        updatedAt: offset < 0 && day < today ? day.toISOString() : createdAt,
      })
    }
  }
  return appointments
}

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

function buildNotifications(now: Date, users: User[]): AppNotification[] {
  const byEmail = (email: string) => users.find((u) => u.email === email)!.id
  const patientId = byEmail(DEMO_ACCOUNTS.patient)
  const doctorId = byEmail(DEMO_ACCOUNTS.doctor)
  const receptionId = byEmail(DEMO_ACCOUNTS.receptionist)
  const adminId = byEmail(DEMO_ACCOUNTS.admin)
  const secondAdminId = byEmail('r.stein@hospital.demo')
  const otherPatientId = byEmail('marcus.johnson@example.com')

  const rows: [userId: string, title: string, message: string, type: AppNotification['type'], isRead: boolean, createdAt: Date][] = [
    [patientId, 'Appointment confirmed', 'Your appointment with Dr. James Wilson has been confirmed.', 'appointment', false, subMinutes(now, 12)],
    [patientId, 'Upcoming appointment', 'Reminder: you have an appointment tomorrow. Please arrive 15 minutes early.', 'reminder', false, subHours(now, 3)],
    [patientId, 'Payment received', 'We received your payment for your last consultation. Thank you.', 'system', true, subHours(now, 30)],
    [patientId, 'Lab results ready', 'Your recent blood test results are available to review with your doctor.', 'alert', true, subDays(now, 3)],
    [doctorId, 'New appointment request', 'Emily Carter requested a consultation. Review it in your appointments.', 'appointment', false, subMinutes(now, 25)],
    [doctorId, 'Schedule updated', 'Your Friday clinic hours were updated by the administrator.', 'system', false, subHours(now, 5)],
    [doctorId, 'Patient cancelled', 'Thomas Wright cancelled his follow-up appointment.', 'appointment', true, subDays(now, 1)],
    [receptionId, 'Patients waiting', 'Three patients have arrived early for their appointments.', 'alert', false, subMinutes(now, 8)],
    [receptionId, 'New online booking', 'A new appointment was booked online for Cardiology.', 'appointment', false, subHours(now, 2)],
    [receptionId, 'Doctor on leave', 'Dr. Yuki Tanaka is on leave. Please reschedule affected appointments.', 'alert', true, subDays(now, 2)],
    [adminId, 'Weekly report ready', 'The weekly appointments report has been generated.', 'system', false, subHours(now, 1)],
    [adminId, 'New staff account', 'A receptionist account was created for Mei Lin.', 'system', false, subHours(now, 20)],
    [adminId, 'High no-show rate', 'No-shows in Orthopedics rose above 10% this week.', 'alert', true, subDays(now, 2)],
    [secondAdminId, 'Department updated', 'The Pediatrics department description was updated.', 'system', false, subHours(now, 6)],
    [secondAdminId, 'Scheduled maintenance', 'System maintenance is planned for Sunday 2:00–3:00 AM.', 'system', true, subDays(now, 4)],
    [otherPatientId, 'Appointment reminder', 'You have an appointment with Dr. Aisha Rahman next week.', 'reminder', false, subHours(now, 9)],
    [otherPatientId, 'Appointment rescheduled', 'Your appointment has been moved to a new time. Please check the details.', 'appointment', true, subDays(now, 5)],
  ]

  return rows.map(([userId, title, message, type, isRead, createdAt], i) => ({
    id: `ntf_${pad(i + 1)}`,
    userId,
    title,
    message,
    type,
    isRead,
    createdAt: createdAt.toISOString(),
  }))
}

// ---------------------------------------------------------------------------

/** Builds a fresh copy of the complete demo dataset, with dates relative to `now`. */
export function createMockDatabase(now = new Date()): Database {
  const { users, doctors, patients } = buildPeople()
  const doctorSchedules = buildSchedules(doctors)
  return {
    users,
    patients,
    departments: departments.map((d) => ({ ...d })),
    doctors,
    doctorSchedules,
    appointments: buildAppointments(now, doctors, doctorSchedules, patients),
    notifications: buildNotifications(now, users),
  }
}
