"use client";

import { useEffect, useRef } from "react";

const STAR_COUNT = 80;
const SPEED = 0.06;

type Star = {
  x: number;
  y: number;
  z: number;
  size: number;
};

export function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = canvas.clientWidth;
    let height = canvas.clientHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      if (!canvas) return;
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx?.scale(dpr, dpr);
    }
    resize();

    const stars: Star[] = Array.from({ length: STAR_COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      z: Math.random() * 0.6 + 0.4,
      size: Math.random() * 1.2 + 0.4,
    }));

    let mounted = true;
    let raf = 0;

    function draw() {
      if (!mounted || !ctx) return;
      ctx.clearRect(0, 0, width, height);
      const isDark = document.documentElement.classList.contains("dark");
      const color = isDark ? "255, 255, 255" : "100, 100, 120";
      for (const s of stars) {
        s.y += SPEED * s.z;
        if (s.y > height) {
          s.y = -2;
          s.x = Math.random() * width;
        }
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * s.z, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color}, ${0.18 * s.z + 0.05})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    }
    draw();

    const onResize = () => resize();
    window.addEventListener("resize", onResize);

    return () => {
      mounted = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full"
    />
  );
}
