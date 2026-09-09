"use client";

import React, { useEffect, useState, useRef } from "react";
import gsap from "gsap";

export function AtelierIntro({ onComplete }: { onComplete?: () => void }) {
  const [show, setShow] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const wordmarkRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const svgPathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    // Check sessionStorage to show only once per session
    const hasSeenIntro = sessionStorage.getItem("zaria_intro_seen");
    if (hasSeenIntro) {
      if (onComplete) onComplete();
      return;
    }

    setShow(true);

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          sessionStorage.setItem("zaria_intro_seen", "true");
          setShow(false);
          if (onComplete) onComplete();
        },
      });

      // 1. Draw SVG gold hairline motif
      if (svgPathRef.current) {
        const length = svgPathRef.current.getTotalLength?.() || 300;
        gsap.set(svgPathRef.current, {
          strokeDasharray: length,
          strokeDashoffset: length,
        });

        tl.to(svgPathRef.current, {
          strokeDashoffset: 0,
          duration: 0.6,
          ease: "power2.inOut",
        });
      }

      // 2. Wordmark fades & collapses letter-spacing from wide to royal tracking
      tl.fromTo(
        wordmarkRef.current,
        {
          opacity: 0,
          letterSpacing: "0.6em",
          scale: 0.95,
        },
        {
          opacity: 1,
          letterSpacing: "0.22em",
          scale: 1,
          duration: 0.6,
          ease: "power3.out",
        },
        "-=0.3"
      );

      // 3. Editorial tagline reveal
      tl.fromTo(
        subtitleRef.current,
        {
          opacity: 0,
          y: 8,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          ease: "power2.out",
        },
        "-=0.2"
      );

      // Brief hold (<0.25s)
      tl.to({}, { duration: 0.25 });

      // 4. Regal Curtain-Wipe Transition: Two oxblood panels slide apart
      tl.to(leftPanelRef.current, {
        xPercent: -100,
        duration: 0.65,
        ease: "power4.inOut",
      }, "curtain");

      tl.to(rightPanelRef.current, {
        xPercent: 100,
        duration: 0.65,
        ease: "power4.inOut",
      }, "curtain");

      // Content fades out as curtain parts
      tl.to(
        [wordmarkRef.current, subtitleRef.current, svgPathRef.current?.parentElement],
        {
          opacity: 0,
          duration: 0.25,
          ease: "power2.in",
        },
        "curtain"
      );
    }, containerRef);

    return () => ctx.revert();
  }, [onComplete]);

  if (!show) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 pointer-events-none flex overflow-hidden"
    >
      {/* Left Curtain Panel */}
      <div
        ref={leftPanelRef}
        className="w-1/2 h-full bg-oxblood-deep border-r border-gold/30"
      />

      {/* Right Curtain Panel */}
      <div
        ref={rightPanelRef}
        className="w-1/2 h-full bg-oxblood-deep border-l border-gold/30"
      />

      {/* Centered Ritual Branding Elements */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10 pointer-events-none">
        {/* Hairline Floral Motif SVG */}
        <svg
          width="160"
          height="40"
          viewBox="0 0 160 40"
          fill="none"
          className="mb-4"
        >
          <path
            ref={svgPathRef}
            d="M10 20 H65 M95 20 H150 M65 20 C72 10, 88 10, 95 20 C88 30, 72 30, 65 20 Z"
            stroke="#DFC07B"
            strokeWidth="1.2"
          />
        </svg>

        {/* Wordmark */}
        <h2
          ref={wordmarkRef}
          className="font-display text-4xl md:text-5xl text-gold-foil uppercase font-semibold"
        >
          Zaria
        </h2>

        {/* Editorial Tagline */}
        <p
          ref={subtitleRef}
          className="font-serif italic text-xs md:text-sm text-ivory/80 mt-2 tracking-wider"
        >
          &ldquo;Est. in thread, cut in silk — the atelier opens.&rdquo;
        </p>
      </div>
    </div>
  );
}
