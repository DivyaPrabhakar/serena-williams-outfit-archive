import Seo from "../lib/seo";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-dark px-3 py-16">
      <Seo
        title="About the Serena Williams Fit-dex | Serena Williams Outfits Archive"
        description="The story behind the Serena Williams Fit-dex — an ongoing archive cataloguing every on-court Serena Williams outfit by tournament, year, discipline, and round."
        path="/about"
      />
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl text-ink uppercase tracking-widest font-medium leading-none mb-10">
          About
        </h1>

        <div className="mb-12 pb-8 border-b-2 border-white">
          <p className="text-brand text-base uppercase tracking-widest font-medium mb-6">
            Featured On
          </p>
          <div className="flex flex-wrap gap-x-12 gap-y-8">
            <div className="flex flex-col gap-2">
              <a
                href="https://racquetmag.com/fits-for-a-queen"
                target="_blank"
                rel="noopener noreferrer"
                className="block h-10 opacity-90 hover:opacity-100 transition-opacity"
              >
                <img
                  src="/press/racquet-magazine.png"
                  alt="Racquet Magazine"
                  className="h-full w-auto"
                />
              </a>
              <div className="flex flex-col gap-1 text-sm text-muted">
                <a
                  href="https://racquetmag.com/fits-for-a-queen"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-brand underline-offset-2 hover:underline transition-colors"
                >
                  Fits for a Queen ↗
                </a>
                <a
                  href="https://www.instagram.com/p/Da3juNOIK8T/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-brand underline-offset-2 hover:underline transition-colors"
                >
                  Instagram ↗
                </a>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <a
                href="https://www.densediscovery.com/issues/397"
                target="_blank"
                rel="noopener noreferrer"
                className="block h-14 opacity-90 hover:opacity-100 transition-opacity"
              >
                <img
                  src="/press/dense-discovery.png"
                  alt="Dense Discovery"
                  className="h-full w-auto"
                />
              </a>
              <a
                href="https://www.densediscovery.com/issues/397"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted hover:text-brand underline-offset-2 hover:underline transition-colors"
              >
                Issue #397 ↗
              </a>
            </div>

            <div className="flex flex-col gap-2">
              <a
                href="https://news.ycombinator.com/item?id=48906339"
                target="_blank"
                rel="noopener noreferrer"
                className="block h-10 opacity-90 hover:opacity-100 transition-opacity"
              >
                <img
                  src="/press/hacker-news.png"
                  alt="Hacker News"
                  className="h-full w-auto"
                />
              </a>
              <a
                href="https://news.ycombinator.com/item?id=48906339"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted hover:text-brand underline-offset-2 hover:underline transition-colors"
              >
                Front page discussion ↗
              </a>
            </div>
          </div>
        </div>

        <div className="space-y-5 text-ink text-xl leading-relaxed">
          <p className="text-brand text-base uppercase tracking-widest font-medium mb-4">
            The Project
          </p>
          <p>
            This is an ongoing effort to catalog every outfit Serena Williams
            has worn on-court: each round, discipline, and tournament from 1995
            to <s className="text-muted">her final match in 2022</s> the end of
            time (SHE&apos;S BAAAACK). The name takes its cue from the Pokédex —
            a complete compendium with one slot per entry and my obsessive goal
            of catching &apos;em all.
          </p>
        </div>

        <div className="mt-12 pt-8 border-t-2 border-white space-y-5 text-ink text-xl leading-relaxed">
          <p className="text-brand text-base uppercase tracking-widest font-medium mb-4">
            The Creator
          </p>
          <p>
            Divya Prabhakar has loved Serena since Prabhakar was four years old.
            She memorized Williams&apos;s life story for a 4th grade
            &quot;Living Museum&quot; project, saw Williams play in-person for
            the first time at age 8, and when Prabhakar gave birth in 2022, she
            watched what were then considered to be Serena&apos;s final career
            matches in between contractions.
          </p>
          <p>
            <a
              href="https://www.linkedin.com/in/divyaprabhakar/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand underline hover:text-brand-light transition-colors"
            >
              Prabhakar currently leads
            </a>{" "}
            Digital Products Design at{" "}
            <a
              href="https://formenergy.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand underline hover:text-brand-light transition-colors"
            >
              Form Energy
            </a>
            , building software for grid-scale energy storage. Outside of work,
            she creates projects that surface patterns in large visual datasets
            across her interests of fashion, culture, and art. View her work at{" "}
            <a
              href="https://divyaprabhakar.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand underline hover:text-brand-light transition-colors"
            >
              divyaprabhakar.com
            </a>
          </p>
        </div>

        <div className="mt-12 pt-8 border-t-2 border-white space-y-3">
          <p className="text-base text-muted">
            Contact:{" "}
            <a
              href="mailto:divyaworks1234@gmail.com"
              className="text-brand underline hover:text-brand-light transition-colors"
            >
              divyaworks1234@gmail.com
            </a>
          </p>
          <p className="text-base text-muted">
            Images sourced from publicly available press and archive
            photography.
          </p>
        </div>
      </div>
    </div>
  );
}
