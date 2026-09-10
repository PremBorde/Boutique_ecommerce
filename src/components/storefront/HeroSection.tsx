"use client";

import React, { useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";

export function HeroSection() {
  const containerRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const bgMotifRef = useRef<HTMLDivElement>(null);
  const garmentRef = useRef<HTMLDivElement>(null);
  const foregroundAccentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const ctx = gsap.context(() => {
      // 1. Kinetic headline entrance
      if (headlineRef.current) {
        gsap.fromTo(
          headlineRef.current.children,
          {
            y: 50,
            opacity: 0,
          },
          {
            y: 0,
            opacity: 1,
            stagger: 0.15,
            duration: 1,
            ease: "power3.out",
          }
        );
      }

      // 2. Layered Parallax via ScrollTrigger scrub
      const isMobile = window.innerWidth < 768;
      if (!isMobile) {
        gsap.to(bgMotifRef.current, {
          yPercent: 30,
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });

        gsap.to(garmentRef.current, {
          yPercent: 15,
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 1,
          },
        });

        gsap.to(foregroundAccentRef.current, {
          yPercent: -20,
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 1.5,
          },
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative min-h-[calc(100vh-105px)] flex items-center justify-center overflow-hidden bg-ivory dark:bg-[#0C0A0B] px-4 md:px-8 pt-4 md:pt-6 pb-8 md:pb-12 transition-colors duration-300"
    >
      {/* Background Ornamental Radial Glow */}
      <div
        ref={bgMotifRef}
        className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-20 will-change-transform"
      >
        <div className="w-[500px] h-[500px] md:w-[750px] md:h-[750px] rounded-full bg-radial from-gold/20 via-gold/5 to-transparent blur-2xl" />
      </div>

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
        {/* Left Column: Kinetic Typography & CTAs */}
        <div className="lg:col-span-7 space-y-4 md:space-y-5 text-center lg:text-left">
          <div className="inline-flex items-center px-3 py-1 bg-gold/10 border border-gold/30 backdrop-blur-xs">
            <span className="text-[10px] uppercase tracking-[0.3em] text-oxblood dark:text-gold-light font-semibold">
              THE HERITAGE EDIT · 2026
            </span>
          </div>

          <h1
            ref={headlineRef}
            className="text-3xl sm:text-5xl md:text-6xl font-serif text-oxblood dark:text-ivory leading-[1.1] tracking-tight"
          >
            <span className="block overflow-hidden">Threaded in Gold,</span>
            <span className="block overflow-hidden">
              Cut in <span className="gold-foil-text font-display italic font-semibold">Imperial Silk.</span>
            </span>
          </h1>

          <p className="max-w-xl mx-auto lg:mx-0 text-xs md:text-sm text-noir/70 dark:text-ivory/70 leading-relaxed font-sans">
            Contemporary Indian luxury, shaped by heritage textiles, intricate craftsmanship and modern silhouettes.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5">
            <Link href="/shop">
              <Button
                variant="oxblood"
                size="lg"
                className="w-full sm:w-auto h-12 px-8 text-xs tracking-[0.25em]"
              >
                Shop Collection
              </Button>
            </Link>
            <Link href="/shop?category=heritage-sarees">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto h-12 px-7 text-xs tracking-[0.25em] text-noir dark:text-ivory border-gold/40 hover:bg-gold/10"
              >
                Heritage Sarees
              </Button>
            </Link>
          </div>

          <div className="pt-5 border-t border-gold/15 dark:border-gold/10 flex items-center justify-center lg:justify-start gap-2.5 xs:gap-4 sm:gap-8 text-[8.5px] xs:text-[9.5px] sm:text-[11px] uppercase tracking-wider sm:tracking-widest text-noir/50 dark:text-ivory/50">
            <div>
              <strong className="block text-oxblood dark:text-gold-foil font-serif text-sm sm:text-base font-semibold">Master</strong>
              Karigars
            </div>
            <div className="w-[1px] h-7 bg-gold/30" />
            <div>
              <strong className="block text-oxblood dark:text-gold-foil font-serif text-base font-semibold">Mulberry</strong>
              Silk
            </div>
            <div className="w-[1px] h-7 bg-gold/30" />
            <div>
              <strong className="block text-oxblood dark:text-gold-foil font-serif text-base font-semibold">Handwork</strong>
              Zari Embroidery
            </div>
          </div>
        </div>

        {/* Right Column: Layered Parallax Garment Shots */}
        <div className="lg:col-span-5 relative flex items-center justify-center">
          {/* Main Hero Editorial Garment */}
          <div
            ref={garmentRef}
            className="relative w-full max-w-xs sm:max-w-sm lg:max-w-[400px] aspect-[3/4] max-h-[500px] bg-white dark:bg-[#161214] border border-gold/40 shadow-2xl overflow-hidden will-change-transform"
          >
            <Image
              src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1200&auto=format&fit=crop"
              alt="Noor Mahal Velvet Lehenga by Zaria Atelier"
              fill
              priority
              sizes="(max-width: 768px) 90vw, 450px"
              className="object-cover scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-noir/70 via-transparent to-transparent opacity-60" />

            <div className="absolute bottom-4 left-4 right-4 p-4 bg-ivory/95 dark:bg-[#171215]/95 border border-gold/30 backdrop-blur-md">
              <p className="text-[9px] uppercase tracking-[0.25em] text-gold-dark dark:text-gold-light font-semibold">
                Featured Design
              </p>
              <h3 className="font-serif text-sm text-oxblood dark:text-gold-foil font-semibold mt-0.5">
                The Noor Mahal Velvet Lehenga
              </h3>
              <p className="text-[11px] text-noir/60 dark:text-ivory/60 mt-0.5">Pure Zari on Silk Velvet</p>
            </div>
          </div>

          {/* Floating Foreground Detail Accent Card */}
          <div
            ref={foregroundAccentRef}
            className="hidden sm:block absolute -bottom-4 -left-6 w-36 sm:w-40 h-44 bg-ivory dark:bg-[#171215] border border-gold/50 shadow-xl overflow-hidden will-change-transform z-20 p-2"
          >
            <div className="relative w-full h-24 sm:h-26 overflow-hidden bg-noir/5 dark:bg-noir/40">
              <Image
                src="https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=600&auto=format&fit=crop"
                alt="Embroidery detail"
                fill
                sizes="160px"
                className="object-cover"
              />
            </div>
            <div className="pt-1.5 text-center">
              <p className="text-[8.5px] uppercase tracking-widest text-gold-dark dark:text-gold-light font-semibold">
                Master Handloom
              </p>
              <p className="font-serif text-[10.5px] text-oxblood dark:text-gold-light italic">Scalloped Zari Jaal</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
