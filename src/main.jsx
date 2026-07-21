import { ViteReactSSG } from 'vite-react-ssg'
import './index.css'
import { routes } from './routes'

// vite-react-ssg entry: it owns the router, statically renders each route to its
// own .html at build, and hydrates the same tree on the client. Replaces the old
// createRoot(<App/>) bootstrap.
export const createRoot = ViteReactSSG({ routes })
