import { useContext } from 'react'
import { Link } from 'react-router-dom'
import { HeaderSlotContext } from './HeaderSlot'

export default function Nav() {
  const { setSlotEl } = useContext(HeaderSlotContext)
  return (
    <nav className="sticky top-0 z-40 bg-dark border-b border-dark3 px-6 h-28 flex items-center justify-between relative">
      <Link to="/" className="flex flex-col items-start hover:opacity-80 transition-opacity">
        <span className="font-[family-name:var(--font-bebas)] text-2xl sm:text-4xl text-gold tracking-wide leading-none">Serena Williams Fit-dex</span>
        <span className="font-[family-name:var(--font-cormorant)] text-lg italic text-muted hidden sm:inline leading-none mt-0.5">Gotta Find 'Em All</span>
      </Link>

      {/* Centered control slot — filled by ViewerPage via portal */}
      <div
        ref={setSlotEl}
        className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-2"
      />

      <div className="flex items-center gap-6">
        <Link to="/stats" className="text-base text-muted hover:text-ink transition-colors">Stats</Link>
        <Link to="/about" className="text-base text-muted hover:text-ink transition-colors">About</Link>
      </div>
    </nav>
  )
}
