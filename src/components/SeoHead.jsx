import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// Hardcoded to the primary apex domain (not window.location.origin) so pages still
// served from the .netlify.app host during the indexing transition emit a canonical
// pointing at the real domain.
const SITE_ORIGIN = 'https://serena-williams-fitdex.com'

// Keeps the canonical link / robots meta in sync with the current route. The admin
// panel is kept out of search indexes; every other route gets a self-referential
// canonical. Renders nothing.
export default function SeoHead() {
  const { pathname } = useLocation()

  useEffect(() => {
    const isAdmin = pathname.startsWith('/admin')
    if (isAdmin) {
      // Don't mix a canonical with noindex — drop the canonical and mark noindex.
      setMeta('robots', 'noindex, nofollow')
      removeEl('link[rel="canonical"]')
    } else {
      removeEl('meta[name="robots"]')
      const path = pathname === '/' ? '/' : pathname.replace(/\/+$/, '')
      setLink('canonical', SITE_ORIGIN + path)
    }
  }, [pathname])

  return null
}

function setLink(rel, href) {
  let el = document.head.querySelector(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

function setMeta(name, content) {
  let el = document.head.querySelector(`meta[name="${name}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute('name', name)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function removeEl(selector) {
  document.head.querySelector(selector)?.remove()
}
