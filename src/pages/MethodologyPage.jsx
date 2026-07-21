import Seo from "../lib/seo";

export default function MethodologyPage() {
  return (
    <div className="min-h-screen bg-dark px-3 py-16">
      <Seo
        title="How the Archive Works | Serena Williams Fit-dex"
        description="The methodology behind the Serena Williams Fit-dex: the found/unfound cataloging system and how Getty images are embedded in a licensing-compliant way."
        path="/methodology"
      />
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl text-ink uppercase tracking-widest font-medium leading-none mb-10">
          How the Archive Works
        </h1>

        <div className="space-y-5 text-ink text-xl leading-relaxed">
          <p className="text-gold text-base uppercase tracking-widest font-medium mb-4">
            Found &amp; Unfound
          </p>
          <p>
            Every one of Serena&apos;s roughly 1,280 career matches is a slot in
            the Fit-dex. A slot is <em>found</em> once its outfit has been
            catalogued with a photo and its details &mdash; tournament, year,
            discipline, and round; until then it stays <em>unfound</em>, an open
            gap in the compendium. The running found count against that total is
            how the archive tracks its progress toward catching &apos;em all.
          </p>
        </div>

        <div className="mt-12 pt-8 border-t border-dark3 space-y-5 text-ink text-xl leading-relaxed">
          <p className="text-gold text-base uppercase tracking-widest font-medium mb-4">
            Getty-Embed Compliance
          </p>
          <p>
            Licensed Getty images are shown through Getty&apos;s official iframe
            embed rather than copied or rehosted, so the photos stay within their
            terms of use. Each embedded image&apos;s structured data links to its
            Getty license page (via <code>acquireLicensePage</code>) instead of a
            raw image URL, so rights holders are always credited and their work
            remains licensable.
          </p>
        </div>
      </div>
    </div>
  );
}
