import { useId } from 'react';

/**
 * Decorative circular postmark (double ring with text running around the edge).
 * Colour comes from the parent via `currentColor`, e.g. className="text-gold-400/30".
 * It is purely decorative, so it is hidden from screen readers.
 */
export default function PostmarkSeal({ className = '' }) {
  // useId may contain ":" which is awkward inside url()/href fragments, so strip it.
  const pathId = `postmark-${useId().replace(/:/g, '')}`;
  return (
    <svg viewBox="0 0 160 160" className={className} aria-hidden="true" fill="none" stroke="currentColor">
      <defs>
        {/* Circle path (r=58) the ring text follows */}
        <path id={pathId} d="M80 80 m-58 0 a58 58 0 1 1 116 0 a58 58 0 1 1 -116 0" />
      </defs>
      <circle cx="80" cy="80" r="72" strokeWidth="2" />
      <circle cx="80" cy="80" r="40" strokeWidth="1.5" />
      <text fill="currentColor" stroke="none" fontSize="11" fontFamily="Playfair Display, serif">
        <textPath href={`#${pathId}`} textLength="356" lengthAdjust="spacing">
          PHILACONNECT · COLLECTORS · EST 2026 ·
        </textPath>
      </text>
      <text
        x="80"
        y="76"
        textAnchor="middle"
        fill="currentColor"
        stroke="none"
        fontSize="15"
        fontWeight="700"
        fontFamily="Playfair Display, serif"
      >
        POST
      </text>
      <text
        x="80"
        y="94"
        textAnchor="middle"
        fill="currentColor"
        stroke="none"
        fontSize="11"
        letterSpacing="3"
        fontFamily="Playfair Display, serif"
      >
        PAID
      </text>
    </svg>
  );
}
