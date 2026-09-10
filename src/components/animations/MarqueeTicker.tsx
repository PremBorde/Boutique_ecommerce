"use client";

import React from "react";

interface MarqueeTickerProps {
  items?: string[];
  reverse?: boolean;
  className?: string;
}

export function MarqueeTicker({
  items = [
    "HAND EMBROIDERED",
    "FESTIVE 2026",
    "SMALL BATCH SILKS",
    "VARANASI WEAVES",
    "PURE ZARI WIRE",
    "ALL OVER INDIA ATELIER",
    "PAN-INDIA COUTURE",
  ],
  reverse = false,
  className = "",
}: MarqueeTickerProps) {
  // Duplicate once (not 4×) — the CSS seamless loop only needs 2 sets
  const repeated = [...items, ...items];

  return (
    <div
      className={`overflow-hidden py-3 bg-oxblood text-gold-light border-y border-gold/40 select-none ${className}`}
      style={{ WebkitMaskImage: "linear-gradient(to right, transparent, black 5%, black 95%, transparent)" }}
    >
      <div
        className="flex whitespace-nowrap will-change-transform"
        style={{
          animation: `marquee-scroll ${reverse ? "reverse" : "normal"} 35s linear infinite`,
        }}
      >
        {repeated.map((text, idx) => (
          <div key={idx} className="flex items-center shrink-0">
            <span className="font-serif text-[11px] uppercase tracking-[0.35em] font-medium px-4">
              {text}
            </span>
            <span className="text-gold-antique text-xs">✦</span>
          </div>
        ))}
      </div>

      {/* Keyframe defined inline so it's self-contained with no global CSS dependency */}
      <style>{`
        @keyframes marquee-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes marquee-scroll-reverse {
          from { transform: translateX(-50%); }
          to   { transform: translateX(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .marquee-track { animation-play-state: paused !important; }
        }
      `}</style>
    </div>
  );
}
