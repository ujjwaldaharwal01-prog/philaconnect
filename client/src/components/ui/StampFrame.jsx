/**
 * Gives any content a perforated postage-stamp border.
 *
 * Two nested elements are needed:
 *  - outer: applies a drop-shadow (a normal box-shadow would be cut off by the mask)
 *  - inner: the paper-coloured area with the perforated mask (.stamp-perf in index.css)
 *
 * Props:
 *  - className: positioning/size/rotation classes for the outer wrapper
 *  - paperClassName: background colour of the stamp paper
 *  - padding: inner padding (the "margin" between the perforation and the artwork)
 */
export default function StampFrame({
  children,
  className = '',
  paperClassName = 'bg-offwhite',
  padding = 'p-3',
}) {
  return (
    <div className={`drop-shadow-stamp ${className}`}>
      <div className={`stamp-perf ${paperClassName} ${padding}`}>{children}</div>
    </div>
  );
}
