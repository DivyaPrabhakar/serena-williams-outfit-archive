import { useEffect, useState, useMemo } from "react";
import { fetchOutfits } from "../lib/api";
import { DISCIPLINES, COLOR_MAP } from "../lib/constants";
import { TOURNAMENT_ORDER, sortTournaments } from "../lib/filterUtils";
import { readStorage, writeStorage } from "../lib/storage";
import { useFilterParams } from "../hooks/useFilterParams";
import { useSettings } from "../hooks/useSettings";
import { useMissingOutfits } from "../hooks/useMissingOutfits";
import FilterBar from "../components/layout/FilterBar";
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

  const [showSettings, setShowSettings]     = useState(false);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);

  const [mode, setMode] = useState("condensed");
  const [panelOpen, setPanelOpen] = useState(
    () => readStorage(`serena_hunt_panel_condensed`, "false") === "true",
  );

  const [flatGrid, setFlatGrid] = useState(false);

  const { settings, updateSetting } = useSettings();

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

  const { condensedMissing, expandedMissing, missingCount, handleHighlight } =
    useMissingOutfits(outfits, mode);

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
      <FilterBar
        mode={mode}
        switchMode={switchMode}
        flatGrid={flatGrid}
        setFlatGrid={setFlatGrid}
        loading={loading}
        missingCount={missingCount}
        panelOpen={panelOpen}
        togglePanel={togglePanel}
        setPanelOpen={setPanelOpen}
        filterPanelOpen={filterPanelOpen}
        setFilterPanelOpen={setFilterPanelOpen}
        showSettings={showSettings}
        setShowSettings={setShowSettings}
        activeTournament={activeTournament}
        activeYear={activeYear}
        activeBrand={activeBrand}
        activeColor={activeColor}
        clearAllFilters={clearAllFilters}
      />

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
