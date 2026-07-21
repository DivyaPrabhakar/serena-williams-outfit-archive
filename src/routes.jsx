import Layout from './components/layout/Layout'
import ViewerPage from './pages/ViewerPage'
import AboutPage from './pages/AboutPage'
import AdminPage from './pages/AdminPage'
import TournamentPage from './pages/TournamentPage'
import OutfitPage from './pages/OutfitPage'

// Route tree as data, consumed by vite-react-ssg (which owns the router). Dynamic
// routes are all >= 2 segments so they never collide with /about or /admin.
export const routes = [
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <ViewerPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'admin', element: <AdminPage /> },
      // /us-open/2012
      { path: ':tournament/:year', element: <TournamentPage /> },
      // /wimbledon/2015/final  (Singles implicit)
      { path: ':tournament/:year/:round', element: <OutfitPage /> },
      // /wimbledon/2012/doubles/final
      { path: ':tournament/:year/:discipline/:round', element: <OutfitPage /> },
    ],
  },
]
