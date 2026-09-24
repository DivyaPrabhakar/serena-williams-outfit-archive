// Small "go to page" affordance for category labels/headers that link to their
// own page (tournament hub, tournament+year) — the underline alone wasn't
// enough of a cue that the label is clickable.
export default function LinkArrowIcon({ className = '' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`w-[0.55em] h-[0.55em] flex-shrink-0 ${className}`}
      aria-hidden="true"
    >
      <line x1="7" y1="17" x2="17" y2="7" />
      <polyline points="7 7 17 7 17 17" />
    </svg>
  )
}
