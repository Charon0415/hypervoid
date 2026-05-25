/**
 * Hypervoid wordmark — restrained, monumental treatment.
 *
 * Letterpress-style "HYPERVOID" in geometric all-caps, wide-tracked, with
 * a single high-tech accent: a thin orbit line crossing through, anchored
 * by a small star where it meets the wordmark on the right. The gradient
 * suggests deep-space dawn (primary fading to foreground).
 *
 * Replaces the previous decorative version (serif italic + scattered dust)
 * with a single, confident graphic.
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
      viewBox="0 0 240 36"
      role="img"
      aria-label={title}
      fill="none"
      className={`hv-wordmark ${className}`}
    >
      <defs>
        <linearGradient id="hv-ink-2" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.95" />
          <stop offset="50%" stopColor="currentColor" stopOpacity="1" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id="hv-orbit-2" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0" />
          <stop offset="50%" stopColor="var(--primary)" stopOpacity="0.85" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* The wordmark. Geometric all-caps, generous tracking. */}
      <text
        x="0"
        y="24"
        fontFamily="'SF Pro Display', 'Helvetica Neue', Inter, system-ui, sans-serif"
        fontSize="22"
        fontWeight="700"
        letterSpacing="3.6"
        fill="url(#hv-ink-2)"
      >
        HYPERVOID
      </text>

      {/* Horizon — single thin orbit, fading on both ends */}
      <line
        x1="0"
        y1="32"
        x2="232"
        y2="32"
        stroke="url(#hv-orbit-2)"
        strokeWidth="0.7"
      />

      {/* Anchor dot on the orbit — primary color, twinkling */}
      <circle
        className="hv-wordmark-spark"
        cx="232"
        cy="32"
        r="1.8"
        fill="var(--primary)"
      />

      {/* Northern star — a single tiny dot above the gap between HYPER and VOID */}
      <circle cx="118" cy="6" r="0.9" fill="var(--primary)" opacity="0.85" />
    </svg>
  );
}
