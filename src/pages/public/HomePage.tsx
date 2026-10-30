import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Baby,
  Bone,
  Brain,
  CalendarCheck,
  Clock,
  HeartPulse,
  ShieldCheck,
  Sparkles,
  Star,
  Stethoscope,
  UserSearch,
  type LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ROUTES } from '@/config/routes'
import { useDepartments } from '@/hooks/useDepartments'

const DEPARTMENT_ICONS: Record<string, LucideIcon> = { HeartPulse, Brain, Baby, Bone, Sparkles, Stethoscope }

const STEPS = [
  { icon: UserSearch, title: 'Find your specialist', text: 'Browse departments and doctors by speciality, rating and availability.' },
  { icon: CalendarCheck, title: 'Pick a time that suits you', text: 'See real-time slots and reserve one in a couple of taps.' },
  { icon: ShieldCheck, title: 'Get confirmed', text: 'Receive instant confirmation and reminders before your visit.' },
]

export function HomePage() {
  const { data: departments = [] } = useDepartments('active')
  return (
    <>
      <section className="relative overflow-hidden border-b bg-gradient-to-b from-accent/60 to-background">
        <div className="container grid items-center gap-12 py-16 md:py-24 lg:grid-cols-2">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card px-3 py-1 text-xs font-medium text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-secondary" /> Same-week appointments available
            </span>
            <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Care from trusted doctors, <span className="text-primary">booked in minutes.</span>
            </h1>
            <p className="max-w-lg text-lg text-muted-foreground">
              Schedule visits, manage appointments and stay on top of your health — all in one secure place.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <Link to={ROUTES.login}>
                  Book an appointment <ArrowRight />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to={ROUTES.doctors}>Find a doctor</Link>
              </Button>
            </div>
            <div className="flex items-center gap-6 pt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><Star className="h-4 w-4 fill-amber-400 text-amber-400" /> 4.8 patient rating</span>
              <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-secondary" /> 24/7 online booking</span>
            </div>
          </div>

          <Card className="relative mx-auto w-full max-w-md p-6 shadow-elevated">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                <HeartPulse className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold">Dr. James Wilson</p>
                <p className="text-sm text-muted-foreground">Cardiology · 14 yrs experience</p>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-2">
              {['9:00 AM', '9:30 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:30 PM'].map((t, i) => (
                <div
                  key={t}
                  className={
                    i === 2
                      ? 'rounded-lg bg-primary py-2 text-center text-sm font-medium text-primary-foreground'
                      : 'rounded-lg border py-2 text-center text-sm font-medium'
                  }
                >
                  {t}
                </div>
              ))}
            </div>
            <Button className="mt-6 w-full" variant="secondary" asChild>
              <Link to={ROUTES.login}>Confirm booking</Link>
            </Button>
          </Card>
        </div>
      </section>

      <section className="container py-16 md:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight">Our departments</h2>
          <p className="mt-3 text-muted-foreground">Specialist teams across every stage of life.</p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {departments.map((d) => {
            const Icon = DEPARTMENT_ICONS[d.icon] ?? Stethoscope
            return (
              <Card key={d.id} className="group p-6 transition-shadow hover:shadow-elevated">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-semibold">{d.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{d.description}</p>
              </Card>
            )
          })}
        </div>
      </section>

      <section className="border-y bg-card">
        <div className="container py-16 md:py-20">
          <h2 className="text-center text-3xl font-semibold tracking-tight">How it works</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <div key={s.title} className="text-center">
                <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
                  <s.icon className="h-6 w-6" />
                  <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-white ring-4 ring-card">
                    {i + 1}
                  </span>
                </div>
                <h3 className="mt-5 font-semibold">{s.title}</h3>
                <p className="mx-auto mt-2 max-w-xs text-sm text-muted-foreground">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container py-16 md:py-20">
        <div className="flex flex-col items-center gap-6 rounded-2xl bg-gradient-to-r from-primary to-secondary px-6 py-12 text-center text-white md:px-12">
          <h2 className="text-3xl font-semibold tracking-tight">Ready to see a doctor?</h2>
          <p className="max-w-xl text-white/85">Create an account or sign in with a demo profile to explore every portal.</p>
          <Button size="lg" variant="outline" className="border-white bg-white text-primary hover:bg-white/90 hover:text-primary" asChild>
            <Link to={ROUTES.login}>Get started</Link>
          </Button>
        </div>
      </section>
    </>
  )
}
