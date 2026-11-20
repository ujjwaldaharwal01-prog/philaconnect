import { Link } from 'react-router-dom';
import SectionHeading from '../ui/SectionHeading';
import Reveal from '../ui/Reveal';
import StampArt from '../ui/StampArt';
import StampFrame from '../ui/StampFrame';
import { categories } from '../../data/home';
import { PALETTES } from '../../data/stamps';

/** "Browse by theme" tiles. Each links to the marketplace pre-filtered by category (?category=...). */
export default function CategoryGrid() {
  return (
    <section className="bg-cream py-20" aria-labelledby="categories-title">
      <div className="container-page">
        <div id="categories-title">
          <SectionHeading
            eyebrow="Collect by theme"
            title="Browse by category"
            description="Whether you chase birds, locomotives or lunar missions, there is a shelf for you."
          />
        </div>

        <ul className="mt-12 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3">
          {categories.map((cat, i) => (
            <Reveal as="li" key={cat.name} delay={(i % 3) * 90}>
              <Link
                to={`/marketplace?category=${encodeURIComponent(cat.name)}`}
                className="group flex h-full items-center gap-4 rounded-2xl border border-forest-800/10 bg-offwhite p-4 shadow-card transition duration-300 motion-safe:hover:-translate-y-1 hover:border-gold-500/60 hover:shadow-card-hover sm:gap-5 sm:p-5"
              >
                <StampFrame
                  padding="p-2"
                  className="w-16 shrink-0 transition duration-500 motion-safe:group-hover:rotate-3 sm:w-20"
                >
                  <StampArt
                    scene={cat.scene}
                    palette={PALETTES[cat.paletteKey]}
                    className="block w-full"
                    country=""
                  />
                </StampFrame>
                <div className="min-w-0">
                  <h3 className="text-base font-semibold leading-snug text-forest-900 sm:text-lg">{cat.name}</h3>
                  <p className="mt-1 text-sm text-ink/60">{cat.blurb}</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
