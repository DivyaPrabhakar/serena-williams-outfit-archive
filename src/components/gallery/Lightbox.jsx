import { useEffect } from 'react'
import { ROUND_LABELS, COLOR_MAP } from '../../lib/constants'

function MetaRow({ label, children }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-widest text-muted mb-0.5">{label}</dt>
      <dd className="text-sm text-ink leading-relaxed">{children}</dd>
    </div>
  )
}

export default function Lightbox({ outfits, index, onNavigate, onClose }) {
  const outfit = outfits[index]

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onNavigate((index - 1 + outfits.length) % outfits.length)
      if (e.key === 'ArrowRight') onNavigate((index + 1) % outfits.length)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [index, outfits.length, onClose, onNavigate])

  if (!outfit) return null

  return (
    <div
      className="fixed inset-0 z-50 bg-dark/90 flex items-center justify-center p-4 md:p-8"
      onClick={onClose}
    >
      <div
        className="flex flex-col md:flex-row w-full max-w-5xl max-h-[90vh] bg-dark2 rounded-xl overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Image */}
        <div className="flex-1 bg-dark min-h-0 flex items-center justify-center overflow-hidden">
          <img
            src={outfit.imageUrl}
            alt={`${outfit.tournament} ${outfit.year}`}
            className="w-full h-full object-contain"
          />
        </div>

        {/* Metadata panel */}
        <aside className="md:w-64 flex-shrink-0 flex flex-col bg-dark2 overflow-y-auto">
          <header className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-dark3">
            <h2 className="font-playfair text-gold text-xl leading-tight">{outfit.tournament}</h2>
            <button
              onClick={onClose}
              className="text-muted hover:text-ink text-2xl leading-none ml-3 mt-0.5 flex-shrink-0"
              aria-label="Close"
            >
              ×
            </button>
          </header>

          <dl className="flex-1 px-5 py-5 space-y-4">
            <MetaRow label="Year">{outfit.year}</MetaRow>
            <MetaRow label="Discipline">{outfit.discipline}</MetaRow>
            <MetaRow label="Round">
              {ROUND_LABELS[outfit.round] ?? outfit.round}
            </MetaRow>
            {outfit.colors?.length > 0 && (
              <div>
                <dt className="text-[10px] uppercase tracking-widest text-muted mb-2">Colors</dt>
                <dd className="flex flex-wrap gap-x-3 gap-y-1.5">
                  {outfit.colors.map(c => (
                    <span key={c} className="flex items-center gap-1.5">
                      <span
                        className="w-3 h-3 rounded-full flex-shrink-0 ring-1 ring-dark3"
                        style={{ background: COLOR_MAP[c] ?? c }}
                      />
                      <span className="text-xs text-ink">{c}</span>
                    </span>
                  ))}
                </dd>
              </div>
            )}
            {outfit.notes && (
              <MetaRow label="Notes">{outfit.notes}</MetaRow>
            )}
          </dl>

          <footer className="flex items-center justify-between px-5 py-4 border-t border-dark3">
            <button
              onClick={() => onNavigate((index - 1 + outfits.length) % outfits.length)}
              className="text-muted hover:text-gold text-sm transition-colors"
            >
              ← Prev
            </button>
            <span className="text-[10px] text-muted tabular-nums">
              {index + 1} / {outfits.length}
            </span>
            <button
              onClick={() => onNavigate((index + 1) % outfits.length)}
              className="text-muted hover:text-gold text-sm transition-colors"
            >
              Next →
            </button>
          </footer>
        </aside>
      </div>
    </div>
  )
}
