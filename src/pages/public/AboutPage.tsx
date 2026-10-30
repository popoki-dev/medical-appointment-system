import { Link } from 'react-router-dom'
import { Award, CalendarPlus, HeartHandshake, Lightbulb, ShieldCheck, Users } from 'lucide-react'
import { PageIntro, SectionHeading } from '@/components/public'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { HOSPITAL } from '@/config/hospital'
import { ROUTES } from '@/config/routes'
import { useDepartments } from '@/hooks/useDepartments'
import { useDoctors } from '@/hooks/useDoctors'
import { formatNumber } from '@/lib/format'

const VALUES = [
  { icon: HeartHandshake, title: 'Compassion', text: 'We treat every patient the way we would want our own families treated.' },
  { icon: ShieldCheck, title: 'Safety', text: 'Evidence-based protocols and constant review keep care safe at every step.' },
  { icon: Lightbulb, title: 'Innovation', text: 'Modern diagnostics and minimally invasive techniques mean faster recovery.' },
  { icon: Users, title: 'Partnership', text: 'Patients, families and clinicians decide on care plans together.' },
]

const MILESTONES = [
  { year: '1987', text: 'MediBook General opens on Harbor Avenue as a 60-bed community hospital.' },
  { year: '1998', text: 'The Cardiology department opens Springfield’s first cardiac catheterisation lab.' },
  { year: '2006', text: 'A dedicated children’s wing brings Pediatrics under one roof.' },
  { year: '2014', text: 'The Neurology stroke-prevention clinic and rapid-assessment pathway launch.' },
  { year: '2021', text: 'The new Orthopedics and sports medicine centre opens with on-site physiotherapy.' },
  { year: 'Today', text: 'Patients can book appointments with every specialist online, day or night.' },
]

export function AboutPage() {
  const { data: doctors } = useDoctors({ status: 'active' })
  const { data: departments } = useDepartments('active')
  const facts = [
    { label: 'Years of care', value: formatNumber(new Date().getFullYear() - HOSPITAL.founded) },
    { label: 'Inpatient beds', value: formatNumber(HOSPITAL.facts.beds) },
    { label: 'Staff members', value: `${formatNumber(HOSPITAL.facts.staff)}+` },
    { label: 'Specialist doctors', value: doctors ? formatNumber(doctors.length) : null },
    { label: 'Departments', value: departments ? formatNumber(departments.length) : null },
  ]

  return (
    <>
      <PageIntro
        eyebrow="About us"
        title={`Caring for Springfield since ${HOSPITAL.founded}`}
        description={`${HOSPITAL.name} is an independent, not-for-profit hospital combining specialist expertise with the personal attention of a community hospital.`}
      />

      <section className="container grid gap-10 py-14 lg:grid-cols-2 lg:items-center">
        <div className="space-y-4 text-muted-foreground">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">Our mission</h2>
          <p className="text-lg">
            To deliver exceptional, accessible care that puts people first, and to make every step from booking to recovery
            as simple and reassuring as possible.
          </p>
          <p>
            What began as a small community hospital has grown into a regional centre for cardiology, neurology, pediatrics
            and orthopedics. Our specialists consult across our outpatient clinics, while our emergency department and
            inpatient wards serve the city around the clock.
          </p>
          <p>
            We invest in modern diagnostics, continuous training and digital services like online booking, so patients
            spend less time waiting and more time getting better.
          </p>
          <div className="flex items-center gap-2 pt-2 text-sm font-medium text-foreground">
            <Award className="h-5 w-5 text-secondary" /> {HOSPITAL.facts.accreditation}
          </div>
        </div>
        <Card className="grid grid-cols-2 gap-px overflow-hidden bg-border p-0 sm:grid-cols-3">
          {facts.map((fact) => (
            <div key={fact.label} className="bg-card p-6">
              <div className="text-3xl font-semibold tracking-tight text-primary">{fact.value ?? <Skeleton className="h-9 w-14" />}</div>
              <p className="mt-1 text-sm text-muted-foreground">{fact.label}</p>
            </div>
          ))}
          <div className="flex items-center bg-gradient-to-br from-primary to-secondary p-6 text-sm font-medium text-white">
            {doctors?.length
              ? `Rated ${(doctors.reduce((sum, d) => sum + d.rating, 0) / doctors.length).toFixed(1)} / 5 by our patients`
              : 'Highly rated by our patients'}
          </div>
        </Card>
      </section>

      <section className="border-y bg-card">
        <div className="container py-14">
          <SectionHeading eyebrow="Our values" title="What guides us" />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((value) => (
              <div key={value.title} className="rounded-xl border bg-background p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <value.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-semibold">{value.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{value.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container py-14">
        <SectionHeading eyebrow="Our story" title="Milestones" />
        <ol className="relative mx-auto mt-10 max-w-2xl space-y-8 border-l-2 border-primary/20 pl-8">
          {MILESTONES.map((m) => (
            <li key={m.year} className="relative">
              <span className="absolute -left-[41px] top-1 h-4 w-4 rounded-full border-4 border-background bg-primary" aria-hidden />
              <p className="text-sm font-semibold text-primary">{m.year}</p>
              <p className="mt-1 text-muted-foreground">{m.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="container pb-16">
        <div className="flex flex-col items-start gap-4 rounded-2xl border bg-accent/50 p-8 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Meet the team behind the care</h2>
            <p className="mt-1 text-muted-foreground">Browse our specialists or book a consultation today.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link to={ROUTES.doctors}>Our doctors</Link>
            </Button>
            <Button asChild>
              <Link to={ROUTES.bookWith()}>
                <CalendarPlus /> Book an Appointment
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
