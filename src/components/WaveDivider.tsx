interface WaveDividerProps {
  className?: string;
  flip?: boolean;
  color1?: string;
  color2?: string;
}

export function WaveDivider({
  className = "",
  flip = false,
  color1 = "rgba(167,139,250,0.15)",
  color2 = "rgba(167,139,250,0.08)",
}: WaveDividerProps) {
  return (
    <div
      className={`pointer-events-none select-none overflow-hidden ${flip ? "rotate-180" : ""} ${className}`}
      aria-hidden
    >
      <svg
        viewBox="0 0 1200 60"
        preserveAspectRatio="none"
        className="block h-8 w-full sm:h-10 md:h-12"
      >
        <path
          d="M0,40 C200,10 400,55 600,30 C800,5 1000,50 1200,25 L1200,60 L0,60 Z"
          fill={color1}
        />
        <path
          d="M0,50 C300,20 500,55 700,35 C900,15 1100,45 1200,30 L1200,60 L0,60 Z"
          fill={color2}
        />
      </svg>
    </div>
  );
}
