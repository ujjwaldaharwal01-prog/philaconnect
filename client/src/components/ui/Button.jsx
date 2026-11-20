import { Link } from 'react-router-dom';

// Visual variants. "primary" and "outline" are designed for dark-green backgrounds;
// "dark" and "outlineDark" for light backgrounds.
const VARIANTS = {
  primary:
    'bg-gold-500 text-forest-950 hover:bg-gold-400 shadow-[0_8px_20px_-8px_rgba(184,146,58,0.8)]',
  dark: 'bg-forest-800 text-cream hover:bg-forest-700',
  outline: 'border border-gold-400/70 text-gold-300 hover:bg-gold-400/10',
  outlineDark: 'border border-forest-800/30 text-forest-800 hover:bg-forest-800/5',
};

/**
 * Reusable button.
 * - Pass `to` to render a router <Link>; otherwise a real <button>.
 * - `variant` picks the colour scheme; extra props (onClick, type, aria-*) pass through.
 */
export default function Button({ to, variant = 'primary', className = '', children, ...rest }) {
  const classes = [
    'inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold tracking-wide',
    'transition duration-300 motion-safe:hover:-translate-y-0.5',
    VARIANTS[variant] ?? VARIANTS.primary,
    className,
  ].join(' ');

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" className={classes} {...rest}>
      {children}
    </button>
  );
}
