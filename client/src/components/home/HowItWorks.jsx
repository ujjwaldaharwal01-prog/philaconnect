import SectionHeading from '../ui/SectionHeading';
import Reveal from '../ui/Reveal';
import { steps } from '../../data/home';

/** Three-step explainer. Numbered medallions are joined by a dashed "perforation" line on desktop. */
export default function HowItWorks() {
  return (
    <section className="bg-offwhite py-20" aria-labelledby="how-title">
      <div className="container-page">
        <div id="how-title">
          <SectionHeading eyebrow="Getting started" title="How PHILAConnect works" />
        </div>

        <ol className="relative mt-14 grid gap-10 md:grid-cols-3">
          <div
            aria-hidden="true"
            className="absolute left-[16%] right-[16%] top-7 hidden border-t-2 border-dashed border-gold-500/50 md:block"
          />
          {steps.map((step, i) => (
            <Reveal as="li" key={step.title} delay={i * 120} className="relative text-center">
              <span className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-full border-2 border-gold-500 bg-forest-900 font-display text-xl font-semibold text-gold-300">
                {i + 1}
              </span>
              <h3 className="mt-5 text-xl font-semibold text-forest-900">{step.title}</h3>
              <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-ink/65">{step.text}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
