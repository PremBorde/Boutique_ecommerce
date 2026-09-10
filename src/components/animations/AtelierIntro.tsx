"use client";

import React, { useEffect, useState, useRef } from "react";
import gsap from "gsap";

const TOTAL_TICKS = 42;
const START_ANGLE = 135; // 8 o'clock position
const SWEEP_ANGLE = 270; // Sweeps clockwise to 4 o'clock position

export function AtelierIntro({ onComplete }: { onComplete?: () => void }) {
  const [show, setShow] = useState(false);
  const [progress, setProgress] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const leftCurtainRef = useRef<HTMLDivElement>(null);
  const rightCurtainRef = useRef<HTMLDivElement>(null);
  const dialContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check sessionStorage to show once per session
    const hasSeen = sessionStorage.getItem("zaria_intro_seen");
    if (hasSeen) {
      if (onComplete) onComplete();
      return;
    }

    setShow(true);

    // Smooth simulated load from 0 to 100
    const progressObj = { value: 0 };
    let lastRenderedProgress = -1;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      // Animate progress smoothly with slight realistic easing
      tl.to(progressObj, {
        value: 100,
        duration: 2.2,
        ease: "power2.inOut",
        onUpdate: () => {
          const rounded = Math.floor(progressObj.value);
          if (rounded !== lastRenderedProgress) {
            lastRenderedProgress = rounded;
            setProgress(rounded);
          }
        },
      });

      // Brief hold at 100% so user registers full load
      tl.to({}, { duration: 0.25 });

      // Fade & scale out the dial center smoothly
      tl.to(dialContentRef.current, {
        opacity: 0,
        scale: 0.92,
        duration: 0.35,
        ease: "power2.in",
      });

      // Part the luxury curtains: left panel slides left, right panel slides right
      tl.to(
        leftCurtainRef.current,
        {
          xPercent: -100,
          duration: 0.75,
          ease: "power4.inOut",
        },
        "curtain"
      );

      tl.to(
        rightCurtainRef.current,
        {
          xPercent: 100,
          duration: 0.75,
          ease: "power4.inOut",
          onComplete: () => {
            sessionStorage.setItem("zaria_intro_seen", "true");
            setShow(false);
            if (onComplete) onComplete();
          },
        },
        "curtain"
      );
    }, containerRef);

    return () => {
      ctx.revert();
    };
  }, [onComplete]);

  if (!show) return null;

  // Calculate needle rotation angle based on progress (0 -> 100%)
  const needleAngle = START_ANGLE + (progress / 100) * SWEEP_ANGLE;

  // Dynamic crafting status label
  const getStatusLabel = (p: number) => {
    if (p < 22) return "INITIALIZING ATELIER ARCHIVE";
    if (p < 48) return "THREADING 24K ZARI & RAW SILK";
    if (p < 75) return "CALIBRATING BESPOKE SILHOUETTES";
    if (p < 98) return "POLISHING EDITORIAL VAULT";
    return "ATELIER UNVEILED";
  };

  const handleSkip = () => {
    sessionStorage.setItem("zaria_intro_seen", "true");
    setShow(false);
    if (onComplete) onComplete();
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 overflow-hidden select-none flex"
      aria-label="Atelier Loading Screen"
    >
      {/* Left Curtain Panel with Architectural Grid */}
      <div
        ref={leftCurtainRef}
        className="w-1/2 h-full bg-[#0D0B09] border-r border-gold/25 relative overflow-hidden"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(201, 160, 80, 0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(201, 160, 80, 0.04) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Right Curtain Panel with Architectural Grid */}
      <div
        ref={rightCurtainRef}
        className="w-1/2 h-full bg-[#0D0B09] border-l border-gold/25 relative overflow-hidden"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(201, 160, 80, 0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(201, 160, 80, 0.04) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Central Dial & Telemetry Interface */}
      <div
        ref={dialContentRef}
        className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-auto"
      >
        {/* Skip button in top right */}
        <button
          onClick={handleSkip}
          className="absolute top-6 right-6 text-[10px] tracking-[0.25em] uppercase text-gold/60 hover:text-gold transition-colors font-mono py-1.5 px-3 border border-gold/20 hover:border-gold/50 rounded-sm bg-black/40 backdrop-blur-sm"
        >
          Skip Atelier →
        </button>

        {/* Center Tachometer / Knob Meter */}
        <div className="relative w-[320px] h-[320px] sm:w-[360px] sm:h-[360px] flex items-center justify-center">
          {/* Top-Left Orbiting Satellite Beacon */}
          <div className="absolute -top-1 left-4 sm:left-8 flex items-center justify-center">
            <span className="relative flex h-6 w-6 items-center justify-center">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E5B842] opacity-40"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#F5D061] border-2 border-[#0D0B09] shadow-[0_0_10px_#F5D061]"></span>
            </span>
          </div>

          {/* Radial Tick Arc Gauge */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 360 360"
          >
            {/* Ambient Background Glow Behind Dial */}
            <defs>
              <radialGradient id="dialGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#F5D061" stopOpacity="0.12" />
                <stop offset="70%" stopColor="#DFC07B" stopOpacity="0.03" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle cx="180" cy="180" r="160" fill="url(#dialGlow)" />

            {/* Generated Radial Tick Lines */}
            {Array.from({ length: TOTAL_TICKS }).map((_, i) => {
              const tickAngle = START_ANGLE + (i / (TOTAL_TICKS - 1)) * SWEEP_ANGLE;
              const rad = (tickAngle * Math.PI) / 180;
              const innerRadius = 145;
              const outerRadius = 162;

              const x1 = 180 + innerRadius * Math.cos(rad);
              const y1 = 180 + innerRadius * Math.sin(rad);
              const x2 = 180 + outerRadius * Math.cos(rad);
              const y2 = 180 + outerRadius * Math.sin(rad);

              const isPassed = (i / (TOTAL_TICKS - 1)) * 100 <= progress;

              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={isPassed ? "#F5D061" : "rgba(255, 255, 255, 0.12)"}
                  strokeWidth={isPassed ? "3.2" : "2"}
                  strokeLinecap="round"
                  style={{
                    filter: isPassed
                      ? "drop-shadow(0 0 6px rgba(245, 208, 97, 0.95))"
                      : "none",
                    transition: "stroke 0.15s ease, filter 0.15s ease",
                  }}
                />
              );
            })}
          </svg>

          {/* Center Rotary Knob Body */}
          <div className="relative w-44 h-44 sm:w-48 sm:h-48 rounded-full bg-gradient-to-b from-[#1C1815] to-[#0A0908] border border-gold/30 shadow-[0_12px_40px_rgba(0,0,0,0.8),inset_0_2px_4px_rgba(245,208,97,0.15)] flex items-center justify-center overflow-hidden">
            {/* Inner Recessed Disc */}
            <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full bg-[#120F0D] border border-black/80 shadow-[inset_0_4px_12px_rgba(0,0,0,0.9)] flex flex-col items-center justify-center relative">
              {/* Rotating Gold Needle Indicator */}
              <div
                className="absolute inset-0 flex items-center justify-center pointer-events-none transition-transform duration-75 ease-out"
                style={{
                  transform: `rotate(${needleAngle - 90}deg)`,
                }}
              >
                {/* Needle Ray */}
                <div className="w-1.5 h-14 bg-gradient-to-t from-gold-dark via-gold to-[#FFF4C7] rounded-full shadow-[0_0_12px_#F5D061] transform -translate-y-7" />
              </div>

              {/* Central Metallic Core & Label */}
              <div className="w-16 h-16 rounded-full bg-[#0D0B09] border border-gold/40 shadow-md flex flex-col items-center justify-center z-10">
                <span className="w-2 h-2 rounded-full bg-[#F5D061] shadow-[0_0_8px_#F5D061] animate-pulse mb-1" />
                <span className="font-mono text-[8px] uppercase tracking-[0.25em] text-gold-light/90 font-medium">
                  ATELIER
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Telemetry Readout Below Dial */}
        <div className="mt-8 flex flex-col items-center text-center">
          {/* Section Header */}
          <p className="text-[11px] font-mono tracking-[0.4em] uppercase text-gold-dark/80 mb-1">
            ATELIER SYSTEM LOAD
          </p>

          {/* Big Glowing 3-Digit Counter (e.g. "043 %") */}
          <div className="flex items-baseline gap-1">
            <span
              className="font-mono text-5xl sm:text-6xl font-black tracking-wider text-[#F5D061]"
              style={{
                textShadow:
                  "0 0 20px rgba(245, 208, 97, 0.8), 0 0 40px rgba(229, 184, 66, 0.4)",
              }}
            >
              {String(progress).padStart(3, "0")}
            </span>
            <span
              className="font-mono text-xl sm:text-2xl font-bold text-gold/80"
              style={{ textShadow: "0 0 10px rgba(245, 208, 97, 0.6)" }}
            >
              %
            </span>
          </div>

          {/* Craftsmanship Telemetry Stage */}
          <p className="mt-3 text-xs font-mono uppercase tracking-[0.3em] text-ivory/70 transition-all duration-200">
            [ {getStatusLabel(progress)} ]
          </p>
        </div>
      </div>
    </div>
  );
}
