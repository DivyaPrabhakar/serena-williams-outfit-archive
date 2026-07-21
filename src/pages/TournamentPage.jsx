import { Link, useParams } from 'react-router-dom'
import { tournamentFromParams, pathForOutfit } from '../lib/slugs'
import { DISCIPLINES } from '../lib/constants'
import { outfitAlt, tournamentDescription, tournamentHeading, tournamentTitle } from '../lib/outfitText'
import Seo from '../lib/seo'
import { absoluteUrl } from '../lib/siteUrl'
import OutfitCard from '../components/gallery/OutfitCard'

const CARD_SETTINGS = { lightbox: false, colorDot: true, cardLabel: 'tournament' }

function sortOutfits(outfits) {
  return [...outfits].sort((a, b) => {
    const da = DISCIPLINES.indexOf(a.discipline)
    const db = DISCIPLINES.indexOf(b.discipline)
    if (da !== db) return da - db
    return (a.roundNumber ?? 0) - (b.roundNumber ?? 0)
  })
}

function itemListJsonLd(tournament, year, outfits) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: tournamentHeading(tournament, year),
    description: tournamentDescription(tournament, year, outfits.length),
    about: { '@type': 'Person', name: 'Serena Williams', sameAs: 'https://en.wikipedia.org/wiki/Serena_Williams' },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: outfits.length,
      itemListElement: outfits.map((o, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: absoluteUrl(pathForOutfit(o)),
        name: outfitAlt(o),
      })),
    },
  }
}

export default function TournamentPage() {
  const params = useParams()
  const data = tournamentFromParams(params)

  if (!data || data.outfits.length === 0) {
    return (
      <div className="min-h-screen bg-dark px-3 py-24 text-center">
        <Seo
          title="Tournament not found | Serena Williams Fit-dex"
          description="No Serena Williams outfits were found for this tournament."
          path={`/${params.tournament}/${params.year}`}
          noindex
        />
        <p className="text-ink text-xl mb-4">No outfits found for this tournament.</p>
        <Link to="/" className="text-gold underline">Back to the archive</Link>
      </div>
    )
  }

  const { tournament, year, outfits } = data
  const sorted = sortOutfits(outfits)
  const path = `/${params.tournament}/${year}`

  return (
    <div className="min-h-screen bg-dark px-3 py-10">
      <Seo
        title={tournamentTitle(tournament, year)}
        description={tournamentDescription(tournament, year, outfits.length)}
        path={path}
        image={sorted.find((o) => o.imageUrl && !o.imageUrl.trimStart().startsWith('<'))?.imageUrl}
        jsonLd={itemListJsonLd(tournament, year, sorted)}
      />

      <div className="max-w-[1600px] mx-auto">
        <nav className="text-xs text-muted mb-6" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-ink underline">Archive</Link>
        </nav>

        <h1 className="text-3xl sm:text-4xl text-ink font-medium leading-tight mb-2">
          {tournamentHeading(tournament, year)}
        </h1>
        <p className="text-muted mb-10">
          {outfits.length} {outfits.length === 1 ? 'outfit' : 'outfits'} catalogued.
        </p>

        <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 list-none p-0">
          {sorted.map((o) => (
            <li key={o.id}>
              <Link to={pathForOutfit(o)} className="block hover:opacity-90 transition-opacity" aria-label={outfitAlt(o)}>
                <OutfitCard outfit={o} settings={CARD_SETTINGS} />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
