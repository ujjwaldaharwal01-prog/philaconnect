import SectionHeading from '../ui/SectionHeading';
import Reveal from '../ui/Reveal';
import Button from '../ui/Button';
import StampCard from '../stamps/StampCard';
import { ArrowRight } from '../ui/Icons';
import { featuredStamps } from '../../data/stamps';

/** "Featured stamps" grid on the homepage, built from sample data. */
export default function FeaturedStamps() {
  return (
    <section className="bg-offwhite py-20" aria-labelledby="featured-title">
      <div className="container-page">
        <div id="featured-title">
          <SectionHeading
            eyebrow="Featured this week"
            title="Handpicked from the marketplace"
            description="A taste of what collectors are listing right now. Sample listings shown for demonstration."
          />
        </div>

        {featuredStamps.length === 0 ? (
          <p className="mt-12 text-center text-ink/60">No stamps to show yet. Check back soon.</p>
        ) : (
          <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredStamps.map((stamp, i) => (
              <Reveal as="li" key={stamp.id} delay={(i % 4) * 90}>
                <StampCard stamp={stamp} />
              </Reveal>
            ))}
          </ul>
        )}

        <div className="mt-12 text-center">
          <Button to="/marketplace" variant="dark">
            View all stamps <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
