import { Link } from 'react-router-dom'

export default function Nav() {
  return (
    <nav className="sticky top-0 z-40 bg-dark border-b border-dark3 px-6 h-12 flex items-center justify-between">
      <Link
        to="/"
        className="font-playfair text-base text-gold tracking-wide hover:text-gold-light transition-colors"
      >
        Serena Williams Fit-dex
      </Link>
      <Link
        to="/admin"
        className="text-xs text-muted hover:text-ink transition-colors"
      >
        Admin
      </Link>
    </nav>
  )
}
