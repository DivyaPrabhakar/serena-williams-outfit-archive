import NotFoundNotice from '../components/NotFoundNotice'

// Generic 404 for any unmatched route. Prerendered via the concrete `/404` path in
// ssgPaths() and copied to dist/404.html (see vite.config.js), so Netlify serves it
// with a real 404 status for unknown URLs (see netlify.toml) instead of the old
// soft-200 that rewrote every bogus path to the homepage.
export default function NotFoundPage() {
  return (
    <NotFoundNotice
      path="/404"
      title="Page not found | Serena Williams Fit-dex"
      message="This page doesn’t exist — the link may be mistyped, or the outfit isn’t catalogued yet."
    />
  )
}
