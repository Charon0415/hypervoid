"use client";

import { useRef, useEffect, type ReactNode } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import Link from "next/link";
import { GradientText } from "@/components/GradientText";
import { MagneticButton } from "@/components/MagneticButton";

/* ── Fixed Canvas Particle Field (covers entire viewport) ─── */
function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf: number;
    let w = 0;
    let h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const particles = Array.from({ length: 30 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.15,
      r: Math.random() * 1.2 + 0.4,
      hue: Math.random() * 360,
    }));

    function resize() {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
      canvas!.style.width = w + "px";
      canvas!.style.height = h + "px";
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    let frame = 0;
    function draw() {
      frame++;
      if (frame % 2 !== 0) { raf = requestAnimationFrame(draw); return; } // skip every other frame

      ctx!.clearRect(0, 0, w, h);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;

        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx!.fillStyle = `hsla(${187 + (p.hue % 30) - 15}, 90%, 55%, 0.25)`;
        ctx!.fill();
      }
      raf = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0"
      style={{ opacity: 0.5 }}
    />
  );
}

/* ── Mouse Spotlight ─────────────────────────────────────── */
function MouseSpotlight() {
  const ref = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const x = useSpring(mouseX, { stiffness: 100, damping: 25 });
  const y = useSpring(mouseY, { stiffness: 100, damping: 25 });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, [mouseX, mouseY]);

  const bg = useTransform(
    [x, y],
    ([lx, ly]) =>
      `radial-gradient(700px circle at ${lx}px ${ly}px, rgba(6,182,212,0.06), rgba(34,211,238,0.04) 25%, rgba(6,182,212,0.03) 45%, transparent 65%)`,
  );

  return <motion.div ref={ref} className="pointer-events-none fixed inset-0 z-[1]" style={{ background: bg }} />;
}

/* ── Blur Text Reveal ────────────────────────────────────── */
function BlurReveal({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) {
  return (
    <motion.span
      className={className}
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.05, delayChildren: delay } } }}
    >
      {text.split("").map((char, i) => (
        <motion.span
          key={i}
          className="inline-block"
          variants={{
            hidden: { opacity: 0, filter: "blur(10px)", y: 15 },
            visible: {
              opacity: 1,
              filter: "blur(0px)",
              y: 0,
              transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
            },
          }}
        >
          {char === " " ? " " : char}
        </motion.span>
      ))}
    </motion.span>
  );
}

/* ── Fade Up ─────────────────────────────────────────────── */
function FadeUp({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── Marquee Band ────────────────────────────────────────── */
function MarqueeBand({ items }: { items: string[] }) {
  const doubled = [...items, ...items];
  return (
    <div className="relative overflow-hidden py-2">
      <motion.div
        className="flex gap-8 whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      >
        {doubled.map((item, i) => (
          <span key={i} className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-soft">
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

/* ── Hero Section — frameless, infinite blend ────────────── */
export function HeroSection({
  quote,
  quoteAuthor,
  marqueeItems,
}: {
  quote: string;
  quoteAuthor: string;
  marqueeItems: string[];
}) {
  return (
    <>
      {/* Fixed background — particle field only */}
      <ParticleField />

      {/* Hero content — full width with gradient fill */}
      <div className="relative z-[2] w-full px-6 py-20 sm:px-10 md:px-16 lg:py-28" style={{ background: "linear-gradient(145deg, rgba(239,68,68,0.1), rgba(249,115,22,0.08), rgba(234,179,8,0.07), rgba(34,197,94,0.08), rgba(6,182,212,0.1), rgba(59,130,246,0.12), rgba(99,102,241,0.1), rgba(139,92,246,0.09), rgba(217,70,239,0.08), rgba(12,18,36,0.82))", borderTop: "1px solid rgba(255,255,255,0.08)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="mx-auto max-w-5xl">
          <FadeUp delay={0.1}>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-accent shadow-[0_0_8px_var(--accent-glow)]" />
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.25em] text-accent/60 sm:text-xs">
                System Online · HV-001
              </span>
            </div>
          </FadeUp>

          <div className="mt-8 sm:mt-10">
            <BlurReveal
              text="HYPERVOID"
              className="shiny-text text-[clamp(2.8rem,13vw,6rem)] font-black leading-[0.8] tracking-tight"
              delay={0.3}
            />
          </div>

          <FadeUp delay={0.9} className="mt-2">
            <GradientText
              className="font-mono text-sm font-bold uppercase tracking-[0.4em] sm:text-lg md:text-xl"
              colors={["#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4", "#3b82f6", "#6366f1", "#8b5cf6", "#d946ef", "#ec4899"]}
              animationSpeed={5}
              direction="horizontal"
            >
              高维空间
            </GradientText>
          </FadeUp>

          <FadeUp delay={1.1} className="mt-6 max-w-xl">
            <p className="text-sm italic leading-relaxed text-muted sm:text-base">
              「{quote}」
              {quoteAuthor ? <span className="ml-2 text-xs text-muted-soft">—— {quoteAuthor}</span> : null}
            </p>
          </FadeUp>

          <FadeUp delay={1.3} className="mt-8 flex flex-wrap gap-3">
            <MagneticButton strength={0.25}>
              <Link
                href="/posts"
                className="group inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-6 py-2.5 font-mono text-sm font-bold uppercase tracking-wider text-accent shadow-[0_0_28px_var(--accent-glow)] transition hover:border-accent/60 hover:bg-accent/20 hover:text-accent-soft hover:shadow-[0_0_40px_var(--accent-glow)]"
              >
                进入文章
                <svg aria-hidden className="h-4 w-4 transition group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </Link>
            </MagneticButton>
            <MagneticButton strength={0.2}>
              <Link
                href="/about"
                className="inline-flex items-center rounded-full border border-border bg-card px-6 py-2.5 font-mono text-sm font-medium uppercase tracking-wider text-muted transition hover:border-accent/30 hover:bg-card-hover hover:text-foreground"
              >
                关于我
              </Link>
            </MagneticButton>
            <MagneticButton strength={0.2}>
              <Link
                href="/archive"
                className="inline-flex items-center rounded-full border border-border bg-card px-6 py-2.5 font-mono text-sm font-medium uppercase tracking-wider text-muted transition hover:border-accent/30 hover:bg-card-hover hover:text-foreground"
              >
                归档
              </Link>
            </MagneticButton>
          </FadeUp>
        </div>

        {/* Marquee — no background, blends naturally */}
        <div className="mx-auto mt-12 max-w-[100rem]">
          <MarqueeBand items={marqueeItems} />
        </div>
      </div>
    </>
  );
}
