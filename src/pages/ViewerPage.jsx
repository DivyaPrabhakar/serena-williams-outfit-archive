import { useEffect, useState, useMemo, useRef } from "react";
import { fetchOutfits } from "../lib/api";
import { ACTIVE_YEARS, DISCIPLINES, COLOR_MAP } from "../lib/constants";
import {
  getRoundsForSlot,
  getRoundLabel,
  getCombinedSlotStatus,
  slotsForYear,
} from "../lib/rounds";
import { sortTournaments, TOURNAMENT_ORDER } from "../lib/filterUtils";
import { readStorage, writeStorage } from "../lib/storage";
import { useFilterParams } from "../hooks/useFilterParams";
import { useSettings } from "../hooks/useSettings";
import FilterPanel from "../components/filters/FilterPanel";
import GalleryGrid from "../components/gallery/GalleryGrid";
import Lightbox from "../components/gallery/Lightbox";
import SettingsPanel from "../components/SettingsPanel";
import MissingPanel from "../components/gallery/MissingPanel";

export default function ViewerPage() {
  const { activeTournament, activeYear, activeBrand, activeColor, setFilter, clearAllFilters } = useFilterParams();
  const [outfits, setOutfits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const [showSettings, setShowSettings] = useState(false);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [mode, setMode] = useState("condensed");
  const [panelOpen, setPanelOpen] = useState(
    () => readStorage(`serena_hunt_panel_condensed`, "false") === "true",
  );

  const [flatGrid, setFlatGrid] = useState(false);

  const { settings, updateSetting } = useSettings();
  const highlightTimerRef = useRef(null);

  function switchMode(m) {
    setMode(m);
    setPanelOpen(readStorage(`serena_hunt_panel_${m}`, "false") === "true");
  }

  function togglePanel() {
    setPanelOpen((prev) => {
      const next = !prev;
      if (next) setFilterPanelOpen(false);
      writeStorage(`serena_hunt_panel_${mode}`, next);
      return next;
    });
  }

  function closePanel() {
    setPanelOpen(false);
    writeStorage(`serena_hunt_panel_${mode}`, false);
  }

  useEffect(() => {
    fetchOutfits()
      .then((data) => {
        data.sort((a, b) => {
          if (a.year !== b.year) return a.year - b.year;
          const ta = TOURNAMENT_ORDER.indexOf(a.tournament);
          const tb = TOURNAMENT_ORDER.indexOf(b.tournament);
          const tCmp = (ta === -1 ? 99 : ta) - (tb === -1 ? 99 : tb);
          if (tCmp !== 0) return tCmp;
          const da = DISCIPLINES.indexOf(a.discipline);
          const db = DISCIPLINES.indexOf(b.discipline);
          if (da !== db) return da - db;
          return (a.roundNumber ?? 0) - (b.roundNumber ?? 0);
        });
        setOutfits(data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // ── Missing item computation ───────────────────────────────────────────────

  const condensedMissing = useMemo(() => {
    if (!outfits.length) return [];
    const outfitKeys = new Set(outfits.map((o) => `${o.year}_${o.tournament}`));
    const items = [];
    for (const year of ACTIVE_YEARS) {
      for (const tournament of slotsForYear(year)) {
        if (
          !outfitKeys.has(`${year}_${tournament}`) &&
          getCombinedSlotStatus(tournament, year) === "played"
        ) {
          items.push({ year, tournament });
        }
      }
    }
    return items;
  }, [outfits]);

  const expandedMissing = useMemo(() => {
    if (!outfits.length) return [];
    const outfitKeys = new Set(
      outfits.map(
        (o) => `${o.year}_${o.tournament}_${o.discipline}_${o.roundNumber}`,
      ),
    );
    const items = [];
    for (const year of ACTIVE_YEARS) {
      for (const tournament of slotsForYear(year)) {
        for (const discipline of DISCIPLINES) {
          const rounds = getRoundsForSlot(tournament, year, discipline);
          for (let r = 1; r <= rounds; r++) {
            if (!outfitKeys.has(`${year}_${tournament}_${discipline}_${r}`)) {
              items.push({
                year,
                tournament,
                discipline,
                roundNumber: r,
                round: getRoundLabel(r),
              });
            }
          }
        }
      }
    }
    return items;
  }, [outfits]);

  const missingCount =
    mode === "condensed" ? condensedMissing.length : expandedMissing.length;

  // ── Scroll + highlight ─────────────────────────────────────────────────────

  function handleHighlight(item) {
    if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);

    // Clear any lingering highlight classes
    document
      .querySelectorAll(".slot-highlight")
      .forEach((el) => el.classList.remove("slot-highlight"));

    const id = item.roundNumber
      ? `slot-${item.year}-${item.tournament}-${item.discipline}-${item.roundNumber}`
      : `slot-${item.year}-${item.tournament}`;

    const el = document.getElementById(id);
    const yearEl = document.getElementById(`year-${item.year}`);

    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("slot-highlight");
      highlightTimerRef.current = setTimeout(
        () => el.classList.remove("slot-highlight"),
        2700,
      );
    } else if (yearEl) {
      yearEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  // ── Lightbox ───────────────────────────────────────────────────────────────

  const realOutfits = useMemo(
    () =>
      outfits.filter((o) => {
        if (activeTournament && o.tournament !== activeTournament) return false;
        if (activeYear && o.year !== activeYear) return false;
        if (activeBrand && o.brand !== activeBrand) return false;
        if (activeColor && !(o.colors ?? []).includes(activeColor)) return false;
        return true;
      }),
    [outfits, activeTournament, activeYear, activeBrand, activeColor],
  );

  function openLightbox(outfit) {
    const idx = realOutfits.findIndex((o) => o.id === outfit.id);
    if (idx !== -1) setLightboxIndex(idx);
  }

  // ── Brand/color pre-filtered outfits for the gallery grid ─────────────────

  const galleryOutfits = useMemo(() => {
    if (!activeBrand && !activeColor) return outfits;
    return outfits.filter(o => {
      if (activeBrand && o.brand !== activeBrand) return false;
      if (activeColor && !(o.colors ?? []).includes(activeColor)) return false;
      return true;
    });
  }, [outfits, activeBrand, activeColor]);

  // ── Derived filter data ────────────────────────────────────────────────────

  const uniqueTournaments = useMemo(
    () => sortTournaments([...new Set(outfits.map((o) => o.tournament))]),
    [outfits],
  );
  const uniqueYears = useMemo(
    () => [...new Set(outfits.map((o) => o.year))],
    [outfits],
  );
  const uniqueBrands = useMemo(
    () => [...new Set(outfits.map((o) => o.brand).filter(Boolean))],
    [outfits],
  );
  const uniqueColors = useMemo(() => {
    const used = new Set(outfits.flatMap((o) => o.colors ?? []))
    return Object.keys(COLOR_MAP).filter((c) => used.has(c))
  }, [outfits]);

  // ── Render ─────────────────────────────────────────────────────────────────

  const anyPanelOpen = panelOpen || filterPanelOpen;

  return (
    <div
      className={`min-h-screen bg-dark transition-[padding-right] duration-300 ${anyPanelOpen ? "md:pr-72" : ""}`}
    >
      {/* Sticky filter bar */}
      <div className="sticky top-28 z-30 bg-dark border-b border-dark3 px-3 py-3 relative">

        {/* ── Desktop bar ── */}
        <div className="hidden md:flex items-center gap-4">
          {/* View mode switcher */}
          <div className="flex rounded overflow-hidden border border-dark3 flex-shrink-0">
            {["condensed", "expanded"].map((m) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={`px-4 py-2 text-sm font-medium transition-colors capitalize ${
                  mode === m ? "bg-gold text-dark" : "text-muted hover:text-ink"
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          {/* Expanded layout toggle */}
          {mode === "expanded" && (
            <div className="flex rounded overflow-hidden border border-dark3 flex-shrink-0">
              {[["tournament", "By tournament"], ["grid", "Grid"]].map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setFlatGrid(val === "grid")}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    (val === "grid") === flatGrid ? "bg-gold text-dark" : "text-muted hover:text-ink"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {/* Right controls */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {!loading && missingCount > 0 && (
              <button
                onClick={togglePanel}
                className={`flex items-center gap-1.5 px-4 py-2 rounded text-sm font-medium transition-colors ${
                  panelOpen ? "bg-gold text-dark" : "bg-dark3 text-ink hover:text-white"
                }`}
              >
                Outfits yet to find
                <span className={panelOpen ? "text-dark/70" : "text-gold"}>
                  ({missingCount})
                </span>
              </button>
            )}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const next = !filterPanelOpen;
                  setFilterPanelOpen(next);
                  if (next) setPanelOpen(false);
                  setShowSettings(false);
                }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded text-sm font-medium transition-colors ${
                  filterPanelOpen || activeTournament || activeYear || activeBrand || activeColor
                    ? "bg-gold text-dark"
                    : "bg-dark3 text-ink hover:text-white"
                }`}
              >
                <span>Filter</span>
                {(activeTournament || activeYear || activeBrand || activeColor) && (
                  <span className="text-dark/60">
                    {[activeTournament, activeYear, activeBrand, activeColor].filter(Boolean).join(" · ")}
                  </span>
                )}
              </button>
              {(activeTournament || activeYear || activeBrand || activeColor) && (
                <button
                  onClick={clearAllFilters}
                  className="text-muted hover:text-ink text-base leading-none transition-colors"
                  aria-label="Clear filters"
                  title="Clear filters"
                >
                  ×
                </button>
              )}
            </div>
            <button
              onClick={() => { setShowSettings((s) => !s); setFilterPanelOpen(false); }}
              className={`flex items-center gap-1.5 text-sm underline transition-colors ${
                showSettings ? "text-ink" : "text-muted hover:text-ink"
              }`}
              aria-label="Display settings"
            >
              <span>⚙</span>
              <span>Display settings</span>
            </button>
          </div>
        </div>

        {/* ── Mobile bar ── */}
        <div className="flex md:hidden items-center gap-3">
          {/* View mode switcher */}
          <div className="flex rounded overflow-hidden border border-dark3 flex-shrink-0">
            {["condensed", "expanded"].map((m) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={`px-3 py-2 text-sm font-medium transition-colors capitalize ${
                  mode === m ? "bg-gold text-dark" : "text-muted hover:text-ink"
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          {/* Active filter pill */}
          {(activeTournament || activeYear || activeBrand || activeColor) && (
            <span className="text-xs bg-gold text-dark rounded px-2 py-1 truncate max-w-[130px]">
              {[activeTournament, activeYear, activeBrand, activeColor].filter(Boolean).join(" · ")}
            </span>
          )}

          {/* More button */}
          <button
            onClick={() => setMobileMenuOpen((o) => !o)}
            className={`ml-auto flex items-center gap-1.5 px-3 py-2 rounded text-sm font-medium transition-colors ${
              mobileMenuOpen || filterPanelOpen || panelOpen || showSettings
                ? "bg-gold text-dark"
                : "bg-dark3 text-ink"
            }`}
            aria-label="Open controls"
          >
            {mobileMenuOpen ? "✕" : "⋯"}
          </button>
        </div>

        {/* ── Mobile dropdown ── */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-2 space-y-2">
            {/* Expanded layout toggle */}
            {mode === "expanded" && (
              <div className="flex rounded overflow-hidden border border-dark3">
                {[["tournament", "By tournament"], ["grid", "Grid"]].map(([val, label]) => (
                  <button
                    key={val}
                    onClick={() => setFlatGrid(val === "grid")}
                    className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                      (val === "grid") === flatGrid ? "bg-gold text-dark" : "text-muted hover:text-ink"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}

            {/* Filter */}
            <button
              onClick={() => {
                const next = !filterPanelOpen;
                setFilterPanelOpen(next);
                if (next) setPanelOpen(false);
                setShowSettings(false);
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-4 py-2 rounded text-sm font-medium transition-colors ${
                filterPanelOpen || activeTournament || activeYear || activeBrand || activeColor
                  ? "bg-gold text-dark"
                  : "bg-dark3 text-ink hover:text-white"
              }`}
            >
              <span>Filter</span>
              {(activeTournament || activeYear || activeBrand || activeColor) && (
                <span className="text-dark/60 text-xs">
                  {[activeTournament, activeYear, activeBrand, activeColor].filter(Boolean).join(" · ")}
                </span>
              )}
            </button>

            {/* Clear filters */}
            {(activeTournament || activeYear || activeBrand || activeColor) && (
              <button
                onClick={() => { clearAllFilters(); setMobileMenuOpen(false); }}
                className="w-full px-4 py-2 rounded text-sm bg-dark3 text-muted hover:text-ink transition-colors"
              >
                Clear filters
              </button>
            )}

            {/* Outfits yet to find */}
            {!loading && missingCount > 0 && (
              <button
                onClick={() => { togglePanel(); setMobileMenuOpen(false); }}
                className={`w-full flex items-center justify-between px-4 py-2 rounded text-sm font-medium transition-colors ${
                  panelOpen ? "bg-gold text-dark" : "bg-dark3 text-ink hover:text-white"
                }`}
              >
                <span>Outfits yet to find</span>
                <span className={panelOpen ? "text-dark/70" : "text-gold"}>({missingCount})</span>
              </button>
            )}

            {/* Display settings */}
            <button
              onClick={() => { setShowSettings((s) => !s); setFilterPanelOpen(false); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-2 px-4 py-2 rounded text-sm transition-colors bg-dark3 ${
                showSettings ? "text-ink" : "text-muted hover:text-ink"
              }`}
            >
              <span>⚙</span>
              <span>Display settings</span>
            </button>
          </div>
        )}
      </div>

      {/* Main gallery */}
      <main className="px-3 pt-10 pb-24 max-w-7xl mx-auto">
        {loading && (
          <div className="flex items-center justify-center py-32 text-muted text-sm">
            Loading…
          </div>
        )}
        {error && (
          <div className="flex items-center justify-center py-32 text-red-400 text-sm">
            Failed to load outfits: {error}
          </div>
        )}
        {!loading && !error && (
          <GalleryGrid
            outfits={galleryOutfits}
            activeTournament={activeTournament}
            activeYear={activeYear}
            settings={settings}
            mode={mode}
            flatGrid={flatGrid}
            onOpenLightbox={openLightbox}
          />
        )}
      </main>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox
          outfits={realOutfits}
          index={lightboxIndex}
          onNavigate={setLightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}

      {/* Settings panel */}
      {showSettings && (
        <SettingsPanel
          settings={settings}
          updateSetting={updateSetting}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* Filter panel */}
      {filterPanelOpen && (
        <FilterPanel
          tournaments={uniqueTournaments}
          activeTournament={activeTournament}
          onTournamentChange={v => setFilter('tournament', v)}
          years={uniqueYears}
          activeYear={activeYear}
          onYearChange={v => setFilter('year', v)}
          brands={uniqueBrands}
          activeBrand={activeBrand}
          onBrandChange={v => setFilter('brand', v)}
          colors={uniqueColors}
          activeColor={activeColor}
          onColorChange={v => setFilter('color', v)}
          onClose={() => setFilterPanelOpen(false)}
        />
      )}

      {/* Outfits yet to find panel */}
      {panelOpen && (
        <MissingPanel
          mode={mode}
          condensedItems={condensedMissing}
          expandedItems={expandedMissing}
          onHighlight={handleHighlight}
          onClose={closePanel}
        />
      )}
    </div>
  );
}
