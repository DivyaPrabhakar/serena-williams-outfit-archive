import { Link, useParams } from 'react-router-dom'
import { tournamentHubFromParam, tournamentPath } from '../lib/slugs'
import { sortByDisciplineRound, firstPhotoUrl } from '../lib/galleryUtils'
import { tournamentHubHeading, tournamentHubTitle, tournamentHubDescription } from '../lib/outfitText'
import { collectionPageJsonLd } from '../lib/jsonLd'
import Seo from '../lib/seo'
import OutfitGrid from '../components/gallery/OutfitGrid'
import NotFoundNotice from '../components/NotFoundNotice'

export default function TournamentHubPage() {
  const params = useParams()
  const data = tournamentHubFromParam(params.tournamentHub)

  if (!data) {
    return <NotFoundNotice path={`/${params.tournamentHub}`} />
  }

  const { tournament, outfits, years } = data
  const path = `/${params.tournamentHub}`

  return (
    <div className="min-h-screen bg-dark px-3 py-10">
      <Seo
        title={tournamentHubTitle(tournament)}
        description={tournamentHubDescription(tournament, outfits.length, years)}
        path={path}
        image={firstPhotoUrl(outfits)}
        jsonLd={collectionPageJsonLd({
          name: tournamentHubHeading(tournament),
          items: years.map((y) => ({ url: tournamentPath(tournament, y), name: `${tournament} ${y}` })),
        })}
      />

      <div className="max-w-[1600px] mx-auto lg:flex lg:gap-8">
        {/* Years rail — laid out like the homepage jump-to-section panel, but each
            entry links to that year's dedicated page. */}
        <aside className="hidden lg:block lg:w-48 flex-shrink-0">
          <div className="sticky top-28">
            <h2 className="font-playfair text-brand text-sm px-4 py-4 border-b-2 border-white">Years</h2>
            <nav className="py-2">
              {years.map((y) => (
                <Link
                  key={y}
                  to={tournamentPath(tournament, y)}
                  className="block px-4 py-2 text-sm border-l-2 border-transparent text-muted hover:text-brand hover:border-brand transition-colors"
                >
                  {y}
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          <nav className="text-xs text-muted mb-6" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-ink underline">Archive</Link>
          </nav>

          <h1 className="text-3xl sm:text-4xl text-ink font-medium leading-tight mb-2">
            {tournamentHubHeading(tournament)}
          </h1>
          <p className="text-muted mb-6">
            {outfits.length} {outfits.length === 1 ? 'outfit' : 'outfits'} across{' '}
            {years.length} {years.length === 1 ? 'year' : 'years'}.
          </p>

          {/* Compact year links for small screens where the rail is hidden. */}
          <div className="flex flex-wrap gap-x-3 gap-y-1 mb-10 lg:hidden">
            {years.map((y) => (
              <Link key={y} to={tournamentPath(tournament, y)} className="text-sm text-brand/80 hover:text-brand underline-offset-2 hover:underline">
                {y}
              </Link>
            ))}
          </div>

          {years.map((y) => {
            const yearOutfits = sortByDisciplineRound(outfits.filter((o) => o.year === y))
            return (
              <section key={y} id={`year-${y}`} className="mb-12 scroll-mt-28">
                <h2 className="text-xl text-brand font-medium mb-4">
                  <Link to={tournamentPath(tournament, y)} className="hover:underline underline-offset-4">
                    {tournament} {y}
                  </Link>
                </h2>
                <OutfitGrid outfits={yearOutfits} />
              </section>
            )
          })}
        </div>
      </div>
    </div>
  )
}
