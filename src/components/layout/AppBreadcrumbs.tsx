import { Fragment } from 'react'
import { Link, useMatches } from 'react-router-dom'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

export interface RouteHandle {
  crumb?: string
}

/** Builds breadcrumbs from the `handle.crumb` of every matched route. */
export function AppBreadcrumbs({ className }: { className?: string }) {
  const matches = useMatches()
  const crumbs = matches
    .filter((m) => (m.handle as RouteHandle | undefined)?.crumb)
    .map((m) => ({ label: (m.handle as RouteHandle).crumb!, href: m.pathname }))

  if (!crumbs.length) return null

  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        {crumbs.map((crumb, index) => {
          const last = index === crumbs.length - 1
          return (
            <Fragment key={`${crumb.href}-${index}`}>
              <BreadcrumbItem>
                {last ? (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={crumb.href}>{crumb.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!last && <BreadcrumbSeparator />}
            </Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
