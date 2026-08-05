import { Link, useParams } from 'react-router-dom'
import { outfitFromParams, tournamentPath, tournamentToSlug } from '../lib/slugs'
import { isGettyEmbed, isGettyLandscape, gettyEmbedForIframe } from '../lib/imageUtils'
import {
  outfitAlt,
  outfitDescription,
  outfitHeading,
  outfitHeadline,
  outfitSchemaDescription,
  outfitTitle,
  roundLabel,
} from '../lib/outfitText'
import {
  personRef,
  authorRef,
  publisherRef,
  sportsEventLd,
  outfitImageLd,
} from '../lib/schema'
import Seo from '../lib/seo'
import { absoluteUrl } from '../lib/siteUrl'
import ColorSwatch from '../components/ColorSwatch'

// Article for a single outfit. `about` links Serena (by @id) and the tournament
// SportsEvent; `image` carries the correct Getty attribution; `creator` (the
// outfit's brand) is distinct from the photo credit inside `image`. author /
// publisher resolve to the site-wide @graph in Layout.
function articleJsonLd(o, path) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: outfitHeadline(o),
    name: outfitHeading(o),
    description: outfitSchemaDescription(o),
    url: absoluteUrl(path),
    image: outfitImageLd(o, { name: outfitHeading(o), caption: outfitAlt(o) }),
    datePublished: o.createdAt || undefined,
    dateModified: o.updatedAt || o.createdAt || undefined,
    author: authorRef(),
    publisher: publisherRef(),
    about: [personRef(), sportsEventLd(o.tournament, o.year)],
    ...(o.brand ? { creator: { '@type': 'Organization', name: o.brand } } : {}),
  }
}

function MetaRow({ label, children }) {
  if (children == null || children === '') return null
  return (
    <div className="flex gap-3 py-2 border-b-2 border-white">
      <dt className="w-32 shrink-0 text-muted uppercase tracking-widest text-xs pt-0.5">{label}</dt>
      <dd className="text-ink">{children}</dd>
    </div>
  )
}

export default function OutfitPage() {
  const params = useParams()
  const outfit = outfitFromParams(params)

  if (!outfit) {
    return (
      <div className="min-h-screen bg-dark px-3 py-24 text-center">
        <Seo
          title="Outfit not found | Serena Williams Fit-dex"
          description="This Serena Williams outfit could not be found."
          path={'/' + [params.tournament, params.year, params.discipline, params.round].filter(Boolean).join('/')}
          noindex
        />
        <p className="text-ink text-xl mb-4">Outfit not found.</p>
        <Link to="/" className="text-brand underline">Back to the archive</Link>
      </div>
    )
  }

  const path = '/' + [params.tournament, params.year, params.discipline, params.round].filter(Boolean).join('/')
  const getty = isGettyEmbed(outfit.imageUrl)
  const landscape = getty && isGettyLandscape(outfit.imageUrl)
  const alt = outfitAlt(outfit)
  const colors = outfit.colors ?? []

  return (
    <div className="min-h-screen bg-dark px-3 py-10">
      <Seo
        title={outfitTitle(outfit)}
        description={outfitDescription(outfit)}
        path={path}
        image={getty ? undefined : outfit.imageUrl}
        type="article"
        jsonLd={articleJsonLd(outfit, path)}
      />

      <div className="max-w-3xl mx-auto">
        <nav className="text-xs text-muted mb-6 flex flex-wrap gap-1.5" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-ink underline">Archive</Link>
          <span>/</span>
          <Link to={tournamentPath(outfit.tournament, outfit.year)} className="hover:text-ink underline">
            {outfit.tournament} {outfit.year}
          </Link>
        </nav>

        <h1 className="text-3xl sm:text-4xl text-ink font-medium leading-tight mb-6">
          {outfitHeading(outfit)}
        </h1>

        <div className="mb-8 rounded overflow-hidden bg-dark3 max-w-md">
          <div className="relative aspect-[3/4]">
            {getty ? (
              <iframe
                title={alt}
                srcDoc={`<!DOCTYPE html><html><head><style>html,body{margin:0;padding:0;width:100%;height:100%;overflow:hidden;background:#111}body{display:flex;align-items:${landscape ? 'center' : 'flex-start'};justify-content:center;${landscape ? '' : 'margin-top:-44px;height:calc(100% + 44px)'}}</style></head><body>${gettyEmbedForIframe(outfit.imageUrl)}</body></html>`}
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-same-origin"
                loading="lazy"
              />
            ) : (
              <img src={outfit.imageUrl} alt={alt} className="w-full h-full object-cover" />
            )}
          </div>
        </div>

        <dl className="max-w-md">
          <MetaRow label="Tournament">
            <Link to={tournamentPath(outfit.tournament, outfit.year)} className="text-brand underline">
              {outfit.tournament} {outfit.year}
            </Link>
          </MetaRow>
          <MetaRow label="Discipline">{outfit.discipline}</MetaRow>
          <MetaRow label="Round">{roundLabel(outfit.round) || '—'}</MetaRow>
          <MetaRow label="Brand">{outfit.brand}</MetaRow>
          {colors.length > 0 && (
            <MetaRow label="Colours">
              <span className="flex items-center gap-2 flex-wrap">
                {colors.map((c, i) => (
                  <span key={i} className="flex items-center gap-1.5">
                    <ColorSwatch color={c} className="w-4 h-4 rounded-sm ring-1 ring-white/25" />
                    <span>{c}</span>
                  </span>
                ))}
              </span>
            </MetaRow>
          )}
          <MetaRow label="Notes">{outfit.notes}</MetaRow>
        </dl>

        <p className="mt-8 text-sm text-muted max-w-md">
          Part of the{' '}
          <Link to={`/${tournamentToSlug(outfit.tournament)}/${outfit.year}`} className="underline hover:text-ink">
            {outfit.year} {outfit.tournament}
          </Link>{' '}
          collection in the Serena Williams outfits archive.{' '}
          <Link to="/" className="underline hover:text-ink">Browse every outfit</Link>.
        </p>
      </div>
    </div>
  )
}
