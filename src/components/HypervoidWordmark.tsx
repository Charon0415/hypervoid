/**
 * Hypervoid wordmark — cosmic-themed art word.
 *
 * "Hyper" rendered in serif weight with gradient ink that suggests
 * deep-space blue; a small 4-point star separates the two words; "void"
 * is italic and slightly lighter; a thin orbit traces under the o; a few
 * scattered dust specks above pick up the night-sky vibe.
 *
 * Sizes via `h-X` on the wrapper — viewBox is fixed, width auto.
 */
export function HypervoidWordmark({
  className = "",
  title = "Hypervoid",
}: {
  className?: string;
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 178 32"
      role="img"
      aria-label={title}
      fill="none"
      className={`hv-wordmark ${className}`}
    >
      <defs>
        <linearGradient id="hv-ink" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.95" />
          <stop offset="55%" stopColor="var(--primary)" stopOpacity="1" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id="hv-orbit" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
          <stop offset="50%" stopColor="var(--primary)" stopOpacity="0.6" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Cosmic dust above */}
      <g fill="currentColor">
        <circle cx="18" cy="6" r="0.55" opacity="0.45" />
        <circle cx="50" cy="3.5" r="0.7" opacity="0.55" />
        <circle cx="128" cy="4" r="0.5" opacity="0.4" />
        <circle cx="158" cy="7" r="0.9" fill="var(--primary)" opacity="0.75" />
        <circle cx="170" cy="4" r="0.4" opacity="0.3" />
      </g>

      {/* "Hyper" — serif, weight-bold, gradient fill */}
      <text
        x="0"
        y="23"
        fontFamily="ui-serif, Georgia, 'Times New Roman', serif"
        fontSize="22"
        fontWeight="700"
        letterSpacing="1.2"
        fill="url(#hv-ink)"
      >
        Hyper
      </text>

      {/* 4-point star spark between Hyper and void */}
      <g transform="translate(75 13)">
        <path
          className="hv-wordmark-spark"
          d="M0 -4 L1.05 -1.05 L4 0 L1.05 1.05 L0 4 L-1.05 1.05 L-4 0 L-1.05 -1.05 Z"
          fill="var(--primary)"
        />
      </g>

      {/* "void" — italic, lighter weight */}
      <text
        x="85"
        y="23"
        fontFamily="ui-serif, Georgia, 'Times New Roman', serif"
        fontSize="22"
        fontWeight="400"
        fontStyle="italic"
        letterSpacing="1.8"
        fill="currentColor"
        opacity="0.92"
      >
        void
      </text>

      {/* Faint orbital ring around the "o" of void */}
      <ellipse
        cx="106"
        cy="15"
        rx="11"
        ry="3.4"
        stroke="var(--primary)"
        strokeWidth="0.7"
        fill="none"
        opacity="0.5"
        transform="rotate(-8 106 15)"
      />

      {/* Bottom orbital trace */}
      <path
        d="M3 30 Q90 32 175 28"
        stroke="url(#hv-orbit)"
        strokeWidth="0.7"
        fill="none"
      />
    </svg>
  );
}
