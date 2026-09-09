"use client";

import React, { useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowDown } from "lucide-react";

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
      className="relative min-h-[92vh] flex items-center justify-center overflow-hidden bg-ivory px-4 md:px-8 py-20"
    >
      {/* Background Ornamental Radial Glow */}
      <div
        ref={bgMotifRef}
        className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-25 will-change-transform"
      >
        <div className="w-[600px] h-[600px] md:w-[900px] md:h-[900px] rounded-full border border-gold/40 radial-glow" />
      </div>

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
        {/* Left Column: Kinetic Typography & CTAs */}
        <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-gold/10 border border-gold/30 backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-gold-dark" />
            <span className="text-[10px] uppercase tracking-[0.3em] text-oxblood font-semibold">
              The Festive Pret & Couture 2026
            </span>
          </div>

          <h1
            ref={headlineRef}
            className="text-4xl sm:text-6xl md:text-7xl font-serif text-oxblood leading-[1.08] tracking-tight"
          >
            <span className="block overflow-hidden">Threaded in Gold,</span>
            <span className="block overflow-hidden">
              Cut in <span className="gold-foil-text font-display italic font-semibold">Imperial Silk.</span>
            </span>
          </h1>

          <p className="max-w-xl mx-auto lg:mx-0 text-sm md:text-base text-noir/70 leading-relaxed font-sans">
            Handcrafted across 300+ artisan hours in Jaipur and Varanasi. Limited-batch bridal
            lehengas, tissue organza sarees, and tailored bandhgalas cut for timeless celebration.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            <Link href="/shop" data-cursor="Explore">
              <Button
                variant="oxblood"
                size="lg"
                className="w-full sm:w-auto h-14 px-9 text-xs tracking-[0.25em]"
              >
                Explore The Vault
              </Button>
            </Link>
            <Link href="/shop?category=heritage-sarees" data-cursor="View Sarees">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto h-14 px-8 text-xs tracking-[0.25em]"
              >
                Varanasi Brocades
              </Button>
            </Link>
          </div>

          <div className="pt-8 border-t border-gold/15 flex items-center justify-center lg:justify-start gap-8 text-[11px] uppercase tracking-widest text-noir/50">
            <div>
              <strong className="block text-oxblood font-serif text-base font-semibold">340+</strong>
              Artisan Hours
            </div>
            <div className="w-[1px] h-8 bg-gold/30" />
            <div>
              <strong className="block text-oxblood font-serif text-base font-semibold">100%</strong>
              Mulberry Silk
            </div>
            <div className="w-[1px] h-8 bg-gold/30" />
            <div>
              <strong className="block text-oxblood font-serif text-base font-semibold">Tested</strong>
              Metallic Zari
            </div>
          </div>
        </div>

        {/* Right Column: Layered Parallax Garment Shots */}
        <div className="lg:col-span-5 relative flex items-center justify-center">
          {/* Main Hero Editorial Garment */}
          <div
            ref={garmentRef}
            className="relative w-full max-w-sm md:max-w-md aspect-[3/4] bg-white border border-gold/40 shadow-2xl overflow-hidden will-change-transform"
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

            <div className="absolute bottom-4 left-4 right-4 p-4 bg-ivory/95 border border-gold/30 backdrop-blur-md">
              <p className="text-[9px] uppercase tracking-[0.25em] text-gold-dark font-semibold">
                Featured Heirloom
              </p>
              <h3 className="font-serif text-sm text-oxblood font-semibold mt-0.5">
                The Noor Mahal Velvet Lehenga
              </h3>
              <p className="text-[11px] text-noir/60 mt-0.5">Pure Zari on Silk Velvet</p>
            </div>
          </div>

          {/* Floating Foreground Detail Accent Card */}
          <div
            ref={foregroundAccentRef}
            className="hidden sm:block absolute -bottom-6 -left-8 w-44 h-48 bg-ivory border border-gold/50 shadow-xl overflow-hidden will-change-transform z-20 p-2"
          >
            <div className="relative w-full h-28 overflow-hidden bg-noir/5">
              <Image
                src="https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=600&auto=format&fit=crop"
                alt="Embroidery detail"
                fill
                sizes="160px"
                className="object-cover"
              />
            </div>
            <div className="pt-2 text-center">
              <p className="text-[9px] uppercase tracking-widest text-gold-dark font-semibold">
                Varanasi Kadhwa
              </p>
              <p className="font-serif text-[11px] text-oxblood italic">Scalloped Zari Jaal</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
