import { Outlet } from 'react-router-dom'
import { HeaderSlotProvider } from './HeaderSlot'
import Nav from './Nav'

// Root layout for every route: the header-slot provider + nav shell, with the
// matched page rendered into <Outlet />. Extracted from the old App.jsx so the
// route tree can be expressed as data for vite-react-ssg.
export default function Layout() {
  return (
    <HeaderSlotProvider>
      <Nav />
      <Outlet />
    </HeaderSlotProvider>
  )
}
