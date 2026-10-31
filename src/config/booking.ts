/** Rules that shape what patients can book. */
export const BOOKING_CONFIG = {
  /** How many days ahead (today included) appointments can be booked. */
  horizonDays: 30,
  reasonMinLength: 5,
  reasonMaxLength: 500,
  notesMaxLength: 500,
} as const
