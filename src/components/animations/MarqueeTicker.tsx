"use client";

import React, { useRef, useEffect } from "react";
import gsap from "gsap";

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
  const tickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = tickerRef.current;
    if (!el) return;

    // Respect reduced motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const direction = reverse ? 1 : -1;
    const tween = gsap.to(el, {
      xPercent: direction * 50,
      repeat: -1,
      duration: 35,
      ease: "none",
    });

    return () => {
      tween.kill();
    };
  }, [reverse]);

  const repeated = [...items, ...items, ...items, ...items];

  return (
    <div className={`overflow-hidden py-3 bg-oxblood text-gold-light border-y border-gold/40 select-none ${className}`}>
      <div ref={tickerRef} className="flex whitespace-nowrap will-change-transform">
        {repeated.map((text, idx) => (
          <div key={idx} className="flex items-center shrink-0">
            <span className="font-serif text-[11px] uppercase tracking-[0.35em] font-medium px-4">
              {text}
            </span>
            <span className="text-gold-antique text-xs">✦</span>
          </div>
        ))}
      </div>
    </div>
  );
}
