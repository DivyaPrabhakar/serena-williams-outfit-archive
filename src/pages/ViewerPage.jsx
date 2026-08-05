import { useContext, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { fetchOutfits } from "../lib/api";
import { isGettyEmbed } from "../lib/imageUtils";
import { DISCIPLINES } from "../lib/constants";
import { TOURNAMENT_ORDER } from "../lib/filterUtils";
import { readStorage, writeStorage } from "../lib/storage";
import { useSettings } from "../hooks/useSettings";
import { useMissingOutfits } from "../hooks/useMissingOutfits";
import { useIsMobile } from "../hooks/useIsMobile";
import { HeaderSlotContext } from "../components/layout/HeaderSlot";
import Seo from "../lib/seo";
import { personRef } from "../lib/schema";
import { absoluteUrl } from "../lib/siteUrl";
import { snapshotOutfits } from "../lib/snapshot";
import { tournamentPath } from "../lib/slugs";
import FilterBar from "../components/layout/FilterBar";
import GroupingPanel from "../components/filters/GroupingPanel";
import GalleryGrid from "../components/gallery/GalleryGrid";
import GroupNav from "../components/gallery/GroupNav";
import { GroupNavProvider } from "../components/gallery/GroupNavContext";
import Lightbox from "../components/gallery/Lightbox";
import MissingPanel from "../components/gallery/MissingPanel";

export default function ViewerPage() {
  // Seed from the build-time snapshot so static generation and the first client
  // paint render the full gallery (real content for crawlers); the effect below
  // then refetches live data so users always see the latest.
  const [outfits, setOutfits] = useState(snapshotOutfits);
  const [loading, setLoading] = useState(snapshotOutfits.length === 0);
  const [error, setError] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const [groupingPanelOpen, setGroupingPanelOpen] = useState(false);
  const { slotEl } = useContext(HeaderSlotContext);

  const [panelOpen, setPanelOpen] = useState(
    () => readStorage(`serena_hunt_panel_expanded`, "false") === "true",
  );

  const [groupBy, setGroupByState] = useState(
    () => readStorage('serena_gallery_groupby', 'tournament'),
  );
  const [navCollapsed, setNavCollapsedState] = useState(
    () => readStorage('serena_groupnav_collapsed', 'false') === 'true',
  );
  const [sortBy, setSortByState] = useState(
    () => readStorage('serena_gallery_sortby', 'chronological'),
  );
  const [layout, setLayoutState] = useState(
    () => readStorage('serena_gallery_layout', 'vertical'),
  );

  const { settings } = useSettings();

  // On mobile the Layout toggle is hidden and the gallery always renders
  // stacked, so the user's stored layout only applies on desktop.
  const isMobile = useIsMobile();
  const effectiveLayout = isMobile ? 'vertical' : layout;

  const visibleOutfits = settings.hideGetty
    ? outfits.filter((o) => !isGettyEmbed(o.imageUrl))
    : outfits;

  // In the Getty-hidden (screenshot) view, show only populated cards: drop empty
  // round slots and "did not play / not held" placeholders, and hide the section
  // subtitles/stats so it reads as a clean, dense grid.
  const gallerySettings = settings.hideGetty
    ? { ...settings, showEmptySlots: false, showDimSlots: false, layout: effectiveLayout }
    : { ...settings, layout: effectiveLayout };

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
    if (value === groupBy) return;
    setGroupByState(value);
    writeStorage('serena_gallery_groupby', value);
    // Reordering the gallery in place isn't obvious when scrolled down, so jump
    // back to the top to make the new grouping clearly land from the start.
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function setSortBy(value) {
    setSortByState(value);
    writeStorage('serena_gallery_sortby', value);
  }

  function setLayout(value) {
    setLayoutState(value);
    writeStorage('serena_gallery_layout', value);
  }

  function toggleNavCollapsed() {
    setNavCollapsedState((prev) => {
      const next = !prev;
      writeStorage('serena_groupnav_collapsed', next);
      return next;
    });
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
    const idx = visibleOutfits.findIndex((o) => o.id === outfit.id);
    if (idx !== -1) setLightboxIndex(idx);
  }

  const anyPanelOpen = panelOpen || groupingPanelOpen;

  const homeJsonLd = (() => {
    const seen = new Map();
    for (const o of outfits) {
      const p = tournamentPath(o.tournament, o.year);
      if (!seen.has(p)) seen.set(p, `${o.tournament} ${o.year}`);
    }
    const items = [...seen.entries()];
    return [
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "Serena Williams Fit-dex",
        url: absoluteUrl("/"),
        description:
          "A complete visual archive of Serena Williams' on-court tournament outfits.",
      },
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "Serena Williams Outfits Archive",
        about: personRef(),
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: items.length,
          itemListElement: items.map(([p, name], i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: absoluteUrl(p),
            name,
          })),
        },
      },
    ];
  })();

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
      layout={layout}
      onLayoutChange={setLayout}
    />
  );

  return (
    <GroupNavProvider>
    <div
      className={`min-h-screen bg-dark transition-[padding] duration-300 ${anyPanelOpen ? "md:pr-72" : ""} ${navCollapsed ? "lg:pl-10" : "lg:pl-52"}`}
    >
      <Seo
        title="Serena Williams Outfits — Every Tournament Look | Serena Williams Fit-dex"
        description="A complete visual archive of Serena Williams' outfits — every on-court look catalogued by tournament, year, discipline, and round, from 1995 to today."
        path="/"
        jsonLd={homeJsonLd}
      />
      <h1 className="sr-only">
        Serena Williams Outfits — every on-court tournament look, catalogued by
        year, tournament, discipline, and round
      </h1>

      {/* Desktop: portal controls into the centered header slot */}
      {slotEl && createPortal(controls, slotEl)}

      {/* Mobile: header slot is hidden, so render controls in normal flow */}
      <div className="lg:hidden sticky top-28 z-30 bg-dark border-b-2 border-white px-3 py-3 flex justify-center">
        {controls}
      </div>

      {/* Desktop-only left jump-nav populated by the rendered group headers */}
      <GroupNav groupBy={groupBy} collapsed={navCollapsed} onToggle={toggleNavCollapsed} />

      <main className="px-12 pt-10 pb-24 max-w-[1600px] mx-auto">
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
            outfits={visibleOutfits}
            groupBy={groupBy}
            sortBy={sortBy}
            settings={gallerySettings}
            onOpenLightbox={openLightbox}
          />
        )}
      </main>

      {lightboxIndex !== null && (
        <Lightbox
          outfits={visibleOutfits}
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
    </GroupNavProvider>
  );
}
