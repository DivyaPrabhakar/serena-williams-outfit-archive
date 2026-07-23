import Layout from './components/layout/Layout'
import ViewerPage from './pages/ViewerPage'
import AboutPage from './pages/AboutPage'
import MethodologyPage from './pages/MethodologyPage'
import StatsPage from './pages/StatsPage'
import AdminPage from './pages/AdminPage'
import TournamentPage from './pages/TournamentPage'
import TournamentHubPage from './pages/TournamentHubPage'
import OutfitPage from './pages/OutfitPage'
import NotFoundPage from './pages/NotFoundPage'

// Route tree as data, consumed by vite-react-ssg (which owns the router). The
// static /about and /admin routes outrank the single-segment :tournamentHub param,
// and the outfit routes are all >= 2 segments, so nothing collides.
export const routes = [
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <ViewerPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'methodology', element: <MethodologyPage /> },
      { path: 'stats', element: <StatsPage /> },
      { path: 'admin', element: <AdminPage /> },
      // Concrete /404 is prerendered (in ssgPaths) → dist/404.html, which Netlify
      // serves with a real 404 status for unmatched URLs. Static, so it outranks
      // the :tournamentHub param below.
      { path: '404', element: <NotFoundPage /> },
      // /wimbledon-outfits — per-tournament hub spanning all years
      { path: ':tournamentHub', element: <TournamentHubPage /> },
      // /us-open/2012
      { path: ':tournament/:year', element: <TournamentPage /> },
      // /wimbledon/2015/final  (Singles implicit)
      { path: ':tournament/:year/:round', element: <OutfitPage /> },
      // /wimbledon/2012/doubles/final
      { path: ':tournament/:year/:discipline/:round', element: <OutfitPage /> },
      // Client-side fallback for anything the param routes above don't match
      // (e.g. 5+ segment URLs). Prerendered unknowns are handled by Netlify.
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]
