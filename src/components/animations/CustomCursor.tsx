"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const [label, setLabel] = useState("");
  const [isHoveringInteractive, setIsHoveringInteractive] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only mount on devices that support hover (not touch devices)
    if (typeof window === "undefined" || !window.matchMedia("(hover: hover)").matches) {
      return;
    }

    const cursor = cursorRef.current;
    const follower = followerRef.current;
    if (!cursor || !follower) return;

    // Use gsap.quickTo for zero-jank 120fps tracking
    const xTo = gsap.quickTo(cursor, "x", { duration: 0.1, ease: "power3" });
    const yTo = gsap.quickTo(cursor, "y", { duration: 0.1, ease: "power3" });

    const followXTo = gsap.quickTo(follower, "x", { duration: 0.35, ease: "power2.out" });
    const followYTo = gsap.quickTo(follower, "y", { duration: 0.35, ease: "power2.out" });

    const handleMouseMove = (e: MouseEvent) => {
      if (!visible) setVisible(true);
      xTo(e.clientX);
      yTo(e.clientY);
      followXTo(e.clientX);
      followYTo(e.clientY);

      // Check if hovering interactive element with custom cursor label
      const target = (e.target as HTMLElement)?.closest("[data-cursor]") as HTMLElement | null;
      if (target) {
        const customLabel = target.getAttribute("data-cursor") || "Explore";
        setLabel(customLabel);
        setIsHoveringInteractive(true);
      } else {
        const isClickable = (e.target as HTMLElement)?.closest(
          "button, a, input, select, textarea, [role='button']"
        );
        if (isClickable) {
          setLabel("");
          setIsHoveringInteractive(true);
        } else {
          setLabel("");
          setIsHoveringInteractive(false);
        }
      }
    };

    const handleMouseLeave = () => setVisible(false);
    const handleMouseEnter = () => setVisible(true);

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden hidden md:block">
      {/* Central Precision Gold Dot */}
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-gold pointer-events-none"
      />

      {/* Trailing Ring / Morphing Pill */}
      <div
        ref={followerRef}
        className={`fixed top-0 left-0 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none transition-all duration-300 flex items-center justify-center ${
          label
            ? "px-3.5 py-1.5 bg-oxblood text-gold-foil border border-gold shadow-[0_4px_20px_rgba(74,14,23,0.35)] scale-100"
            : isHoveringInteractive
            ? "w-11 h-11 border-2 border-gold/70 bg-gold/10 scale-110"
            : "w-8 h-8 border border-gold/40 scale-100"
        }`}
      >
        {label && (
          <span
            ref={labelRef}
            className="text-[9px] uppercase tracking-[0.2em] font-serif font-semibold whitespace-nowrap"
          >
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
