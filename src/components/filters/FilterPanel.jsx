import { sortTournaments } from '../../lib/filterUtils'
import FilterBtn from './FilterBtn'
import ColorSwatch from '../ColorSwatch'

export default function FilterPanel({
  tournaments,
  activeTournament,
  onTournamentChange,
  years,
  activeYear,
  onYearChange,
  brands,
  activeBrand,
  onBrandChange,
  colors,
  activeColor,
  onColorChange,
  onClose,
}) {
  const sortedTournaments = sortTournaments(tournaments)
  const sortedYears = [...years].sort((a, b) => a - b)
  const sortedBrands = [...brands].sort()
  const hasActive = activeTournament !== null || activeYear !== null || activeBrand !== null || activeColor !== null

  return (
    <div className="fixed right-0 top-28 bottom-0 z-[45] w-full sm:w-72 bg-dark2 border-l border-dark3 shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-dark3 flex-shrink-0">
          <h3 className="font-playfair text-gold text-base">Filters</h3>
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-sm font-medium text-ink bg-dark3 hover:bg-gold hover:text-dark rounded px-3 py-1.5 transition-colors"
            aria-label="Close filters"
          >
            <span className="text-lg leading-none">×</span>
            Close
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted mb-3">Tournament</p>
            <div className="flex flex-wrap gap-1.5">
              <FilterBtn active={activeTournament === null} onClick={() => onTournamentChange(null)}>
                All
              </FilterBtn>
              {sortedTournaments.map(t => (
                <FilterBtn
                  key={t}
                  active={activeTournament === t}
                  onClick={() => onTournamentChange(activeTournament === t ? null : t)}
                >
                  {t}
                </FilterBtn>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-widest text-muted mb-3">Year</p>
            <div className="flex flex-wrap gap-1.5">
              <FilterBtn active={activeYear === null} onClick={() => onYearChange(null)}>
                All
              </FilterBtn>
              {sortedYears.map(y => (
                <FilterBtn
                  key={y}
                  active={activeYear === y}
                  onClick={() => onYearChange(activeYear === y ? null : y)}
                >
                  {y}
                </FilterBtn>
              ))}
            </div>
          </div>

          {sortedBrands.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-widest text-muted mb-3">Brand</p>
              <div className="flex flex-wrap gap-1.5">
                <FilterBtn active={activeBrand === null} onClick={() => onBrandChange(null)}>
                  All
                </FilterBtn>
                {sortedBrands.map(b => (
                  <FilterBtn
                    key={b}
                    active={activeBrand === b}
                    onClick={() => onBrandChange(activeBrand === b ? null : b)}
                  >
                    {b}
                  </FilterBtn>
                ))}
              </div>
            </div>
          )}

          {colors.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-widest text-muted mb-3">Color</p>
              <div className="flex flex-wrap gap-1.5">
                <FilterBtn active={activeColor === null} onClick={() => onColorChange(null)}>
                  All
                </FilterBtn>
                {colors.map(c => (
                  <FilterBtn
                    key={c}
                    active={activeColor === c}
                    onClick={() => onColorChange(activeColor === c ? null : c)}
                  >
                    <ColorSwatch
                      color={c}
                      className="w-2.5 h-2.5 rounded-sm inline-block mr-1.5 flex-shrink-0 align-middle"
                    />
                    {c}
                  </FilterBtn>
                ))}
              </div>
            </div>
          )}
        </div>

        {hasActive && (
          <div className="px-5 py-4 border-t border-dark3 flex-shrink-0">
            <button
              onClick={() => { onTournamentChange(null); onYearChange(null); onBrandChange(null); onColorChange(null) }}
              className="w-full py-2 rounded text-xs font-medium bg-dark3 text-muted hover:text-ink transition-colors"
            >
              Clear all filters
            </button>
          </div>
        )}
    </div>
  )
}
