import { isRouteErrorResponse, Link, useRouteError } from 'react-router-dom'
import { AlertOctagon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/config/routes'
import { NotFoundPage } from './NotFoundPage'

export function RouteErrorPage() {
  const error = useRouteError()
  if (isRouteErrorResponse(error) && error.status === 404) return <NotFoundPage />

  const message = error instanceof Error ? error.message : 'An unexpected error occurred.'
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-red-600">
        <AlertOctagon className="h-8 w-8" />
      </div>
      <h1 className="text-3xl font-semibold tracking-tight">Something went wrong</h1>
      <p className="mt-2 max-w-md text-muted-foreground">{message}</p>
      <div className="mt-8 flex gap-2">
        <Button variant="outline" onClick={() => window.location.reload()}>
          Reload
        </Button>
        <Button asChild>
          <Link to={ROUTES.home}>Back to home</Link>
        </Button>
      </div>
    </div>
  )
}
