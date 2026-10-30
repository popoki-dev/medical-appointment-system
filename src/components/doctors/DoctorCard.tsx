import { Link } from 'react-router-dom'
import { BadgeDollarSign, Briefcase, CalendarPlus, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ROUTES } from '@/config/routes'
import { formatCurrency } from '@/lib/format'
import type { DoctorAvailability } from '@/services'
import type { Department, Doctor } from '@/types'
import { DoctorAvatar } from './DoctorAvatar'
import { NextAvailable } from './NextAvailable'

interface DoctorCardProps {
  doctor: Doctor
  department?: Department
  /** Undefined while loading. */
  availability?: DoctorAvailability
}

export function DoctorCard({ doctor, department, availability }: DoctorCardProps) {
  const profileHref = ROUTES.doctorProfile(doctor.id)
  return (
    <Card className="flex h-full flex-col p-5 transition-shadow hover:shadow-elevated">
      <div className="flex items-start gap-4">
        <DoctorAvatar doctor={doctor} />
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold leading-tight">
            <Link to={profileHref} className="hover:text-primary">
              {doctor.fullName}
            </Link>
          </h3>
          <p className="mt-0.5 text-sm leading-snug text-primary">{doctor.specialization}</p>
          <p className="truncate text-sm text-muted-foreground">{department?.name ?? '—'}</p>
        </div>
        <span className="flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
          {doctor.rating.toFixed(1)}
        </span>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 rounded-lg bg-muted/50 p-3 text-sm">
        <div>
          <dt className="flex items-center gap-1 text-xs text-muted-foreground">
            <Briefcase className="h-3.5 w-3.5" /> Experience
          </dt>
          <dd className="mt-0.5 font-medium">{doctor.experience} years</dd>
        </div>
        <div>
          <dt className="flex items-center gap-1 text-xs text-muted-foreground">
            <BadgeDollarSign className="h-3.5 w-3.5" /> Consultation
          </dt>
          <dd className="mt-0.5 font-medium">{formatCurrency(doctor.consultationFee)}</dd>
        </div>
      </dl>

      <NextAvailable availability={availability} className="mt-3" />

      <div className="mt-auto grid grid-cols-2 gap-2 pt-4">
        <Button variant="outline" asChild>
          <Link to={profileHref}>View Profile</Link>
        </Button>
        <Button asChild>
          <Link to={ROUTES.patient.bookWith({ doctorId: doctor.id })}>
            <CalendarPlus /> Book
          </Link>
        </Button>
      </div>
    </Card>
  )
}
