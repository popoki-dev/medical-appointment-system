import { Link } from 'react-router-dom'
import { ArrowLeft, SearchX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/config/routes'

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent text-primary">
        <SearchX className="h-8 w-8" />
      </div>
      <p className="text-sm font-semibold text-primary">404</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Page not found</h1>
      <p className="mt-2 max-w-md text-muted-foreground">The page you're looking for doesn't exist or has been moved.</p>
      <Button asChild className="mt-8">
        <Link to={ROUTES.home}>
          <ArrowLeft />
          Back to home
        </Link>
      </Button>
    </div>
  )
}
