import { features } from '../../data/home';
import { ICONS } from '../ui/Icons';
import Reveal from '../ui/Reveal';

/** Four short value propositions shown right under the hero. */
export default function FeatureStrip() {
  return (
    <section className="border-b border-forest-800/10 bg-cream" aria-label="Why PHILAConnect">
      <div className="container-page grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature, i) => {
          const Icon = ICONS[feature.icon];
          return (
            <Reveal key={feature.title} delay={i * 90} className="flex gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-gold-500/50 bg-offwhite text-gold-600">
                {Icon && <Icon className="h-6 w-6" />}
              </span>
              <div>
                <h3 className="text-base font-semibold text-forest-900">{feature.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-ink/65">{feature.text}</p>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
