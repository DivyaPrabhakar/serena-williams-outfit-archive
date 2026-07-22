import { Link, useParams } from 'react-router-dom'
import { tournamentFromParams, pathForOutfit } from '../lib/slugs'
import { sortByDisciplineRound, firstPhotoUrl } from '../lib/galleryUtils'
import { outfitAlt, tournamentDescription, tournamentHeading, tournamentTitle } from '../lib/outfitText'
import { collectionPageJsonLd } from '../lib/jsonLd'
import Seo from '../lib/seo'
import OutfitGrid from '../components/gallery/OutfitGrid'
import NotFoundNotice from '../components/NotFoundNotice'

export default function TournamentPage() {
  const params = useParams()
  const data = tournamentFromParams(params)

  if (!data || data.outfits.length === 0) {
    return <NotFoundNotice path={`/${params.tournament}/${params.year}`} />
  }

  const { tournament, year, outfits } = data
  const sorted = sortByDisciplineRound(outfits)
  const path = `/${params.tournament}/${year}`

  return (
    <div className="min-h-screen bg-dark px-3 py-10">
      <Seo
        title={tournamentTitle(tournament, year)}
        description={tournamentDescription(tournament, year, outfits.length)}
        path={path}
        image={firstPhotoUrl(sorted)}
        jsonLd={collectionPageJsonLd({
          name: tournamentHeading(tournament, year),
          description: tournamentDescription(tournament, year, outfits.length),
          items: sorted.map((o) => ({ url: pathForOutfit(o), name: outfitAlt(o) })),
        })}
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

        <OutfitGrid outfits={sorted} />
      </div>
    </div>
  )
}
