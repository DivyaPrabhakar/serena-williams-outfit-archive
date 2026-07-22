import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// Reset scroll to the top on every route change. React-router keeps the previous
// scroll position across SPA navigations by default, which left tournament/outfit
// pages opening part-way down the page; this makes each new page start at the top
// like a normal navigation. In-page jumps (GroupNav) use scrollIntoView without
// changing the pathname, so they are unaffected.
export default function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}
