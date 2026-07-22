import { Link } from 'react-router-dom'
import Seo from '../lib/seo'

// Shared "nothing here" fallback for the tournament + hub pages: a noindexed page
// with a link back to the archive, so unknown/empty routes degrade gracefully.
export default function NotFoundNotice({
  path,
  title = 'Tournament not found | Serena Williams Fit-dex',
  message = 'No outfits found for this tournament.',
}) {
  return (
    <div className="min-h-screen bg-dark px-3 py-24 text-center">
      <Seo
        title={title}
        description="No Serena Williams outfits were found for this tournament."
        path={path}
        noindex
      />
      <p className="text-ink text-xl mb-4">{message}</p>
      <Link to="/" className="text-gold underline">Back to the archive</Link>
    </div>
  )
}
