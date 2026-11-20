import SectionHeading from '../ui/SectionHeading';
import Reveal from '../ui/Reveal';
import Button from '../ui/Button';
import { ArrowRight, SparkleIcon } from '../ui/Icons';
import ChatPanel from '../assistant/ChatPanel';
import useChat from '../assistant/useChat';

/**
 * Teaser for the AI assistant and recommendation features.
 * The chat box is live: it answers from the built-in guide in utils/assistant.js.
 */
export default function AIPreview() {
  const chat = useChat();
  return (
    <section className="relative overflow-hidden bg-forest-900 py-20 text-cream" aria-labelledby="ai-title">
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(ellipse at 15% 20%, rgba(184,146,58,0.2), transparent 50%), repeating-radial-gradient(circle at 10% 90%, rgba(212,175,90,0.06) 0 1px, transparent 1px 16px)',
        }}
      />

      <div className="container-page relative grid items-center gap-12 lg:grid-cols-2">
        <Reveal>
          <div id="ai-title">
            <SectionHeading
              align="left"
              light
              eyebrow="Smart collecting"
              title="Your personal philately assistant"
              description="Ask questions about grading, identification or value, and get stamp suggestions tuned to the countries, eras and themes you love."
            />
          </div>
          <ul className="mt-8 space-y-3 text-cream/85">
            {[
              'Recommendations that learn from your interests',
              'Instant answers to beginner and expert questions',
              'Budget-aware suggestions from the marketplace',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <SparkleIcon className="mt-0.5 h-5 w-5 shrink-0 text-gold-400" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="mt-9">
            <Button to="/recommendations" variant="primary">
              Try recommendations <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </Reveal>

        {/* Live chat */}
        <Reveal delay={150}>
          <div className="mx-auto w-full max-w-md overflow-hidden rounded-3xl border border-gold-400/30 bg-offwhite text-ink shadow-[0_30px_60px_-20px_rgba(0,0,0,0.7)]">
            <div className="flex items-center gap-3 bg-forest-800 px-5 py-4 text-cream">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-500 text-forest-950">
                <SparkleIcon className="h-5 w-5" />
              </span>
              <div>
                <p className="font-display text-base font-semibold leading-tight">PHILA Assistant</p>
                <p className="text-xs text-cream/65">Ask me anything about stamps</p>
              </div>
            </div>
            <ChatPanel {...chat} heightClass="h-80" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
