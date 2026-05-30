"use client";

import { motion } from "motion/react";

export function AuroraBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[-1] overflow-hidden">
      {/* Single soft blob — no blur filter, use opacity instead */}
      <motion.div
        className="absolute -left-1/4 -top-1/4 h-[50vw] w-[50vw] rounded-full opacity-[0.06]"
        style={{
          background: "radial-gradient(circle, #f43f5e 0%, #8b5cf6 40%, transparent 70%)",
        }}
        animate={{
          x: ["0%", "10%", "-5%", "0%"],
          y: ["0%", "-8%", "6%", "0%"],
        }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
