import { Link } from 'react-router-dom'
import { ArrowRight, Building2, Users } from 'lucide-react'
import { EmptyState } from '@/components/common/EmptyState'
import { DepartmentIcon, DoctorAvatar } from '@/components/doctors'
import { PageIntro } from '@/components/public'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ROUTES } from '@/config/routes'
import { useDepartments } from '@/hooks/useDepartments'
import { useDoctors } from '@/hooks/useDoctors'

export function DepartmentsPage() {
  const { data: departments, isLoading } = useDepartments('active')
  const { data: doctors } = useDoctors({ status: 'active' })

  return (
    <>
      <PageIntro
        eyebrow="Departments"
        title="Clinical departments"
        description="Each department brings together specialists, nurses and diagnostics so your care is coordinated from the first visit."
      />
      <section className="container py-10 md:py-14">
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="h-72 rounded-xl" />
            ))}
          </div>
        ) : departments?.length ? (
          <div className="grid gap-6 md:grid-cols-2">
            {departments.map((department) => {
              const team = doctors?.filter((d) => d.departmentId === department.id)
              return (
                <Card key={department.id} className="flex flex-col overflow-hidden transition-shadow hover:shadow-elevated">
                  {department.image ? (
                    <img src={department.image} alt="" className="h-40 w-full object-cover" />
                  ) : (
                    <div className="relative flex h-40 items-center justify-center overflow-hidden bg-gradient-to-br from-primary/90 to-secondary">
                      <DepartmentIcon name={department.icon} className="h-16 w-16 text-white" strokeWidth={1.5} aria-hidden />
                      <div aria-hidden className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
                      <div aria-hidden className="absolute -bottom-12 -left-6 h-32 w-32 rounded-full bg-white/10" />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-6">
                    <div className="flex items-start justify-between gap-4">
                      <h2 className="text-xl font-semibold">{department.name}</h2>
                      <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-secondary/10 px-2.5 py-1 text-xs font-semibold text-secondary">
                        <Users className="h-3.5 w-3.5" />
                        {team ? `${team.length} ${team.length === 1 ? 'doctor' : 'doctors'}` : '…'}
                      </span>
                    </div>
                    <p className="mt-2 flex-1 text-muted-foreground">{department.description}</p>
                    {team && team.length > 0 && (
                      <div className="mt-5 flex items-center gap-3">
                        <div className="flex -space-x-2">
                          {team.slice(0, 4).map((doctor) => (
                            <DoctorAvatar key={doctor.id} doctor={doctor} className="h-9 w-9 text-xs ring-2 ring-card" />
                          ))}
                        </div>
                        <p className="truncate text-sm text-muted-foreground">
                          {team.map((d) => d.fullName).slice(0, 2).join(', ')}
                          {team.length > 2 && ` and ${team.length - 2} more`}
                        </p>
                      </div>
                    )}
                    <div className="mt-6 flex flex-wrap gap-2">
                      <Button asChild>
                        <Link to={`${ROUTES.doctors}?department=${department.id}`}>
                          View Doctors <ArrowRight />
                        </Link>
                      </Button>
                      <Button variant="outline" asChild>
                        <Link to={ROUTES.bookWith({ departmentId: department.id })}>Book in {department.name}</Link>
                      </Button>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card>
            <EmptyState icon={Building2} title="No departments listed" description="Please check back soon." className="py-16" />
          </Card>
        )}
      </section>
    </>
  )
}
