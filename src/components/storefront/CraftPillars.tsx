"use client";

import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const PILLARS = [
  {
    num: "01",
    title: "Hand-Embroidered Devotion",
    subtitle: "Over 300+ artisan hours per heirloom piece",
    narrative:
      "Crafted by fifth-generation artisans in Jaipur and Varanasi using authentic dabka, marodi, and French knot needles. Every single stitch is placed with meditative precision.",
    image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=1000&auto=format&fit=crop",
    motif: "Mughal Jaal & Scalloped Paisleys",
  },
  {
    num: "02",
    title: "Heritage Archival Motifs",
    subtitle: "Restoring royal court portraiture patterns",
    narrative:
      "We dig into royal museum archives and private Jaipur collections to re-author forgotten geometric cartouches, lotus medleys, and architectural archways.",
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1000&auto=format&fit=crop",
    motif: "Mehrab Arches & Cypress Trees",
  },
  {
    num: "03",
    title: "Small-Batch Cut",
    subtitle: "Zero mass manufacturing, strictly limited editions",
    narrative:
      "We cut no more than 10 to 25 units per silhouette to eliminate excess fabric waste, respect artisan rhythm, and guarantee that your acquisition remains truly rare.",
    image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=1000&auto=format&fit=crop",
    motif: "Individual Edition Hallmark",
  },
  {
    num: "04",
    title: "Pure Zari & Mulberry Silk",
    subtitle: "100% lab-verified metals and raw weaves",
    narrative:
      "We weave exclusively with genuine silver and gold gilded wire interlaced on handlooms across Varanasi, Paithan, and Chanderi. Breathable, heavy, and luminous.",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1000&auto=format&fit=crop",
    motif: "Kadhwa Pit-Loom Weft",
  },
  {
    num: "05",
    title: "Heirlooms Made To Last",
    subtitle: "Garments designed to be passed down generations",
    narrative:
      "Reinforced silk facings, archival preservation boxing, and timeless silhouette tailoring ensure that every Zaria creation endures as a family treasure.",
    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1000&auto=format&fit=crop",
    motif: "Preservation Grade Keepsake",
  },
];

export function CraftPillars() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const ctx = gsap.context(() => {
      const isMobile = window.innerWidth < 1024;
      if (isMobile) return;

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: `+=${PILLARS.length * 100}%`,
        pin: true,
        scrub: 1,
        onUpdate: (self) => {
          const idx = Math.min(
            PILLARS.length - 1,
            Math.floor(self.progress * PILLARS.length)
          );
          setActiveIdx(idx);
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const activePillar = PILLARS[activeIdx];

  return (
    <section
      ref={sectionRef}
      className="relative min-h-0 lg:min-h-screen bg-noir text-ivory py-16 sm:py-24 lg:py-28 px-4 md:px-8 flex flex-col justify-center overflow-hidden border-t border-gold/30"
    >
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col justify-center">
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto mb-6 sm:mb-8">
          <p className="text-[10px] uppercase tracking-[0.35em] text-gold-foil font-semibold mb-1.5">
            The Five Pillars of the Atelier
          </p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-ivory">
            Devotion to the Craft
          </h2>
        </div>

        {/* Pillar Showcase Display */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Numbered Stepper & Narratives */}
          <div className="lg:col-span-6 space-y-4 md:space-y-5">
            {/* Step Indicators */}
            <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap justify-center lg:justify-start">
              {PILLARS.map((p, idx) => (
                <button
                  key={p.num}
                  onClick={() => setActiveIdx(idx)}
                  className={`py-1 px-2.5 sm:px-3 border text-xs font-serif transition-all ${
                    activeIdx === idx
                      ? "bg-gold text-noir font-semibold border-gold shadow-[0_0_15px_rgba(201,160,80,0.3)]"
                      : "border-gold/30 text-ivory/60 hover:text-ivory"
                  }`}
                >
                  {p.num}
                </button>
              ))}
            </div>

            {/* Current Pillar Details */}
            <div className="space-y-3 pt-2 text-center lg:text-left">
              <span className="font-display text-4xl sm:text-5xl md:text-6xl font-light text-gold-foil/80 block">
                {activePillar.num}
              </span>

              <h3 className="font-serif text-xl sm:text-2xl md:text-3xl text-ivory leading-tight font-normal">
                {activePillar.title}
              </h3>

              <p className="text-[11px] uppercase tracking-[0.25em] text-gold-antique font-semibold">
                {activePillar.subtitle}
              </p>

              <p className="text-xs sm:text-sm text-ivory/70 leading-relaxed font-sans max-w-lg mx-auto lg:mx-0">
                {activePillar.narrative}
              </p>

              <div className="pt-3 border-t border-gold/20 flex items-center justify-center lg:justify-start gap-2 text-xs text-gold-light">
                <span className="font-semibold uppercase tracking-wider text-[10px]">
                  Archival Motif:
                </span>
                <span className="font-serif italic">{activePillar.motif}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Supporting Macro Garment Shot */}
          <div className="lg:col-span-6 relative flex justify-center">
            <div className="relative w-full max-w-[280px] sm:max-w-sm lg:max-w-[380px] aspect-[4/5] max-h-[380px] sm:max-h-[440px] bg-noir-surface border border-gold/40 shadow-2xl overflow-hidden">
              <Image
                key={activePillar.image}
                src={activePillar.image}
                alt={activePillar.title}
                fill
                sizes="(max-width: 1024px) 100vw, 380px"
                className="object-cover transition-opacity duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-noir/80 via-transparent to-transparent opacity-50" />

              <div className="absolute bottom-3 left-3 right-3 p-3 bg-noir/90 border border-gold/30 backdrop-blur-md text-center">
                <p className="font-serif text-xs sm:text-sm text-gold-foil italic">
                  &ldquo;{activePillar.title}&rdquo;
                </p>
                <p className="text-[9.5px] text-ivory/60 uppercase tracking-widest mt-0.5">
                  Jaipur & Varanasi Guild Handcraft
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
