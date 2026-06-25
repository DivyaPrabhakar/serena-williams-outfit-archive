import { useContext, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { fetchOutfits } from "../lib/api";
import { DISCIPLINES } from "../lib/constants";
import { TOURNAMENT_ORDER } from "../lib/filterUtils";
import { readStorage, writeStorage } from "../lib/storage";
import { useSettings } from "../hooks/useSettings";
import { useMissingOutfits } from "../hooks/useMissingOutfits";
import { HeaderSlotContext } from "../components/layout/HeaderSlot";
import FilterBar from "../components/layout/FilterBar";
import GroupingPanel from "../components/filters/GroupingPanel";
import GalleryGrid from "../components/gallery/GalleryGrid";
import Lightbox from "../components/gallery/Lightbox";
import MissingPanel from "../components/gallery/MissingPanel";

export default function ViewerPage() {
  const [outfits, setOutfits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const [groupingPanelOpen, setGroupingPanelOpen] = useState(false);
  const { slotEl } = useContext(HeaderSlotContext);

  const [panelOpen, setPanelOpen] = useState(
    () => readStorage(`serena_hunt_panel_expanded`, "false") === "true",
  );

  const [groupBy, setGroupByState] = useState(
    () => readStorage('serena_gallery_groupby', 'year'),
  );
  const [sortBy, setSortByState] = useState(
    () => readStorage('serena_gallery_sortby', 'chronological'),
  );

  const { settings } = useSettings();

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

  const { expandedMissing, foundCount, totalMatches, handleHighlight } =
    useMissingOutfits(outfits, 'expanded');

  function openLightbox(outfit) {
    const idx = outfits.findIndex((o) => o.id === outfit.id);
    if (idx !== -1) setLightboxIndex(idx);
  }

  const anyPanelOpen = panelOpen || groupingPanelOpen;

  const controls = (
    <FilterBar
      loading={loading}
      foundCount={foundCount}
      totalCount={totalMatches}
      panelOpen={panelOpen}
      togglePanel={togglePanel}
      setPanelOpen={setPanelOpen}
      groupingPanelOpen={groupingPanelOpen}
      setGroupingPanelOpen={setGroupingPanelOpen}
      groupBy={groupBy}
    />
  );

  return (
    <div
      className={`min-h-screen bg-dark transition-[padding-right] duration-300 ${anyPanelOpen ? "md:pr-72" : ""}`}
    >
      {/* Desktop: portal controls into the centered header slot */}
      {slotEl && createPortal(controls, slotEl)}

      {/* Mobile: header slot is hidden, so render controls in normal flow */}
      <div className="md:hidden sticky top-28 z-30 bg-dark border-b border-dark3 px-3 py-3 flex justify-center">
        {controls}
      </div>

      <main className="px-3 pt-10 pb-24 max-w-[1600px] mx-auto">
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
