/**
 * Consistent section title block: small gold eyebrow, serif title, ornament and description.
 * - `align`: "center" (default) or "left".
 * - `light`: use light text colours on dark backgrounds.
 */
export default function SectionHeading({ eyebrow, title, description, align = 'center', light = false }) {
  const isLeft = align === 'left';
  return (
    <div className={`max-w-2xl ${isLeft ? 'text-left' : 'mx-auto text-center'}`}>
      {eyebrow && (
        <p
          className={`mb-3 text-xs font-semibold uppercase tracking-[0.28em] ${
            light ? 'text-gold-300' : 'text-gold-600'
          }`}
        >
          {eyebrow}
        </p>
      )}
      <h2
        className={`text-3xl font-semibold leading-tight sm:text-4xl ${
          light ? 'text-cream' : 'text-forest-900'
        }`}
      >
        {title}
      </h2>
      {/* Small philatelic ornament: line – diamond – line */}
      <div className={`mt-4 flex items-center gap-3 ${isLeft ? '' : 'justify-center'}`} aria-hidden="true">
        <span className="h-px w-12 bg-gold-500/60" />
        <span className="h-2 w-2 rotate-45 bg-gold-500" />
        <span className="h-px w-12 bg-gold-500/60" />
      </div>
      {description && (
        <p className={`mt-4 text-base leading-relaxed ${light ? 'text-cream/80' : 'text-ink/70'}`}>
          {description}
        </p>
      )}
    </div>
  );
}
