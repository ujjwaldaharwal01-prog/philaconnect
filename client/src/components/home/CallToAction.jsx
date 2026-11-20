import Button from '../ui/Button';
import Reveal from '../ui/Reveal';
import PostmarkSeal from '../ui/PostmarkSeal';

/** Final sign-up banner at the bottom of the homepage. */
export default function CallToAction() {
  return (
    <section className="bg-offwhite py-20" aria-labelledby="cta-title">
      <div className="container-page">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-gold-500/40 bg-forest-800 px-6 py-14 text-center text-cream shadow-card sm:px-12">
            <PostmarkSeal className="absolute -right-10 -top-10 h-52 w-52 rotate-12 text-gold-400/15" />
            <PostmarkSeal className="absolute -bottom-12 -left-10 h-44 w-44 -rotate-12 text-gold-400/10" />
            <h2 id="cta-title" className="relative mx-auto max-w-2xl text-3xl font-semibold sm:text-4xl">
              Start your collection with <span className="text-gold-400">PHILAConnect</span>
            </h2>
            <p className="relative mx-auto mt-4 max-w-xl text-cream/80">
              Create a free account to save favourites, get personalised recommendations and join the
              community.
            </p>
            <div className="relative mt-8 flex flex-wrap justify-center gap-4">
              <Button to="/login" variant="primary">
                Create your account
              </Button>
              <Button to="/marketplace" variant="outline">
                Browse stamps
              </Button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
