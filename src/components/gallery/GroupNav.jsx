import { useEffect, useRef, useState } from 'react'
import { useGroupNav } from './GroupNavContext'

// Pin line where sticky group headers come to rest, in px — matches the
// `md:top-28` (h-28 nav) used by StickyGroupHeader.
const PIN_OFFSET = 112

// Plural noun describing what the current grouping lists, shown in the rail
// header and on the collapsed handle so it's clear what's behind it.
const GROUP_NOUNS = {
  year: 'Years',
  tournament: 'Tournaments',
  color: 'Colors',
  'color-group': 'Color groups',
  brand: 'Brands',
}

export default function GroupNav({ groupBy, collapsed, onToggle }) {
  const { sections } = useGroupNav()
  const [activeId, setActiveId] = useState(null)
  const tickRef = useRef(false)

  const noun = GROUP_NOUNS[groupBy] ?? 'Sections'

  // Scroll-spy: the active section is the last one whose anchor has reached the
  // sticky pin line. Sections are already in document order.
  useEffect(() => {
    if (sections.length === 0) return

    function compute() {
      tickRef.current = false
      let active = sections[0].id
      for (const s of sections) {
        if (!s.el) continue
        if (s.el.getBoundingClientRect().top - PIN_OFFSET <= 1) active = s.id
        else break
      }
      setActiveId(active)
    }
    function onScroll() {
      if (tickRef.current) return
      tickRef.current = true
      requestAnimationFrame(compute)
    }

    compute()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [sections])

  function jumpTo(section) {
    section.el?.scrollIntoView({ behavior: 'smooth' })
  }

  // Nothing to navigate between.
  if (sections.length < 2) return null

  if (collapsed) {
    return (
      <button
        onClick={onToggle}
        title={`Jump to a ${noun.toLowerCase().replace(/s$/, '')}`}
        aria-label={`Expand ${noun} navigation`}
        className="hidden lg:flex fixed left-0 top-28 z-30 flex-col items-center gap-2 py-4 px-1.5 bg-dark2 border-r border-t border-dark3 rounded-tr rounded-br text-muted hover:text-gold transition-colors"
      >
        <span aria-hidden className="text-sm leading-none">›</span>
        <span
          className="text-[11px] uppercase tracking-widest"
          style={{ writingMode: 'vertical-rl' }}
        >
          {noun}
        </span>
      </button>
    )
  }

  return (
    <aside className="hidden lg:flex fixed left-0 top-28 bottom-0 z-30 w-52 flex-col bg-dark2 border-r border-dark3">
      <div className="flex items-center justify-between px-4 py-4 border-b border-dark3 flex-shrink-0">
        <h3 className="font-playfair text-gold text-sm">{noun}</h3>
        <button
          onClick={onToggle}
          className="text-muted hover:text-ink text-lg leading-none"
          aria-label={`Collapse ${noun} navigation`}
          title="Collapse"
        >
          ‹
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto py-2">
        {sections.map(section => {
          const active = section.id === activeId
          return (
            <button
              key={section.id}
              onClick={() => jumpTo(section)}
              className={`w-full text-left px-4 py-2 text-sm truncate border-l-2 transition-colors ${
                active
                  ? 'border-gold text-gold'
                  : 'border-transparent text-muted hover:text-ink'
              }`}
            >
              {section.label}
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
