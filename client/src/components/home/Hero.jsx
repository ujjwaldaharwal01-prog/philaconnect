import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import StampArt from '../ui/StampArt';
import StampFrame from '../ui/StampFrame';
import PostmarkSeal from '../ui/PostmarkSeal';
import { ArrowRight, SearchIcon } from '../ui/Icons';
import { stamps } from '../../data/stamps';
import { popularSearches } from '../../data/home';

const MAX_QUERY_LENGTH = 80;

// Three sample stamps used in the floating collage on the right.
const collage = [stamps[0], stamps[3], stamps[5]];

/**
 * Homepage hero: headline, search box, calls to action and a collage of stamps.
 * Submitting the search navigates to /marketplace?q=... (the marketplace page will
 * read the `q` parameter once it is built).
 */
export default function Hero() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed.length > MAX_QUERY_LENGTH) {
      setError(`Please keep your search under ${MAX_QUERY_LENGTH} characters.`);
      return;
    }
    setError('');
    navigate(trimmed ? `/marketplace?q=${encodeURIComponent(trimmed)}` : '/marketplace');
  };

  return (
    <section className="relative isolate overflow-hidden bg-forest-900 text-cream">
      {/* Engraved concentric-line texture + warm glow */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage:
            'repeating-radial-gradient(circle at 85% 15%, rgba(212,175,90,0.08) 0 1px, transparent 1px 16px), radial-gradient(ellipse at 80% 0%, rgba(184,146,58,0.22), transparent 55%)',
        }}
      />
      <PostmarkSeal className="absolute -bottom-16 -left-28 -z-10 h-56 w-56 -rotate-12 text-gold-400/15 sm:h-72 sm:w-72" />

      <div className="container-page grid items-center gap-12 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
        {/* Left: copy */}
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-gold-400/40 bg-gold-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-gold-300">
            <span className="h-1.5 w-1.5 rounded-full bg-gold-400" />
            For collectors, by collectors
          </p>

          <h1 className="mt-6 text-4xl font-semibold leading-[1.1] sm:text-5xl lg:text-6xl">
            Where every stamp
            <span className="block text-gold-400">finds its collector.</span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-cream/80">
            Discover rare and everyday treasures, join a community that shares your passion, and let
            smart recommendations guide you to your next great find.
          </p>

          {/* Search */}
          <form onSubmit={handleSubmit} className="mt-8 max-w-xl" role="search" noValidate>
            <label htmlFor="hero-search" className="sr-only">
              Search stamps by name, country or year
            </label>
            <div className="flex items-center gap-2 rounded-full bg-offwhite p-1.5 pl-5 shadow-[0_18px_40px_-18px_rgba(0,0,0,0.6)] focus-within:ring-2 focus-within:ring-gold-400">
              <SearchIcon className="h-5 w-5 shrink-0 text-forest-800/60" />
              <input
                id="hero-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, country or year…"
                aria-invalid={Boolean(error)}
                aria-describedby={error ? 'hero-search-error' : undefined}
                className="min-w-0 flex-1 bg-transparent py-2.5 text-base text-ink placeholder:text-ink/45 focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-full bg-forest-800 px-6 py-3 text-sm font-semibold text-gold-300 transition hover:bg-forest-700"
              >
                Search
              </button>
            </div>
            {error && (
              <p id="hero-search-error" role="alert" className="mt-2 pl-5 text-sm text-red-300">
                {error}
              </p>
            )}
          </form>

          <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-cream/70">
            <span>Popular:</span>
            {popularSearches.map((term) => (
              <Link
                key={term}
                to={`/marketplace?q=${encodeURIComponent(term)}`}
                className="rounded-full border border-cream/20 px-3 py-1 transition hover:border-gold-400 hover:text-gold-300"
              >
                {term}
              </Link>
            ))}
          </p>

          <div className="mt-9 flex flex-wrap gap-4">
            <Button to="/marketplace" variant="primary">
              Explore the marketplace <ArrowRight className="h-4 w-4" />
            </Button>
            <Button to="/recommendations" variant="outline">
              Get recommendations
            </Button>
          </div>
        </div>

        {/* Right: floating stamp collage */}
        <div className="relative mx-auto h-[400px] w-full max-w-md sm:h-[500px]" aria-hidden="true">
          <StampFrame className="absolute left-0 top-12 w-40 -rotate-[9deg] animate-float-slow sm:w-48">
            <StampArt {...collageProps(collage[0])} className="block w-full" />
          </StampFrame>
          <StampFrame className="absolute right-0 top-0 w-44 rotate-[7deg] animate-float sm:w-52">
            <StampArt {...collageProps(collage[1])} className="block w-full" />
          </StampFrame>
          <StampFrame className="absolute bottom-0 left-1/4 w-40 rotate-[2deg] animate-float-slow sm:w-48">
            <StampArt {...collageProps(collage[2])} className="block w-full" />
          </StampFrame>
        </div>
      </div>
    </section>
  );
}

// Picks only the props StampArt needs from a stamp record.
function collageProps({ scene, palette, country, year, denomination }) {
  return { scene, palette, country, year, denomination };
}
