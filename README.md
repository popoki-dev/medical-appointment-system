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

Sign in from `/login` with a one-click demo role, or with these credentials (password `password123`):

| Role         | Email                      |
| ------------ | -------------------------- |
| Patient      | patient@medibook.example   |
| Doctor       | doctor@medibook.example    |
| Receptionist | reception@medibook.example |
| Admin        | admin@medibook.example     |

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

### Backend readiness

Pages and hooks only call `src/services/*`. To integrate a real API, re-implement the
repository and service methods with `fetch`/axios. Their signatures stay the same.

### Reusable components

`DataTable`, `SearchInput`, `FilterDropdown`, `StatusBadge`, `StatCard`, `PageHeader`,
`EmptyState`, `LoadingState`, `ConfirmationDialog`, `DatePicker`, `TimeSlotPicker`,
`FormField`, `Pagination`, `Modal` and `toast` are exported from `@/components/common`.
They are all demonstrated live at **Admin → UI Kit** (`/admin/ui-kit`).

## Status

The design system, layouts, reusable components, routing, auth guards and role dashboards
are in place. Every other module route is wired up with a "coming soon" placeholder,
ready for its screens to be built.
