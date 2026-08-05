import { useContext, useState } from 'react'
import { Link } from 'react-router-dom'
import { HeaderSlotContext } from './HeaderSlot'

export default function Nav() {
  const { setSlotEl } = useContext(HeaderSlotContext)
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-40 bg-dark border-b-2 border-white px-6 h-28 flex items-center justify-between relative">
      <Link to="/" className="flex flex-col items-start flex-shrink-0 hover:opacity-80 transition-opacity">
        <span className="font-[family-name:var(--font-bebas)] text-2xl sm:text-4xl text-brand tracking-wide leading-none">Serena Williams Fit-dex</span>
        <span className="font-[family-name:var(--font-cormorant)] text-lg italic text-muted hidden sm:inline leading-none mt-0.5">Gotta Find 'Em All</span>
      </Link>

      {/* Centered control slot — filled by ViewerPage via portal */}
      <div
        ref={setSlotEl}
        className="hidden lg:flex flex-1 items-center justify-center gap-2"
      />

      {/* Desktop: inline nav links */}
      <div className="hidden md:flex items-center gap-6">
        <Link to="/stats" className="text-base text-muted hover:text-ink transition-colors">Stats</Link>
        <Link to="/about" className="text-base text-muted hover:text-ink transition-colors">About</Link>
      </div>

      {/* Mobile: hamburger toggles a slide-in drawer */}
      <button
        onClick={() => setMenuOpen(true)}
        className="md:hidden flex items-center justify-center p-2 -mr-2 text-ink hover:text-brand transition-colors"
        aria-label="Open menu"
        aria-expanded={menuOpen}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {menuOpen && (
        <MobileNavDrawer onClose={() => setMenuOpen(false)} />
      )}
    </nav>
  )
}

// Right slide-in drawer for the mobile nav links, styled to match GroupingPanel.
function MobileNavDrawer({ onClose }) {
  return (
    <>
      <div className="md:hidden fixed inset-0 z-40 bg-black/50" onClick={onClose} />
      <div className="md:hidden fixed right-0 top-28 bottom-0 z-[45] w-full sm:w-72 bg-dark2 border-l-2 border-white shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b-2 border-white flex-shrink-0">
          <h3 className="font-playfair text-brand text-base">Menu</h3>
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-sm font-medium text-ink bg-dark3 hover:bg-brand hover:text-dark rounded px-3 py-1.5 transition-colors"
            aria-label="Close"
          >
            <span className="text-lg leading-none">×</span>
            Close
          </button>
        </div>
        <nav className="flex flex-col px-5 py-5 gap-2">
          <Link
            to="/stats"
            onClick={onClose}
            className="w-full text-left px-4 py-3 rounded text-sm font-medium bg-dark3 text-ink hover:text-white transition-colors"
          >
            Stats
          </Link>
          <Link
            to="/about"
            onClick={onClose}
            className="w-full text-left px-4 py-3 rounded text-sm font-medium bg-dark3 text-ink hover:text-white transition-colors"
          >
            About
          </Link>
        </nav>
      </div>
    </>
  )
}
