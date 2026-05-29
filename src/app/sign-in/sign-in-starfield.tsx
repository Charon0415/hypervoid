"use client";

import { useEffect } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";

const stars = [
  [6, 12, 1.1], [14, 34, 0.8], [19, 18, 1.4], [27, 62, 0.9], [34, 28, 1.2],
  [41, 76, 0.8], [49, 16, 1.1], [56, 42, 1.5], [63, 68, 0.9], [72, 22, 1.2],
  [78, 51, 0.8], [86, 14, 1.3], [91, 74, 1], [10, 82, 0.8], [31, 9, 0.7],
  [68, 88, 1.1], [94, 38, 0.7], [45, 55, 0.8], [22, 46, 0.9], [83, 86, 0.8],
  [4, 56, 0.7], [15, 70, 1.2], [37, 90, 0.6], [58, 9, 0.8], [75, 78, 1.3],
  [97, 62, 0.9], [51, 83, 0.7], [66, 33, 0.6], [39, 39, 0.8], [7, 91, 0.7],
];

export function SignInStarfield() {
  const reduceMotion = useReducedMotion();
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const springX = useSpring(pointerX, { stiffness: 42, damping: 18, mass: 0.4 });
  const springY = useSpring(pointerY, { stiffness: 42, damping: 18, mass: 0.4 });
  const nearX = useTransform(springX, [-1, 1], ["-1.8%", "1.8%"]);
  const nearY = useTransform(springY, [-1, 1], ["-1.2%", "1.2%"]);
  const farX = useTransform(springX, [-1, 1], ["0.8%", "-0.8%"]);
  const farY = useTransform(springY, [-1, 1], ["0.6%", "-0.6%"]);

  useEffect(() => {
    if (reduceMotion) return;

    function updatePointer(event: PointerEvent) {
      pointerX.set((event.clientX / window.innerWidth - 0.5) * 2);
      pointerY.set((event.clientY / window.innerHeight - 0.5) * 2);
    }

    window.addEventListener("pointermove", updatePointer, { passive: true });
    return () => window.removeEventListener("pointermove", updatePointer);
  }, [pointerX, pointerY, reduceMotion]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden bg-[#050510]">
      <motion.svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
        style={reduceMotion ? undefined : { x: farX, y: farY }}
      >
        <defs>
          <radialGradient id="hv-nebula-a" cx="30%" cy="30%" r="48%">
            <stop offset="0%" stopColor="#ec4899" stopOpacity="0.28" />
            <stop offset="52%" stopColor="#5b5bd6" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#050510" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="hv-nebula-b" cx="78%" cy="68%" r="42%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.24" />
            <stop offset="62%" stopColor="#0f172a" stopOpacity="0.10" />
            <stop offset="100%" stopColor="#050510" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="hv-orbit-line" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="48%" stopColor="#ffffff" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="hv-aurora" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0" />
            <stop offset="38%" stopColor="#38bdf8" stopOpacity="0.12" />
            <stop offset="65%" stopColor="#f472b6" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect width="100" height="100" fill="#050510" />
        <rect width="100" height="100" fill="url(#hv-nebula-a)" />
        <rect width="100" height="100" fill="url(#hv-nebula-b)" />
        <motion.path
          d="M-6 66 C 16 56, 29 67, 48 55 S 82 28, 108 35"
          fill="none"
          stroke="url(#hv-aurora)"
          strokeWidth="8"
          strokeLinecap="round"
          animate={reduceMotion ? undefined : { pathLength: [0.2, 1, 0.2], opacity: [0.14, 0.42, 0.14] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
        />
        <path d="M-10 76 C 18 58, 32 60, 55 42 S 88 16, 112 23" fill="none" stroke="url(#hv-orbit-line)" strokeWidth="0.18" />
        <path d="M-8 28 C 22 18, 44 35, 62 28 S 91 18, 108 42" fill="none" stroke="url(#hv-orbit-line)" strokeWidth="0.14" />
        {stars.map(([x, y, r], index) => (
          <motion.circle
            key={`${x}-${y}`}
            cx={x}
            cy={y}
            r={r / 10}
            fill="white"
            opacity="0.62"
            animate={reduceMotion ? undefined : { opacity: [0.22, 0.78, 0.22] }}
            transition={{ duration: 2.8 + (index % 5) * 0.55, repeat: Infinity, delay: index * 0.12 }}
          />
        ))}
      </motion.svg>

      <motion.div style={reduceMotion ? undefined : { x: nearX, y: nearY }} className="absolute inset-0">
        <motion.div
          className="absolute left-[-10%] top-[18%] h-px w-[34rem] rotate-[-18deg] bg-gradient-to-r from-transparent via-white/40 to-transparent"
          animate={reduceMotion ? undefined : { x: ["-25%", "145%"], opacity: [0, 1, 0] }}
          transition={{ duration: 7.5, repeat: Infinity, repeatDelay: 4, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-[18%] right-[-8%] h-px w-[24rem] rotate-[-24deg] bg-gradient-to-r from-transparent via-[#ec4899]/50 to-transparent"
          animate={reduceMotion ? undefined : { x: ["25%", "-150%"], opacity: [0, 0.9, 0] }}
          transition={{ duration: 9, repeat: Infinity, repeatDelay: 5.5, ease: "easeInOut" }}
        />
      </motion.div>

      <motion.div
        className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,.055)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.04)_1px,transparent_1px)] bg-[size:72px_72px] opacity-28"
        animate={reduceMotion ? undefined : { backgroundPosition: ["0px 0px", "72px 72px"] }}
        transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(5,5,16,.22)_52%,rgba(5,5,16,.86)_100%)]" />
    </div>
  );
}
