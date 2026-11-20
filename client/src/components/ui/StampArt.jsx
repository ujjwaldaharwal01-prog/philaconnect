import { useId } from 'react';

/**
 * StampArt draws an ORIGINAL illustrated postage stamp as SVG (no image files needed).
 * It is not a reproduction of any real stamp design.
 *
 * Props:
 *  - scene: 'bird' | 'monument' | 'flower' | 'train' | 'ship' | 'rocket'
 *  - palette: { sky1, sky2, accent, accent2, ink, text } colours for the scene
 *  - country, year, denomination: printed on the stamp face
 *  - className: sizing classes (the SVG scales to its container, aspect ratio 5:6)
 *
 * Each scene function below receives the merged palette `p` and returns SVG shapes
 * drawn inside a 200 x 240 viewBox (printed text occupies roughly y<40 and y>205).
 */

const DEFAULT_PALETTE = {
  sky1: '#DDE8D5',
  sky2: '#BFD3B4',
  accent: '#2F6B4F',
  accent2: '#C9A24B',
  ink: '#1B2B22',
  text: '#1B2B22',
  paper: '#FBF4DF', // light "cream" used for columns, smoke, sails
};

const SCENES = {
  // A bird perched on a branch in front of a low sun.
  bird: (p) => (
    <g>
      <circle cx="150" cy="86" r="24" fill={p.accent2} opacity="0.85" />
      <path d="M20 168 Q100 150 190 172" stroke={p.ink} strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M52 162 q-8 -14 -24 -12 q8 14 24 12z" fill={p.accent} opacity="0.75" />
      <path d="M72 138 L28 172 L60 170 L88 150z" fill={p.accent2} />
      <ellipse cx="102" cy="124" rx="36" ry="28" fill={p.accent} transform="rotate(-20 102 124)" />
      <path d="M84 120 Q104 104 130 128 Q104 144 84 120z" fill={p.accent2} />
      <circle cx="132" cy="96" r="15" fill={p.accent} />
      <path d="M144 93 L164 100 L144 105z" fill={p.ink} />
      <circle cx="136" cy="93" r="2.6" fill={p.paper} />
      <circle cx="136.6" cy="93" r="1.2" fill={p.ink} />
      <path d="M98 150 v14 M110 147 v16" stroke={p.ink} strokeWidth="2.2" strokeLinecap="round" />
    </g>
  ),

  // A domed hall flanked by minarets/towers, with rolling hills.
  monument: (p) => (
    <g>
      <circle cx="100" cy="96" r="28" fill={p.accent2} opacity="0.7" />
      <path d="M0 192 Q60 160 100 178 T200 168 V205 H0z" fill={p.accent} opacity="0.45" />
      <rect x="98.5" y="72" width="3" height="16" fill={p.ink} />
      <circle cx="100" cy="70" r="4" fill={p.accent2} />
      <path d="M60 128 A40 40 0 0 1 140 128z" fill={p.accent} />
      <rect x="56" y="128" width="88" height="8" fill={p.ink} />
      {[66, 81, 96.5, 112, 127].map((x) => (
        <rect key={x} x={x} y="136" width="7" height="40" fill={p.paper} />
      ))}
      <rect x="50" y="176" width="100" height="9" fill={p.ink} />
      {[34, 158].map((x) => (
        <g key={x}>
          <rect x={x} y="108" width="9" height="77" fill={p.accent} />
          <path d={`M${x - 2} 108 L${x + 4.5} 94 L${x + 11} 108z`} fill={p.ink} />
        </g>
      ))}
    </g>
  ),

  // A six-petal flower on a stem with two leaves.
  flower: (p) => (
    <g>
      <path d="M0 196 Q70 170 130 186 T200 180 V205 H0z" fill={p.accent2} opacity="0.35" />
      <path d="M100 200 Q95 160 100 120" stroke={p.ink} strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M98 178 Q68 162 60 138 Q92 144 98 178z" fill={p.accent2} />
      <path d="M102 164 Q134 150 142 124 Q110 130 102 164z" fill={p.accent2} />
      {[0, 60, 120, 180, 240, 300].map((angle) => (
        <ellipse
          key={angle}
          cx="100"
          cy="86"
          rx="13"
          ry="26"
          fill={p.accent}
          stroke={p.paper}
          strokeWidth="1"
          strokeOpacity="0.6"
          transform={`rotate(${angle} 100 112)`}
        />
      ))}
      <circle cx="100" cy="112" r="13" fill={p.accent2} />
      <circle cx="100" cy="112" r="6" fill={p.ink} opacity="0.7" />
    </g>
  ),

  // A steam locomotive with smoke on a track.
  train: (p) => (
    <g>
      <path d="M0 176 Q50 150 110 168 T200 160 V210 H0z" fill={p.accent2} opacity="0.45" />
      <circle cx="54" cy="80" r="10" fill={p.paper} opacity="0.85" />
      <circle cx="42" cy="64" r="13" fill={p.paper} opacity="0.75" />
      <circle cx="26" cy="48" r="9" fill={p.paper} opacity="0.65" />
      <rect x="50" y="88" width="14" height="24" fill={p.ink} />
      <path d="M46 88 H68 L64 82 H50z" fill={p.ink} />
      <rect x="40" y="108" width="84" height="42" rx="6" fill={p.accent} />
      <rect x="78" y="97" width="16" height="14" rx="7" fill={p.accent2} />
      <rect x="112" y="94" width="52" height="56" fill={p.accent2} />
      <rect x="108" y="88" width="60" height="7" fill={p.ink} />
      <rect x="124" y="104" width="26" height="20" fill={p.paper} />
      {[60, 100].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy="158" r="15" fill={p.ink} />
          <circle cx={cx} cy="158" r="5" fill={p.paper} />
        </g>
      ))}
      <circle cx="144" cy="154" r="18" fill={p.ink} />
      <circle cx="144" cy="154" r="6" fill={p.paper} />
      <rect x="14" y="174" width="172" height="4" fill={p.ink} />
      {[24, 48, 72, 96, 120, 144, 168].map((x) => (
        <rect key={x} x={x} y="178" width="8" height="5" fill={p.ink} opacity="0.7" />
      ))}
    </g>
  ),

  // A two-sail ship on rolling waves.
  ship: (p) => (
    <g>
      <circle cx="58" cy="88" r="22" fill={p.accent2} opacity="0.85" />
      <rect x="0" y="172" width="200" height="40" fill={p.accent} opacity="0.55" />
      <rect x="98" y="70" width="4" height="84" fill={p.ink} />
      <path d="M102 78 L102 126 L148 126z" fill={p.paper} />
      <path d="M98 88 L98 142 L56 142z" fill={p.accent2} />
      <path d="M102 70 L122 77 L102 84z" fill={p.accent} />
      <path d="M42 150 H158 L142 177 H60z" fill={p.ink} />
      <path
        d="M0 186 q12.5 -10 25 0 t25 0 t25 0 t25 0 t25 0 t25 0 t25 0 t25 0"
        stroke={p.paper}
        strokeWidth="3"
        fill="none"
        opacity="0.9"
      />
    </g>
  ),

  // A rocket flying past a ringed planet and stars.
  rocket: (p) => (
    <g>
      {[
        [30, 62],
        [168, 58],
        [40, 152],
        [176, 114],
        [122, 50],
        [74, 188],
      ].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="1.8" fill={p.accent2} />
      ))}
      <circle cx="150" cy="176" r="38" fill={p.accent} opacity="0.85" />
      <ellipse cx="150" cy="176" rx="58" ry="10" fill="none" stroke={p.accent2} strokeWidth="3" opacity="0.85" />
      <g transform="rotate(24 100 120)">
        <path d="M100 56 Q126 88 122 142 H78 Q74 88 100 56z" fill="#FBF4DF" />
        <path d="M100 56 Q113 72 117 90 H83 Q87 72 100 56z" fill={p.accent} />
        <circle cx="100" cy="112" r="10" fill={p.ink} />
        <circle cx="100" cy="112" r="5.5" fill={p.sky2} />
        <path d="M78 126 L58 158 L80 148z" fill={p.accent} />
        <path d="M122 126 L142 158 L120 148z" fill={p.accent} />
        <path d="M88 142 Q100 190 112 142z" fill={p.accent2} />
      </g>
    </g>
  ),
};

export default function StampArt({
  scene = 'bird',
  palette,
  country = '',
  year,
  denomination = '',
  className = '',
}) {
  // Sanitise the generated id: ":" can break url(#id) references in some browsers.
  const skyId = `sky-${useId().replace(/:/g, '')}`;
  const p = { ...DEFAULT_PALETTE, ...palette };
  const drawScene = SCENES[scene] ?? SCENES.bird;
  const label = [country, year, denomination && `denomination ${denomination}`].filter(Boolean).join(', ');

  return (
    <svg viewBox="0 0 200 240" role="img" aria-label={`Illustrated stamp: ${label}`} className={className}>
      <defs>
        <linearGradient id={skyId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p.sky1} />
          <stop offset="1" stopColor={p.sky2} />
        </linearGradient>
      </defs>

      <rect width="200" height="240" fill={`url(#${skyId})`} />
      {drawScene(p)}

      {/* Engraved inner border */}
      <rect x="8" y="8" width="184" height="224" fill="none" stroke={p.ink} strokeOpacity="0.5" strokeWidth="1" />

      {/* Printed text: country + year at the top, denomination at the bottom */}
      <text
        x="100"
        y="27"
        textAnchor="middle"
        fontFamily="Playfair Display, serif"
        fontSize="11"
        letterSpacing="3"
        fontWeight="600"
        fill={p.text}
      >
        {country.toUpperCase()}
      </text>
      {year && (
        <text x="100" y="39" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="7.5" letterSpacing="2" fill={p.text} opacity="0.8">
          {year}
        </text>
      )}
      <text
        x="100"
        y="224"
        textAnchor="middle"
        fontFamily="Playfair Display, serif"
        fontSize="17"
        fontWeight="700"
        fill={p.text}
      >
        {denomination}
      </text>
    </svg>
  );
}
