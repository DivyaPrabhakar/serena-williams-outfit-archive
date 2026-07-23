import Seo from "../lib/seo";
import { snapshotOutfits } from "../lib/snapshot";
import {
  headlineStats,
  grandSlamProgress,
  colorFrequency,
  brandCounts,
  colorsByYear,
  lastUpdatedISO,
} from "../lib/stats";
import GrandSlamBars from "../components/stats/GrandSlamBars";
import ColorHistogram from "../components/stats/ColorHistogram";
import BrandSplit from "../components/stats/BrandSplit";
import ColorsByYear from "../components/stats/ColorsByYear";

function Section({ title, children, divider = true }) {
  return (
    <section
      className={divider ? "mt-12 pt-8 border-t border-dark3" : "mt-10"}
    >
      <h2 className="text-gold text-base uppercase tracking-widest font-medium mb-6">
        {title}
      </h2>
      {children}
    </section>
  );
}

function formatDate(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function StatsPage() {
  // Computed live from the build-time dataset snapshot — nothing here is hardcoded.
  const outfits = snapshotOutfits;
  const head = headlineStats(outfits);
  const slams = grandSlamProgress(outfits);
  // Alphabetized — used for the fixed column order of the year matrix.
  const colors = colorFrequency(outfits);
  // Histograms are ordered greatest → smallest by usage.
  const byCount = (list) => [...list].sort((a, b) => b.count - a.count);
  const careerColors = byCount(colors);
  const finalsColors = byCount(colorFrequency(outfits.filter((o) => o.round === "F")));
  const brands = brandCounts(outfits);
  const yearColors = colorsByYear(outfits);
  const updated = formatDate(lastUpdatedISO(outfits));

  return (
    <div className="min-h-screen bg-dark px-3 py-16">
      <Seo
        title="By the Numbers | Serena Williams Fit-dex"
        description="Live statistics for the Serena Williams Fit-dex — outfits catalogued across tournaments and Grand Slams, color palettes by year, and cataloguing progress."
        path="/stats"
      />
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl text-ink uppercase tracking-widest font-medium leading-none mb-10">
          By the Numbers
        </h1>

        <p className="text-ink text-2xl leading-relaxed">
          <span className="text-gold">{head.found.toLocaleString()}</span> outfits
          found out of{" "}
          <span className="text-gold">{head.total.toLocaleString()}</span> she was
          known to wear
          {head.firstYear && head.lastYear
            ? ` — ${head.firstYear} to ${head.lastYear}`
            : ""}
          .
        </p>

        <hr className="border-t border-dark3 mt-16" />

        <h2 className="text-4xl text-ink uppercase tracking-widest font-medium leading-none mt-16 mb-10">
          What we know so far from the {head.found.toLocaleString()} outfits
        </h2>

        <Section title="Grand Slam Progress" divider={false}>
          <p className="text-muted text-base mb-6 leading-relaxed">
            Outfits logged so far against every round she actually played at each
            major.
          </p>
          <GrandSlamBars data={slams} />
        </Section>

        <Section title="Colors Worn — Career">
          <ColorHistogram data={careerColors} />
        </Section>

        <Section title="Colors Worn — Finals">
          <p className="text-muted text-base mb-6 leading-relaxed">
            Her palette when it mattered most — colors worn in tournament finals.
          </p>
          <ColorHistogram data={finalsColors} />
        </Section>

        <Section title="Nike vs. Puma">
          <BrandSplit brands={brands.brands} unspecified={brands.unspecified} />
        </Section>

        <Section title="Palette by Year">
          <p className="text-muted text-base mb-6 leading-relaxed">
            Distinct colors worn each year — skim for recurring themes and
            high-variation seasons.
          </p>
          <ColorsByYear data={yearColors} allColors={colors.map((c) => c.color)} />
        </Section>

        {updated && (
          <p className="mt-12 pt-8 border-t border-dark3 text-muted text-sm">
            Last updated: {updated}
          </p>
        )}
      </div>
    </div>
  );
}
