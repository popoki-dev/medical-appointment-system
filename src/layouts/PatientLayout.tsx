import { DashboardShell } from '@/components/layout/DashboardShell'
import { NAVIGATION } from '@/config/navigation'
import { ROUTES } from '@/config/routes'

export function PatientLayout() {
  return (
    <DashboardShell
      navigation={NAVIGATION.patient}
      homeHref={ROUTES.patient.dashboard}
      portalLabel="Patient portal"
      profileHref={ROUTES.patient.profile}
    />
  )
}
