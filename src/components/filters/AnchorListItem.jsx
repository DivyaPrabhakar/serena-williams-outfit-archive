// Shared row for "long list of anchors" panels (the year/tournament/color
// jump nav, missing outfits) — a full-width, edge-to-edge row with no block
// background at rest, a brand tint when active, and the same tint on hover
// used everywhere else in the app.
export default function AnchorListItem({ active, onClick, children, className = '' }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-2 text-sm truncate transition-colors ${
        active ? 'bg-brand/10 text-brand' : 'text-ink hover:bg-brand/15 hover:text-brand'
      } ${className}`}
    >
      {children}
    </button>
  )
}
