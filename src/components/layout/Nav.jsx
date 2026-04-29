import { Link } from 'react-router-dom'

export default function Nav() {
  return (
    <nav className="sticky top-0 z-40 bg-dark border-b border-dark3 px-6 h-12 flex items-center justify-between">
      <Link to="/" className="flex items-baseline gap-2 hover:opacity-80 transition-opacity">
        <span className="font-playfair text-base text-gold tracking-wide">Serena Williams Fit-dex</span>
        <span className="text-[10px] text-muted italic hidden sm:inline">gotta find 'em all</span>
      </Link>
      <div className="flex items-center gap-4">
        <Link to="/about" className="text-xs text-muted hover:text-ink transition-colors">About</Link>
        <Link to="/submit" className="text-xs text-muted hover:text-ink transition-colors">Submit</Link>
        <Link to="/admin" className="text-xs text-muted hover:text-ink transition-colors">Admin</Link>
      </div>
    </nav>
  )
}
