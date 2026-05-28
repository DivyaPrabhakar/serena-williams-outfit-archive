import { filterByQuery } from '../../lib/adminUtils'
import { isGettyEmbed } from '../../lib/imageUtils'

const ROUND_ORDER = ['R1', 'R2', 'R3', 'R4', 'QF', 'SF', 'F']

export default function EntriesList({ outfits, onEdit, onDelete, search = '', onSearchChange }) {
  const filtered = filterByQuery(outfits, search)
    .sort((a, b) => {
      const tCmp = (a.tournament ?? '').localeCompare(b.tournament ?? '')
      if (tCmp !== 0) return tCmp
      const yCmp = (a.year ?? 0) - (b.year ?? 0)
      if (yCmp !== 0) return yCmp
      const aRound = ROUND_ORDER.indexOf(a.round ?? '')
      const bRound = ROUND_ORDER.indexOf(b.round ?? '')
      return (aRound === -1 ? 99 : aRound) - (bRound === -1 ? 99 : bRound)
    })

  const handleDelete = (id) => {
    if (!window.confirm('Delete this outfit?')) return
    onDelete(id)
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={e => onSearchChange?.(e.target.value)}
        placeholder="Search by tournament, year, discipline, round…"
        className="w-full bg-[#0D0D0D] border border-[#333] text-[#F0EDE6] px-3 py-2 text-sm outline-none focus:border-[#C9A84C] placeholder-[#3a3a3a]"
      />

      {/* Count */}
      <p className="text-xs text-[#8A877F] tracking-wide uppercase">
        {filtered.length} / {outfits.length} entries
      </p>

      {/* List */}
      {filtered.length === 0 ? (
        <p className="text-[#555] text-sm py-4">
          {search.trim() ? 'No results.' : 'No outfits added yet.'}
        </p>
      ) : (
        <div className="flex flex-col gap-px">
          {filtered.map(o => (
            <div
              key={o.id}
              className="flex items-center gap-3 bg-[#1A1A1A] px-3 py-2.5"
            >
              {/* Thumbnail */}
              {isGettyEmbed(o.imageUrl) ? (
                <div className="w-10 h-14 flex-shrink-0 bg-[#1e1e1e] flex items-center justify-center">
                  <span className="text-[8px] text-[#555] uppercase tracking-wide">Getty</span>
                </div>
              ) : (
                <img
                  src={o.imageUrl}
                  alt=""
                  className="w-10 h-14 object-cover flex-shrink-0 bg-[#111]"
                  onError={e => { e.target.style.background = '#222' }}
                />
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="text-sm text-[#F0EDE6] truncate">
                  {[o.tournament, o.year].filter(Boolean).join(' ')}
                  {o.discipline && (
                    <span className="text-[#8A877F]"> · {o.discipline}</span>
                  )}
                  {o.round && (
                    <span className="text-[#8A877F]"> · {o.round}</span>
                  )}
                </div>
                {o.colors?.length > 0 && (
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {o.colors.map(c => (
                      <span
                        key={c}
                        className="text-[10px] text-[#555] border border-[#252525] px-1.5 py-0.5"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-1.5 flex-shrink-0">
                <button
                  onClick={() => onEdit(o)}
                  className="text-xs border border-[#333] text-[#8A877F] px-2.5 py-1 hover:border-[#C9A84C] hover:text-[#C9A84C] transition-colors cursor-pointer"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(o.id)}
                  className="text-xs border border-[#333] text-[#8A877F] px-2.5 py-1 hover:border-red-500 hover:text-red-400 transition-colors cursor-pointer"
                >
                  Del
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
