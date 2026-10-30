import { DashboardShell } from '@/components/layout/DashboardShell'
import { NAVIGATION } from '@/config/navigation'
import { ROUTES } from '@/config/routes'

export function ReceptionistLayout() {
  return (
    <DashboardShell
      navigation={NAVIGATION.receptionist}
      homeHref={ROUTES.receptionist.dashboard}
      portalLabel="Front desk"
    />
  )
}
