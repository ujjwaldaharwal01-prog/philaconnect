import SectionHeading from '../ui/SectionHeading';
import Reveal from '../ui/Reveal';
import Button from '../ui/Button';
import { ArrowRight, MessageIcon } from '../ui/Icons';
import { discussions } from '../../data/home';

// Turns "Anaya R." into "AR" for the avatar circle.
const initials = (name) =>
  name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

/** Three sample discussion cards that tease the community section. */
export default function CommunityPreview() {
  return (
    <section className="bg-cream py-20" aria-labelledby="community-title">
      <div className="container-page">
        <div id="community-title">
          <SectionHeading
            eyebrow="Collector community"
            title="Join the conversation"
            description="Ask, show off and learn alongside collectors from around the world. Sample discussions shown."
          />
        </div>

        <ul className="mt-12 grid gap-6 md:grid-cols-3">
          {discussions.map((d, i) => (
            <Reveal as="li" key={d.id} delay={i * 100}>
              <article className="flex h-full flex-col rounded-2xl border border-forest-800/10 bg-offwhite p-6 shadow-card transition duration-300 motion-safe:hover:-translate-y-1 hover:shadow-card-hover">
                <span className="w-fit rounded-full bg-forest-800/10 px-3 py-1 text-xs font-semibold text-forest-800">
                  {d.tag}
                </span>
                <h3 className="mt-4 text-lg font-semibold leading-snug text-forest-900">{d.title}</h3>

                <div className="mt-auto flex items-center justify-between pt-6 text-sm text-ink/60">
                  <div className="flex items-center gap-3">
                    <span
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-forest-800 text-xs font-semibold text-gold-300"
                      aria-hidden="true"
                    >
                      {initials(d.author)}
                    </span>
                    <div className="leading-tight">
                      <p className="font-medium text-forest-900">{d.author}</p>
                      <p className="text-xs">{d.time}</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5">
                    <MessageIcon className="h-4 w-4" />
                    {d.replies}
                    <span className="sr-only"> replies</span>
                  </span>
                </div>
              </article>
            </Reveal>
          ))}
        </ul>

        <div className="mt-12 text-center">
          <Button to="/community" variant="dark">
            Visit the community <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
