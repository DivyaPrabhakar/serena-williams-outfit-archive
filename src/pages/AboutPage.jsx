import { Link } from "react-router-dom";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-dark px-3 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-playfair text-4xl text-ink leading-none mb-1">
          About
        </h1>

        <div className="space-y-5 text-ink text-xl leading-relaxed">
          <p>
            Serena Williams is the greatest tennis player of all time. Over
            nearly three decades of Grand Slam competition she wore outfits that
            became iconic — from the 1999 US Open catsuit to the 2018 Wimbledon
            tutu. Each one is a moment frozen in sport and fashion history.
          </p>
          <p>
            This is an ongoing effort to catalog every outfit she wore at every
            major: each round, each discipline, each tournament from 1995 to her
            final match in 2022. The name takes its cue from the Pokédex — a
            complete compendium with one slot per entry and the obsessive goal
            of filling every last one.
          </p>
        </div>

        <div className="mt-12 pt-8 border-t border-dark3 space-y-5 text-ink text-xl leading-relaxed">
          <p className="text-ink text-base uppercase tracking-widest font-medium mb-4">
            The Creator
          </p>
          <p>
            <a
              href="https://divyaprabhakar.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold hover:text-gold-light transition-colors"
            >
              Divya Prabhakar
            </a>{" "}
            has loved Serena since she was four years old. She memorized her
            life story for a 4th grade "Living Museum" project, saw her play
            in-person for the first time at 13, and when she gave birth in 2022,
            Serena's final US Open matches were on in the delivery room.
          </p>
          <p>
            Being a tennis and fashion lover herself, she wanted to document
            every look Serena wore while dominating the sport. Seeing all the
            looks together is a new facet of her icon status.
          </p>
          <p>
            Half the fun is the hunt — tracking down obscure looks from deep
            cuts of match footage and decade-old press archives. Some outfits
            have been waiting a long time to be found.
          </p>
        </div>

        <div className="mt-12 pt-8 border-t border-dark3 flex items-center justify-between">
          <p className="text-base text-muted">
            Images sourced from publicly available press and archive
            photography.
          </p>
          <Link
            to="/submit"
            className="text-base text-gold hover:text-gold-light transition-colors flex-shrink-0 ml-6"
          >
            Submit an outfit →
          </Link>
        </div>
      </div>
    </div>
  );
}
