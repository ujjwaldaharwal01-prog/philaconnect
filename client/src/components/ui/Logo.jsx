import { Link } from 'react-router-dom';
import { SITE_NAME } from '../../constants/site';

/**
 * Brand mark: a tiny perforated stamp (dashed square) with a "P", plus the wordmark.
 * `light` switches the text colour for use on dark backgrounds.
 */
export default function Logo({ light = false }) {
  return (
    <Link to="/" className="group inline-flex items-center gap-2.5" aria-label={`${SITE_NAME} home`}>
      <svg viewBox="0 0 40 40" className="h-9 w-9" aria-hidden="true">
        <rect width="40" height="40" rx="7" fill="#14281F" />
        <rect
          x="5.5"
          y="5.5"
          width="29"
          height="29"
          fill="none"
          stroke="#D4AF5A"
          strokeWidth="3"
          strokeDasharray="2.2 3"
        />
        <text
          x="20"
          y="27"
          textAnchor="middle"
          fontFamily="Playfair Display, serif"
          fontSize="19"
          fontWeight="700"
          fill="#E3C77F"
        >
          P
        </text>
      </svg>
      <span
        className={`font-display text-xl font-semibold tracking-wide ${
          light ? 'text-cream' : 'text-forest-900'
        }`}
      >
        PHILA<span className="text-gold-500">Connect</span>
      </span>
    </Link>
  );
}
