import { DashboardShell } from '@/components/layout/DashboardShell'
import { NAVIGATION } from '@/config/navigation'
import { ROUTES } from '@/config/routes'

export function AdminLayout() {
  return (
    <DashboardShell
      navigation={NAVIGATION.admin}
      homeHref={ROUTES.admin.dashboard}
      portalLabel="Administration"
      settingsHref={ROUTES.admin.settings}
    />
  )
}
