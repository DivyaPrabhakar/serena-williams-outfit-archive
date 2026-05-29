import { useEffect, useState } from "react";
import { fetchOutfits } from "../lib/api";
import { DISCIPLINES } from "../lib/constants";
import { TOURNAMENT_ORDER } from "../lib/filterUtils";
import { readStorage, writeStorage } from "../lib/storage";
import { useSettings } from "../hooks/useSettings";
import { useMissingOutfits } from "../hooks/useMissingOutfits";
import FilterBar from "../components/layout/FilterBar";
import GroupingPanel from "../components/filters/GroupingPanel";
import GalleryGrid from "../components/gallery/GalleryGrid";
import Lightbox from "../components/gallery/Lightbox";
import SettingsPanel from "../components/SettingsPanel";
import MissingPanel from "../components/gallery/MissingPanel";

export default function ViewerPage() {
  const [outfits, setOutfits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const [showSettings, setShowSettings] = useState(false);
  const [groupingPanelOpen, setGroupingPanelOpen] = useState(false);

  const [mode, setMode] = useState("condensed");
  const [panelOpen, setPanelOpen] = useState(
    () => readStorage(`serena_hunt_panel_condensed`, "false") === "true",
  );

  const [flatGrid, setFlatGrid] = useState(false);
  const [groupBy, setGroupByState] = useState(
    () => readStorage('serena_gallery_groupby', 'year'),
  );

  const { settings, updateSetting } = useSettings();

  function switchMode(m) {
    setMode(m);
    setPanelOpen(readStorage(`serena_hunt_panel_${m}`, "false") === "true");
  }

  function togglePanel() {
    setPanelOpen((prev) => {
      const next = !prev;
      if (next) setGroupingPanelOpen(false);
      writeStorage(`serena_hunt_panel_${mode}`, next);
      return next;
    });
  }

  function closePanel() {
    setPanelOpen(false);
    writeStorage(`serena_hunt_panel_${mode}`, false);
  }

  function setGroupBy(value) {
    setGroupByState(value);
    writeStorage('serena_gallery_groupby', value);
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

  function openLightbox(outfit) {
    const idx = outfits.findIndex((o) => o.id === outfit.id);
    if (idx !== -1) setLightboxIndex(idx);
  }

  const anyPanelOpen = panelOpen || groupingPanelOpen;

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
        groupingPanelOpen={groupingPanelOpen}
        setGroupingPanelOpen={setGroupingPanelOpen}
        showSettings={showSettings}
        setShowSettings={setShowSettings}
        groupBy={groupBy}
      />

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
            outfits={outfits}
            groupBy={groupBy}
            settings={settings}
            mode={mode}
            flatGrid={flatGrid}
            onOpenLightbox={openLightbox}
          />
        )}
      </main>

      {lightboxIndex !== null && (
        <Lightbox
          outfits={outfits}
          index={lightboxIndex}
          onNavigate={setLightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}

      {showSettings && (
        <SettingsPanel
          settings={settings}
          updateSetting={updateSetting}
          onClose={() => setShowSettings(false)}
        />
      )}

      {groupingPanelOpen && (
        <GroupingPanel
          activeGrouping={groupBy}
          onGroupingChange={setGroupBy}
          onClose={() => setGroupingPanelOpen(false)}
        />
      )}

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
