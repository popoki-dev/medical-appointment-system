import { Outlet, ScrollRestoration } from 'react-router-dom'

/** Wraps every route: new pages open at the top, and Back returns to the previous scroll position. */
export function RootLayout() {
  return (
    <>
      <ScrollRestoration />
      <Outlet />
    </>
  )
}
