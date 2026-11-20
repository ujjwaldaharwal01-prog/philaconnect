import useDocumentTitle from '../hooks/useDocumentTitle';
import Button from '../components/ui/Button';
import PostmarkSeal from '../components/ui/PostmarkSeal';
import { AUTHOR, BUILT_ON, OFFERINGS, PROBLEMS, TECH } from '../constants/about';

/**
 * About page (route: /about).
 * Text comes from constants/about.js. Sections: what it is, the problem, what it gives India,
 * who built it, how it was built, and the copyright line.
 */
export default function About() {
  useDocumentTitle('About');
  const initials = AUTHOR.split(' ').map((w) => w[0]).join('');

  return (
    <div className="bg-cream">
      <div className="container-page py-12">
        {/* Intro */}
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold-600">About us</p>
        <h1 className="mt-2 max-w-3xl text-4xl font-semibold leading-tight text-forest-900 sm:text-5xl">
          A smart digital home for India&rsquo;s stamp collectors
        </h1>
        <p className="mt-5 max-w-3xl text-lg leading-relaxed text-ink/75">
          PHILAConnect is a platform for philatelists, people who collect and study stamps. It brings a stamp marketplace, personalised
          recommendations and a collector community together in one place, so anyone in India can start, grow and share their collection.
        </p>

        {/* The problem */}
        <section aria-labelledby="problem" className="mt-14">
          <h2 id="problem" className="text-3xl font-semibold text-forest-900">
            The problem we set out to solve
          </h2>
          <p className="mt-3 max-w-3xl text-ink/70">
            The problem was identified by <strong className="text-forest-900">{AUTHOR}</strong>, who saw that stamp collecting in India is rich in
            heritage but poorly connected online.
          </p>
          <ul className="mt-6 grid gap-5 sm:grid-cols-2">
            {PROBLEMS.map((p) => (
              <li key={p.title} className="rounded-2xl border border-forest-800/10 bg-white p-6 shadow-card">
                <h3 className="font-display text-lg font-semibold text-forest-900">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/70">{p.text}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* What it gives India */}
        <section aria-labelledby="gives" className="mt-14 rounded-3xl bg-forest-900 p-8 text-cream shadow-card sm:p-10">
          <h2 id="gives" className="text-3xl font-semibold text-gold-300">
            What PHILAConnect gives India
          </h2>
          <ul className="mt-6 grid gap-6 md:grid-cols-2">
            {OFFERINGS.map((o) => (
              <li key={o.title} className="border-l-2 border-gold-500/60 pl-4">
                <h3 className="font-display text-lg font-semibold text-gold-200">{o.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-cream/80">{o.text}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Who built it */}
        <section aria-labelledby="maker" className="mt-14 grid items-center gap-8 md:grid-cols-[auto_1fr]">
          <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full border-4 border-gold-500/60 bg-parchment font-display text-4xl font-semibold text-forest-900" aria-hidden="true">
            {initials}
          </div>
          <div>
            <h2 id="maker" className="text-3xl font-semibold text-forest-900">
              Built by {AUTHOR}
            </h2>
            <p className="mt-3 max-w-2xl leading-relaxed text-ink/75">
              PHILAConnect was designed and developed by {AUTHOR} as a final-year academic project, first built in {BUILT_ON}. It is a full-stack web
              application: the website you see, a server that handles accounts, orders and the community, and a database that keeps everything safe.
            </p>
            <p className="mt-4 text-sm text-ink/60">
              Built with {TECH.join(', ')}.
            </p>
          </div>
        </section>

        {/* Honest note */}
        <p className="mt-12 rounded-xl bg-parchment p-4 text-sm leading-relaxed text-ink/70">
          <strong className="text-forest-900">Please note:</strong> this is an academic project. The stamp listings shown in the marketplace are sample
          data for demonstration, and no real payment is taken on this website.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Button to="/marketplace" variant="dark">
            Explore the marketplace
          </Button>
          <Button to="/community" variant="outlineDark">
            Join the community
          </Button>
        </div>

        {/* Copyright */}
        <footer className="mt-14 flex flex-wrap items-center gap-4 border-t border-forest-800/15 pt-6 text-sm text-ink/60">
          <PostmarkSeal className="h-16 w-16 shrink-0 text-gold-600" />
          <p>
            &copy; {new Date().getFullYear()} {AUTHOR}. All rights reserved.
            <br />
            PHILAConnect and its design, text and code are the work of {AUTHOR}.
          </p>
        </footer>
      </div>
    </div>
  );
}
