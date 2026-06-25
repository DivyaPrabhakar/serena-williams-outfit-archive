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

  const [panelOpen, setPanelOpen] = useState(
    () => readStorage(`serena_hunt_panel_expanded`, "false") === "true",
  );

  const [groupBy, setGroupByState] = useState(
    () => readStorage('serena_gallery_groupby', 'year'),
  );
  const [sortBy, setSortByState] = useState(
    () => readStorage('serena_gallery_sortby', 'chronological'),
  );

  const { settings, updateSetting } = useSettings();

  function togglePanel() {
    setPanelOpen((prev) => {
      const next = !prev;
      if (next) setGroupingPanelOpen(false);
      writeStorage(`serena_hunt_panel_expanded`, next);
      return next;
    });
  }

  function closePanel() {
    setPanelOpen(false);
    writeStorage(`serena_hunt_panel_expanded`, false);
  }

  function setGroupBy(value) {
    setGroupByState(value);
    writeStorage('serena_gallery_groupby', value);
  }

  function setSortBy(value) {
    setSortByState(value);
    writeStorage('serena_gallery_sortby', value);
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

  const { expandedMissing, foundCount, missingCount, totalMatches, handleHighlight } =
    useMissingOutfits(outfits, 'expanded');

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
        loading={loading}
        foundCount={foundCount}
        missingCount={missingCount}
        totalCount={totalMatches}
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
            sortBy={sortBy}
            settings={settings}
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
          sortBy={sortBy}
          onSortChange={setSortBy}
          onClose={() => setGroupingPanelOpen(false)}
        />
      )}

      {panelOpen && (
        <MissingPanel
          expandedItems={expandedMissing}
          onHighlight={handleHighlight}
          onClose={closePanel}
        />
      )}
    </div>
  );
}
