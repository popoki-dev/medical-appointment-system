import { Link, useLocation } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/config/routes'

export function UnauthorizedPage() {
  const home = (useLocation().state as { home?: string } | null)?.home ?? ROUTES.home
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
        <ShieldAlert className="h-8 w-8" />
      </div>
      <p className="text-sm font-semibold text-amber-700">403</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Access restricted</h1>
      <p className="mt-2 max-w-md text-muted-foreground">Your account doesn't have permission to view this page.</p>
      <Button asChild className="mt-8">
        <Link to={home}>Go to my dashboard</Link>
      </Button>
    </div>
  )
}
