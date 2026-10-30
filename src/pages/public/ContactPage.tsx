import type { ReactNode } from 'react'
import { Bus, Car, Clock, Mail, MapPin, Phone, Siren } from 'lucide-react'
import { PageIntro } from '@/components/public'
import { Card } from '@/components/ui/card'
import { HOSPITAL, telHref } from '@/config/hospital'

export function ContactPage() {
  return (
    <>
      <PageIntro
        eyebrow="Contact"
        title="Visit or call us"
        description="Find us on Harbor Avenue, a short walk from the city centre. For a medical emergency, call 911 or come straight to our emergency department."
      />

      <section className="container grid gap-6 py-10 lg:grid-cols-[1fr_1.1fr]">
        <div className="space-y-6">
          <Card className="grid gap-6 p-6 sm:grid-cols-2">
            <ContactItem icon={MapPin} title="Address">
              {HOSPITAL.address.line1}
              <br />
              {HOSPITAL.address.line2}
              <br />
              {HOSPITAL.address.country}
            </ContactItem>
            <ContactItem icon={Phone} title="Phone">
              <a href={telHref(HOSPITAL.phone)} className="hover:text-primary">
                {HOSPITAL.phone}
              </a>
              <span className="block text-xs text-muted-foreground">Main reception and appointments</span>
            </ContactItem>
            <ContactItem icon={Mail} title="Email">
              <a href={`mailto:${HOSPITAL.email}`} className="hover:text-primary">
                {HOSPITAL.email}
              </a>
              <a href={`mailto:${HOSPITAL.appointmentsEmail}`} className="block hover:text-primary">
                {HOSPITAL.appointmentsEmail}
              </a>
            </ContactItem>
            <ContactItem icon={Siren} title="Emergency" tone="danger">
              <a href={telHref(HOSPITAL.emergencyPhone)} className="font-semibold hover:text-red-700">
                {HOSPITAL.emergencyPhone}
              </a>
              <span className="block text-xs text-muted-foreground">{HOSPITAL.emergencyHours}</span>
            </ContactItem>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Opening hours</h2>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">Outpatient clinics and main reception.</p>
            <dl className="mt-4 divide-y rounded-lg border text-sm">
              {HOSPITAL.openingHours.map((row) => (
                <div key={row.days} className="flex justify-between gap-4 px-4 py-3">
                  <dt className="text-muted-foreground">{row.days}</dt>
                  <dd className={row.hours === 'Closed' ? 'font-medium text-muted-foreground' : 'font-medium'}>{row.hours}</dd>
                </div>
              ))}
              <div className="flex justify-between gap-4 bg-red-50/60 px-4 py-3">
                <dt className="text-red-800">Emergency department</dt>
                <dd className="font-medium text-red-800">24 / 7</dd>
              </div>
            </dl>
          </Card>
        </div>

        <div className="space-y-6">
          <MapPlaceholder />
          <Card className="grid gap-6 p-6 sm:grid-cols-2">
            <ContactItem icon={Car} title="Parking">
              {HOSPITAL.parking}
            </ContactItem>
            <ContactItem icon={Bus} title="Public transport">
              {HOSPITAL.transit}
            </ContactItem>
          </Card>
        </div>
      </section>
    </>
  )
}

interface ContactItemProps {
  icon: typeof MapPin
  title: string
  tone?: 'default' | 'danger'
  children: ReactNode
}

function ContactItem({ icon: Icon, title, tone = 'default', children }: ContactItemProps) {
  return (
    <div className="flex gap-3">
      <div
        className={
          tone === 'danger'
            ? 'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600'
            : 'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary'
        }
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 text-sm">
        <h3 className="font-semibold">{title}</h3>
        <div className="mt-1 break-words text-foreground/80">{children}</div>
      </div>
    </div>
  )
}

/** A stylised street map. Stands in for an embedded map, which would need an external service. */
function MapPlaceholder() {
  return (
    <Card className="overflow-hidden p-0">
      <div className="relative aspect-[16/10] bg-[#EEF4F8]">
        <svg viewBox="0 0 640 400" className="absolute inset-0 h-full w-full" role="img" aria-label={`Map showing ${HOSPITAL.name} at ${HOSPITAL.address.line1}`}>
          <rect width="640" height="400" fill="#EEF4F8" />
          {/* River */}
          <path d="M-20 330 C 120 290, 220 380, 360 340 S 560 300, 660 340 L 660 420 L -20 420 Z" fill="#CFE3F3" />
          {/* Park */}
          <rect x="430" y="60" width="150" height="110" rx="14" fill="#D7EEDF" />
          {/* Blocks */}
          {[
            [40, 40, 140, 90], [40, 170, 140, 90], [220, 40, 160, 90], [220, 170, 70, 90], [310, 170, 70, 90], [430, 200, 150, 70],
          ].map(([x, y, w, h]) => (
            <rect key={`${x}-${y}`} x={x} y={y} width={w} height={h} rx="8" fill="#E2E8F0" />
          ))}
          {/* Streets */}
          <g stroke="#FFFFFF" strokeWidth="18" strokeLinecap="round">
            <path d="M0 150 H640" />
            <path d="M200 0 V310" />
            <path d="M400 0 V300" />
          </g>
          <g fill="#64748B" fontSize="13" fontFamily="Inter, system-ui, sans-serif" fontWeight="500">
            <text x="20" y="144">Harbor Avenue</text>
            <text x="206" y="300" transform="rotate(-90 206 300)">2nd Street</text>
            <text x="470" y="120">Riverside Park</text>
          </g>
          {/* Hospital pin */}
          <g transform="translate(300 150)">
            <circle r="34" fill="#2563EB" fillOpacity="0.15" />
            <path d="M0 -44 C -18 -44 -30 -31 -30 -15 C -30 6 0 30 0 30 C 0 30 30 6 30 -15 C 30 -31 18 -44 0 -44 Z" fill="#2563EB" />
            <path d="M-4 -26 h8 v7 h7 v8 h-7 v7 h-8 v-7 h-7 v-8 h7 z" fill="#FFFFFF" />
          </g>
        </svg>
        <div className="absolute bottom-3 left-3 right-3 flex items-center gap-3 rounded-lg border bg-card/95 px-4 py-3 shadow-sm backdrop-blur sm:right-auto">
          <MapPin className="h-5 w-5 shrink-0 text-primary" />
          <div className="text-sm">
            <p className="font-semibold">{HOSPITAL.name}</p>
            <p className="text-muted-foreground">
              {HOSPITAL.address.line1}, {HOSPITAL.address.line2}
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}
