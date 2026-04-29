import { Link } from 'react-router-dom'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-dark px-6 py-16">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-playfair text-4xl text-ink leading-none mb-1">About</h1>
        <p className="text-gold text-sm italic mb-12">gotta find 'em all</p>

        <div className="space-y-5 text-muted text-sm leading-relaxed">
          <p>
            Serena Williams is the greatest tennis player of all time. Over nearly three decades
            of Grand Slam competition she wore outfits that became iconic — from the 1999 US Open
            catsuit to the 2018 Wimbledon tutu. Each one is a moment frozen in sport and fashion history.
          </p>
          <p>
            This is an ongoing effort to catalog every outfit she wore at every major: each round,
            each discipline, each tournament from 1995 to her final match in 2022. The name takes
            its cue from the Pokédex — a complete compendium with one slot per entry and the
            obsessive goal of filling every last one.
          </p>
          <p>
            Some outfits are easy to find. Others — buried in pre-internet TV archives, old Getty
            wire photos, or forgotten match footage — are still being tracked down. That's the hunt.
          </p>
        </div>

        <div className="mt-12 pt-8 border-t border-dark3 flex items-center justify-between">
          <p className="text-xs text-muted">
            Built by <span className="text-ink">Divya Prabhakar</span>
            {' · '}Images sourced from publicly available press and archive photography.
          </p>
          <Link
            to="/submit"
            className="text-xs text-gold hover:text-gold-light transition-colors flex-shrink-0 ml-6"
          >
            Submit an outfit →
          </Link>
        </div>
      </div>
    </div>
  )
}
