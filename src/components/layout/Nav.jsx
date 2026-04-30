import { Link } from 'react-router-dom'

export default function Nav() {
  return (
    <nav className="sticky top-0 z-40 bg-dark border-b border-dark3 px-6 h-28 flex items-center justify-between">
      <Link to="/" className="flex flex-col items-start hover:opacity-80 transition-opacity">
        <span className="font-[family-name:var(--font-bebas)] text-4xl text-gold tracking-wide leading-none">Serena Williams Fit-dex</span>
        <span className="font-[family-name:var(--font-cormorant)] text-3xl italic text-muted hidden sm:inline leading-tight">Gotta Find 'Em All</span>
      </Link>
      <div className="flex items-center gap-6">
        <Link to="/about" className="text-base text-muted hover:text-ink transition-colors">About</Link>
        <a href="https://forms.gle/LKe7Cx1EjwSvcFFE8" target="_blank" rel="noreferrer" className="text-base text-muted hover:text-ink transition-colors">Submit</a>
        <Link to="/admin" className="text-base text-muted hover:text-ink transition-colors">Admin</Link>
      </div>
    </nav>
  )
}
