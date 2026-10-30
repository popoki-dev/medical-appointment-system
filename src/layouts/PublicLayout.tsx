import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { Clock, Mail, MapPin, Menu, Phone, Siren } from 'lucide-react'
import { Logo } from '@/components/layout/Logo'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet'
import { HOSPITAL, telHref } from '@/config/hospital'
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
        <Link to={ROUTES.bookWith()}>Book appointment</Link>
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
        <div className="container grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr]">
          <div className="space-y-3">
            <Logo />
            <p className="max-w-sm text-sm text-muted-foreground">
              {HOSPITAL.name}. Specialist care for Springfield since {HOSPITAL.founded}, with appointments you can book online
              at any time.
            </p>
            <a href={telHref(HOSPITAL.emergencyPhone)} className="inline-flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700">
              <Siren className="h-4 w-4" /> Emergency: {HOSPITAL.emergencyPhone}
            </a>
          </div>
          <FooterLinks title="Explore" links={PUBLIC_NAVIGATION} />
          <FooterLinks
            title="Patients"
            links={[
              { title: 'Book an appointment', href: ROUTES.bookWith() },
              { title: 'Find a doctor', href: ROUTES.doctors },
              { title: 'Create an account', href: ROUTES.register },
              { title: 'Sign in', href: ROUTES.login },
            ]}
          />
          <div className="space-y-3">
            <p className="text-sm font-semibold">Contact</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  {HOSPITAL.address.line1}, {HOSPITAL.address.line2}
                </span>
              </li>
              <li>
                <a href={telHref(HOSPITAL.phone)} className="flex items-center gap-2 hover:text-primary">
                  <Phone className="h-4 w-4" /> {HOSPITAL.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${HOSPITAL.email}`} className="flex items-center gap-2 hover:text-primary">
                  <Mail className="h-4 w-4" /> {HOSPITAL.email}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  {HOSPITAL.openingHours.map((row) => (
                    <span key={row.days} className="block">
                      {row.days}: {row.hours}
                    </span>
                  ))}
                </span>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t">
          <p className="container py-4 text-xs text-muted-foreground">
            © {new Date().getFullYear()} {HOSPITAL.name}. A fictional hospital — demo application, not for clinical use.
          </p>
        </div>
      </footer>
    </div>
  )
}

function FooterLinks({ title, links }: { title: string; links: { title: string; href: string }[] }) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold">{title}</p>
      <ul className="space-y-2 text-sm text-muted-foreground">
        {links.map((link) => (
          <li key={link.href}>
            <Link to={link.href} className="hover:text-primary">
              {link.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
