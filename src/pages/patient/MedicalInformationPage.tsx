import { useMemo, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { differenceInYears } from 'date-fns'
import { FlaskConical, HeartPulse, Info, Phone, UserRound } from 'lucide-react'
import { LoadingState } from '@/components/common/LoadingState'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ROUTES } from '@/config/routes'
import { GENDER_OPTIONS } from '@/config/status'
import { useAppointments } from '@/hooks/useAppointments'
import { useAuth } from '@/hooks/useAuth'
import { useCurrentPatient } from '@/hooks/usePatients'
import { formatDate, fromDateKey } from '@/lib/date'

/**
 * Basic profile details and clearly labelled demo data. Deliberately not an
 * electronic health record: there are no diagnoses, results or clinical notes here.
 */
export function MedicalInformationPage() {
  const { user } = useAuth()
  const { data: patient, isLoading } = useCurrentPatient()
  const { data: appointments = [] } = useAppointments({ patientId: patient?.id, status: ['completed'] }, { enabled: !!patient })

  const visits = useMemo(
    () => ({
      count: appointments.length,
      last: appointments.at(-1),
      departments: [...new Set(appointments.map((a) => a.departmentName))].sort(),
    }),
    [appointments],
  )

  if (isLoading || patient === undefined) return <LoadingState variant="page" label="Loading your information…" />
  if (!patient) {
    return (
      <div className="space-y-6">
        <PageHeader title="Medical Information" />
        <Card className="p-6 text-sm text-muted-foreground">No patient profile is linked to this account.</Card>
      </div>
    )
  }

  const age = differenceInYears(new Date(), fromDateKey(patient.dateOfBirth))
  const gender = GENDER_OPTIONS.find((g) => g.value === patient.gender)?.label ?? '—'

  return (
    <div className="space-y-6">
      <PageHeader
        title="Medical Information"
        description="The basic details the hospital holds about you."
        actions={
          <Button variant="outline" asChild>
            <Link to={ROUTES.patient.profile}>Update details</Link>
          </Button>
        }
      />

      <div role="note" className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <FlaskConical className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          <span className="font-semibold">Demo prototype.</span> Everything on this page is fictional sample data stored in your browser. It is
          not a medical record and must not be used for any clinical decision.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserRound className="h-4 w-4 text-primary" /> Basic information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-4 sm:grid-cols-2">
              <Item label="Full name" value={user?.fullName} />
              <Item label="Patient number" value={<span className="font-mono">{patient.patientNumber}</span>} />
              <Item label="Date of birth" value={formatDate(patient.dateOfBirth, 'MMMM d, yyyy')} />
              <Item label="Age" value={`${age} years`} />
              <Item label="Gender" value={gender} />
              <Item label="Address" value={patient.address || 'Not provided'} />
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-primary" /> Emergency contact
            </CardTitle>
          </CardHeader>
          <CardContent>
            {patient.emergencyContact ? (
              <dl className="grid gap-4 sm:grid-cols-2">
                <Item label="Name" value={patient.emergencyContact.name} />
                <Item label="Relationship" value={patient.emergencyContact.relationship} />
                <Item label="Phone" value={patient.emergencyContact.phone} />
              </dl>
            ) : (
              <p className="text-sm text-muted-foreground">
                No emergency contact on file.{' '}
                <Link to={ROUTES.patient.profile} className="font-medium text-primary hover:underline">
                  Add one
                </Link>
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HeartPulse className="h-4 w-4 text-primary" /> Sample health details
            </CardTitle>
            <CardDescription>Fictional demo data.</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-4 sm:grid-cols-2">
              <Item label="Blood group (sample)" value={patient.bloodGroup ?? 'Not recorded'} />
              <Item label="Notes (sample)" value={patient.medicalNotes ?? 'None'} className="sm:col-span-2" />
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-4 w-4 text-primary" /> Visit summary
            </CardTitle>
            <CardDescription>Based on your completed appointments.</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-4 sm:grid-cols-2">
              <Item label="Completed visits" value={visits.count} />
              <Item label="Last visit" value={visits.last ? `${formatDate(visits.last.appointmentDate)} · ${visits.last.doctorName}` : 'None yet'} />
              <Item label="Departments visited" value={visits.departments.join(', ') || 'None yet'} className="sm:col-span-2" />
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function Item({ label, value, className }: { label: string; value: ReactNode; className?: string }) {
  return (
    <div className={className}>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium">{value ?? '—'}</dd>
    </div>
  )
}
