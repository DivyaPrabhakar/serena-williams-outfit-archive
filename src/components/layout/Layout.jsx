import { Outlet } from 'react-router-dom'
import { Head } from 'vite-react-ssg'
import { HeaderSlotProvider } from './HeaderSlot'
import Nav from './Nav'
import ScrollToTop from './ScrollToTop'
import { personLd, authorPersonLd, publisherOrgLd } from '../../lib/schema'

// The site-wide identity graph: Serena (subject), Divya (author), and the
// Fit-dex (publisher), emitted in full once on every pre-rendered route. Page
// blocks reference these nodes by @id (personRef/authorRef/publisherRef).
const SITE_GRAPH = {
  '@context': 'https://schema.org',
  '@graph': [personLd(), authorPersonLd(), publisherOrgLd()],
}

// Root layout for every route: the header-slot provider + nav shell, with the
// matched page rendered into <Outlet />. Extracted from the old App.jsx so the
// route tree can be expressed as data for vite-react-ssg.
export default function Layout() {
  return (
    <HeaderSlotProvider>
      <Head>
        <script type="application/ld+json">{JSON.stringify(SITE_GRAPH)}</script>
      </Head>
      <ScrollToTop />
      <Nav />
      <Outlet />
    </HeaderSlotProvider>
  )
}
