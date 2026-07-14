export default function AboutPage() {
  return (
    <div className="min-h-screen bg-dark px-3 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl text-ink uppercase tracking-widest font-medium leading-none mb-10">
          About
        </h1>

        <div className="space-y-5 text-ink text-xl leading-relaxed">
          <p className="text-gold text-base uppercase tracking-widest font-medium mb-4">
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

        <div className="mt-12 pt-8 border-t border-dark3 space-y-5 text-ink text-xl leading-relaxed">
          <p className="text-gold text-base uppercase tracking-widest font-medium mb-4">
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
              className="text-gold underline hover:text-gold-light transition-colors"
            >
              Prabhakar currently leads
            </a>{" "}
            Digital Products Design at{" "}
            <a
              href="https://formenergy.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold underline hover:text-gold-light transition-colors"
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
              className="text-gold underline hover:text-gold-light transition-colors"
            >
              divyaprabhakar.com
            </a>
          </p>
        </div>

        <div className="mt-12 pt-8 border-t border-dark3 space-y-3">
          <p className="text-base text-muted">
            Contact:{" "}
            <a
              href="mailto:divyaworks1234@gmail.com"
              className="text-gold underline hover:text-gold-light transition-colors"
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
