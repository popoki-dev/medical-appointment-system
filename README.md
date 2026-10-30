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

To reset the demo data, clear the `medibook:*` keys in localStorage.

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
├── services/          Async domain services over a localStorage "mock client"
├── data/              Seed data
├── config/            App config, route constants, navigation, status metadata
├── lib/               utils, date/format helpers, storage, toast, Zod schemas
└── types/             TypeScript interfaces for every entity
```

### Backend readiness

Pages and hooks only call `src/services/*`. Each service talks to a `LocalCollection`
(`services/mockClient.ts`) that mimics an async REST resource with simulated latency.
To integrate a real API, re-implement the service methods with `fetch`/axios. Their
signatures and the rest of the app stay unchanged.

### Reusable components

`DataTable`, `SearchInput`, `FilterDropdown`, `StatusBadge`, `StatCard`, `PageHeader`,
`EmptyState`, `LoadingState`, `ConfirmationDialog`, `DatePicker`, `TimeSlotPicker`,
`FormField`, `Pagination`, `Modal` and `toast` are exported from `@/components/common`.
They are all demonstrated live at **Admin → UI Kit** (`/admin/ui-kit`).

## Status

The design system, layouts, reusable components, routing, auth guards and role dashboards
are in place. Every other module route is wired up with a "coming soon" placeholder,
ready for its screens to be built.
