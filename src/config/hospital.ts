/**
 * Fictional hospital details shown on the public website. Every name, number and
 * address here is invented for the demo.
 */
export const HOSPITAL = {
  name: 'MediBook General Hospital',
  shortName: 'MediBook',
  founded: 1987,
  address: {
    line1: '120 Harbor Avenue',
    line2: 'Springfield, IL 62701',
    country: 'United States',
  },
  phone: '+1 (555) 010-2000',
  emergencyPhone: '+1 (555) 010-2911',
  email: 'hello@hospital.demo',
  appointmentsEmail: 'appointments@hospital.demo',
  /** Outpatient clinic hours. The emergency department is always open. */
  openingHours: [
    { days: 'Monday – Friday', hours: '8:00 AM – 8:00 PM' },
    { days: 'Saturday', hours: '9:00 AM – 3:00 PM' },
    { days: 'Sunday & public holidays', hours: 'Closed' },
  ],
  emergencyHours: 'Open 24 hours, 7 days a week',
  parking: 'Free visitor parking in the Harbor Avenue garage (Levels 1–3).',
  transit: 'Bus routes 4 and 12 stop at Harbor Ave & 2nd St, a two-minute walk away.',
  /** Figures that do not come from the appointment data. */
  facts: {
    beds: 320,
    staff: 1200,
    accreditation: 'Accredited by the (fictional) National Council for Hospital Quality',
  },
} as const

export const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, '')}`
