const FORM_URL = 'https://forms.gle/LKe7Cx1EjwSvcFFE8'

const FIELDS = [
  { label: 'Tournament', example: 'Wimbledon' },
  { label: 'Year',       example: '2003' },
  { label: 'Round',      example: 'R1 · QF · SF · Final' },
  { label: 'Discipline', example: 'Singles · Doubles · Mixed' },
  { label: 'Image URL',  example: 'Direct link to photo or Getty/wire image' },
  { label: 'Source',     example: 'Optional — photographer or archive credit' },
]

export default function SubmitPage() {
  return (
    <div className="min-h-screen bg-dark px-6 py-16">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-playfair text-4xl text-ink leading-none mb-3">Submit an outfit</h1>
        <p className="text-muted text-sm mb-12">
          Spotted an outfit that isn't in the Fit-dex yet? Send it in and it'll be reviewed for
          inclusion.
        </p>

        <h2 className="text-[10px] uppercase tracking-widest text-gold mb-4">What to include</h2>
        <div className="rounded border border-dark3 divide-y divide-dark3 mb-10">
          {FIELDS.map(({ label, example }) => (
            <div key={label} className="flex items-start gap-4 px-4 py-3">
              <span className="text-xs text-ink w-24 flex-shrink-0 pt-px">{label}</span>
              <span className="text-xs text-muted">{example}</span>
            </div>
          ))}
        </div>

        <h2 className="text-[10px] uppercase tracking-widest text-gold mb-4">How to submit</h2>
        <div className="space-y-3 mb-10">
          <p className="text-sm text-muted leading-relaxed">
            The easiest way is a direct image URL — a Getty wire link, an archived press photo, or
            any stable hosted image. If you only have a local file, attach it to the email. Either
            works.
          </p>
          <p className="text-sm text-muted leading-relaxed">
            Include the tournament, year, round, and discipline so the outfit can be slotted in
            precisely. Vague submissions ("somewhere at Wimbledon 2003") are harder to verify
            and may not make it in.
          </p>
        </div>

        <a
          href={FORM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded bg-gold text-dark text-sm font-medium hover:bg-gold-light transition-colors"
        >
          Open submission form
        </a>
        <p className="text-xs text-muted mt-3">
          Opens a short Google Form. Takes about a minute to fill in.
        </p>
      </div>
    </div>
  )
}
