import { DashboardShell } from '@/components/layout/DashboardShell'
import { NAVIGATION } from '@/config/navigation'
import { ROUTES } from '@/config/routes'

export function DoctorLayout() {
  return (
    <DashboardShell
      navigation={NAVIGATION.doctor}
      homeHref={ROUTES.doctor.dashboard}
      portalLabel="Doctor portal"
      profileHref={ROUTES.doctor.profile}
    />
  )
}
