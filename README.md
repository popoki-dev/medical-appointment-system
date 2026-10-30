# MediBook — Hospital Appointment System

A frontend-only hospital appointment booking app built with React, TypeScript, Vite, Tailwind CSS and shadcn/ui.
All data is mock data persisted to `localStorage`; there is no backend.

## Getting started

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build
npm run typecheck
```

Sign in at `/login`. Every demo account uses the password `Demo123!`, and the login page
can sign you in to any of them in one click:

| Role          | Email                      |
| ------------- | -------------------------- |
| Administrator | admin@hospital.demo        |
| Receptionist  | receptionist@hospital.demo |
| Doctor        | doctor@hospital.demo       |
| Patient       | patient@hospital.demo      |

New patients can create an account at `/register`.

To restore the original dataset, choose **Reset demo data** from the user menu in any portal.

## Project structure

```
src/
├── app/               App root and providers
├── routes/            Router config, ProtectedRoute / GuestRoute, lazy page loader
├── layouts/           PublicLayout + Patient/Doctor/Receptionist/Admin layouts
├── pages/             Route screens, grouped by area (public, patient, doctor, …)
├── components/
│   ├── ui/            shadcn/ui primitives (button, dialog, select, calendar, …)
│   ├── common/        App-level reusable components (DataTable, StatCard, …)
│   ├── layout/        DashboardShell, sidebar, breadcrumbs, notification & user menus
│   ├── charts/        Recharts wrappers with shared theme
│   └── appointments/  Domain-specific building blocks
├── contexts/          AuthContext
├── hooks/             useAuth, useAsync, useAppointments, useDebounce, usePagination, …
├── services/          storageService, generic repository and domain services
├── data/              mockData.ts — the single seed dataset
├── config/            App config, route constants, navigation, status metadata
├── lib/               utils, date/format helpers, storage, toast, Zod schemas
└── types/             TypeScript interfaces for every entity
```

## Data layer

All screens share one dataset, stored in localStorage under `medibook:db:*`.

| Collection        | Seeded records                                  |
| ----------------- | ----------------------------------------------- |
| `users`           | 35 (20 patients, 10 doctors, 3 receptionists, 2 admins) |
| `patients`        | 20                                              |
| `departments`     | 4                                               |
| `doctors`         | 10                                              |
| `doctorSchedules` | 42 (every doctor's working days)                |
| `appointments`    | 34, from three weeks ago to two weeks ahead     |
| `notifications`   | 17                                              |

```
Screen ──> hook (useAppointments, useDoctors, …)
             │  re-fetches automatically when watched collections change
             ▼
         domain service (appointmentService, doctorService, …)
             │  business rules: availability, clashes, notifications, guards
             ▼
         repository   getAll · getById · create · update · delete
             │  unique ids, duplicate checks, simulated latency
             ▼
         storageService ──> localStorage
             seeds on first launch · emits change events · reset()
```

- **Seeding.** `storageService.initialize()` runs in `main.tsx`. On first launch, or when
  `DB_VERSION` changes, it writes `createMockDatabase()` from `src/data/mockData.ts`.
  Appointment dates are generated relative to the day of seeding.
- **One source of truth.** Screens never import seed data. They read through the hooks,
  which subscribe to `storageService`. A booking made in one portal shows up in the
  others straight away, in the same tab or in another tab.
- **Integrity.** Every create and update rejects duplicate ids, emails, patient, doctor
  and appointment numbers, department names and per-day schedules. Bookings must
  fit the doctor's schedule (breaks excluded) and must not clash for the doctor or the patient.
  Deletes are refused while other records still depend on them.
- **Reset.** `storageService.reset()` restores the original dataset and keeps the session.
- **Demo-only credentials.** Passwords are stored in plain text for the demo.

## Public website

| Route              | Page                                                                                   |
| ------------------ | -------------------------------------------------------------------------------------- |
| `/`                | Home: hero, live statistics, departments, top-rated doctors, why choose us, hospital info |
| `/doctors`         | Doctor directory with name search and department, specialization and availability filters |
| `/doctors/:id`     | Doctor profile: biography, qualifications, languages, fee, weekly schedule, open slots  |
| `/departments`     | Department cards with doctor counts and links to each department's doctors              |
| `/about`           | Hospital introduction, values and milestones                                            |
| `/contact`         | Address, phone, email, opening hours and a map placeholder (no contact form)            |

Everything on these pages comes from the shared mock data. The only exception is the fictional hospital details
in `src/config/hospital.ts`. Directory filters are kept in the URL (for example
`/doctors?department=dep_001&availability=today`), so the department cards link to a filtered list.

Every "Book" button opens the booking flow at `/patient/book`, filled in from the button:
`ROUTES.patient.bookWith({ departmentId, doctorId, date, time })`. Signed-out visitors sign in or register
first and then return to the booking with their choice kept. The flow checks the doctor's live free slots,
records the request as `pending`, and notifies the doctor and the patient.

## Authentication and access control

Authentication is a frontend-only mock. It is not secure and must not be used for real data.

- **Sign-in** checks the email and password against the `users` collection. Only `active`
  accounts can sign in. The session (`medibook:session`) stores the user id and an expiry
  (8 hours), so you stay signed in after a refresh. Signing in or out applies to every open tab.
- **Registration** (`/register`) creates a `users` record and a `patients` record, signs the new
  patient in and opens the patient dashboard. Blood group, address and emergency contact stay empty
  until the patient completes their profile.
- **Forgot password** (`/forgot-password`) is a mock reset flow. Because no email is sent, the page
  shows the 6-digit code. The code expires after 15 minutes or 5 wrong attempts.
- **Remember me** is shown on the login page but has no effect yet.

Each role has its own portal:

| Role          | Pages                                                                                       |
| ------------- | ------------------------------------------------------------------------------------------- |
| Patient       | Dashboard, Find a Doctor, Book Appointment (built), My Appointments, Profile Settings       |
| Doctor        | Dashboard, My Appointments, Appointment Details, My Schedule, Profile Settings              |
| Receptionist  | Dashboard, Patients, Appointments, Doctor Availability, Profile Settings                    |
| Administrator | Dashboard, Users, Doctors, Departments, Patients, Appointments, Reports, System Settings     |

`src/lib/permissions.ts` lists each role's permissions (`ROLE_PERMISSIONS`) and the permission
every page needs (`ROUTE_PERMISSIONS`). It exports `hasPermission`, `hasRole`, `canAccess` and
`canAccessPath`. `<ProtectedRoute roles={…} permission={…}>` guards each portal and each page:

- If you are signed out, it sends you to `/login`. After you sign in it returns you to the page
  you asked for, if your role may open it.
- If your role may not open the page, it sends you to your own dashboard with a notice.

`<GuestRoute>` sends signed-in users away from the login, registration and reset pages.

## Patient portal

Every patient page reads only the signed-in patient's own records (`useCurrentPatient()`,
then queries filtered by that patient's id).

| Page                | Route                    | What it does |
| ------------------- | ------------------------ | ------------ |
| Dashboard           | `/patient/dashboard`     | Welcome, patient ID, upcoming/completed/cancelled counts, next appointment with view and cancel, recent appointments, quick actions, notifications, profile summary |
| Find Doctors        | `/patient/doctors`       | Active doctors with search and department filter, each with a Book link |
| My Appointments     | `/patient/appointments`  | Tabs (All, Upcoming, Pending, Confirmed, Completed, Cancelled), search, date range and status filters (kept in the URL), details modal, cancel |
| Medical Information | `/patient/medical`       | Basic profile details and clearly labelled fictional sample data. Not a health record |
| Notifications       | `/patient/notifications` | All notifications, filters, mark one or all as read |
| My Profile          | `/patient/profile`       | Edit name, phone, date of birth, gender, address and emergency contact |
| Settings            | `/patient/settings`      | Change password, sign out |

**Cancellation.** `appointmentService.cancelByPatient(id, patientId)` only accepts the
patient's own appointments while they are `pending` or `confirmed`. The UI asks for
confirmation first. Cancelling sets the status to `cancelled` (a paid visit becomes
`refunded`), frees the slot and notifies both the patient and the doctor. Every dashboard
watches the `appointments` collection, so the change shows everywhere at once, including in other tabs.

### Backend readiness

Pages and hooks only call `src/services/*`. To integrate a real API, re-implement the
repository and service methods with `fetch`/axios. Their signatures stay the same.

### Reusable components

`DataTable`, `SearchInput`, `FilterDropdown`, `StatusBadge`, `StatCard`, `PageHeader`,
`EmptyState`, `LoadingState`, `ConfirmationDialog`, `DatePicker`, `TimeSlotPicker`,
`FormField`, `Pagination`, `Modal` and `toast` are exported from `@/components/common`.
They are all demonstrated live at **Admin → UI Kit** (`/admin/ui-kit`).

## Status

The design system, layouts, reusable components, data layer, mock authentication, role-based
routing, role dashboards and the patient portal are in place. Every other module route is wired up with a "coming soon" placeholder,
ready for its screens to be built.
