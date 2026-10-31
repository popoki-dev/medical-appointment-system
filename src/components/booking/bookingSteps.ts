export const BOOKING_STEPS = [
  { key: 'department', title: 'Department' },
  { key: 'doctor', title: 'Doctor' },
  { key: 'date', title: 'Date' },
  { key: 'time', title: 'Time' },
  { key: 'details', title: 'Details' },
  { key: 'confirm', title: 'Confirm' },
] as const

/** Index into `BOOKING_STEPS`. */
export type BookingStep = 0 | 1 | 2 | 3 | 4 | 5
