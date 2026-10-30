import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { Mail, MapPin, Menu, Phone } from 'lucide-react'
import { Logo } from '@/components/layout/Logo'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet'
import { APP_CONFIG } from '@/config/app'
import { PUBLIC_NAVIGATION } from '@/config/navigation'
import { ROLE_HOME, ROUTES } from '@/config/routes'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

export function PublicLayout() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const location = useLocation()
  useEffect(() => setOpen(false), [location.pathname])

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn('text-sm font-medium transition-colors hover:text-primary', isActive ? 'text-primary' : 'text-muted-foreground')

  const authActions = user ? (
    <Button asChild>
      <Link to={ROLE_HOME[user.role]}>Go to dashboard</Link>
    </Button>
  ) : (
    <>
      <Button variant="ghost" asChild>
        <Link to={ROUTES.login}>Sign in</Link>
      </Button>
      <Button asChild>
        <Link to={ROUTES.register}>Book appointment</Link>
      </Button>
    </>
  )

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-30 border-b bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/70">
        <div className="container flex h-16 items-center justify-between gap-6">
          <Logo />
          <nav className="hidden items-center gap-7 md:flex">
            {PUBLIC_NAVIGATION.map((item) => (
              <NavLink key={item.href} to={item.href} end={item.href === '/'} className={navLinkClass}>
                {item.title}
              </NavLink>
            ))}
          </nav>
          <div className="hidden items-center gap-2 md:flex">{authActions}</div>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu className="!h-5 !w-5" />
          </Button>
        </div>
      </header>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="flex w-72 flex-col gap-6 p-6">
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <SheetDescription className="sr-only">Site navigation</SheetDescription>
          <Logo />
          <nav className="flex flex-col gap-4">
            {PUBLIC_NAVIGATION.map((item) => (
              <NavLink key={item.href} to={item.href} end={item.href === '/'} className={navLinkClass}>
                {item.title}
              </NavLink>
            ))}
          </nav>
          <div className="mt-auto flex flex-col gap-2 [&>a]:w-full">{authActions}</div>
        </SheetContent>
      </Sheet>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t bg-card">
        <div className="container grid gap-8 py-10 md:grid-cols-4">
          <div className="space-y-3 md:col-span-2">
            <Logo />
            <p className="max-w-sm text-sm text-muted-foreground">
              {APP_CONFIG.hospitalName}. Compassionate care, booked in minutes.
            </p>
          </div>
          <div className="space-y-3">
            <p className="text-sm font-semibold">Explore</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {PUBLIC_NAVIGATION.map((item) => (
                <li key={item.href}>
                  <Link to={item.href} className="hover:text-primary">
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-3">
            <p className="text-sm font-semibold">Contact</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><MapPin className="h-4 w-4" /> 120 Harbor Ave, Springfield</li>
              <li className="flex items-center gap-2"><Phone className="h-4 w-4" /> +1 (555) 010-2000</li>
              <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> {APP_CONFIG.supportEmail}</li>
            </ul>
          </div>
        </div>
        <div className="border-t">
          <p className="container py-4 text-xs text-muted-foreground">
            © {new Date().getFullYear()} {APP_CONFIG.name}. Demo application — not for clinical use.
          </p>
        </div>
      </footer>
    </div>
  )
}
