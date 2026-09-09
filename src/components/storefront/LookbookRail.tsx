"use client";

import React, { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { formatPrice } from "@/lib/utils";
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

interface LookbookItem {
  id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  image: string;
  tagline: string;
}

const FEATURED_LOOKS: LookbookItem[] = [
  {
    id: "look-1",
    name: "The Noor Mahal Velvet Lehenga",
    slug: "noor-mahal-velvet-lehenga",
    category: "Bridal Couture",
    price: 28500,
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1000&auto=format&fit=crop",
    tagline: "18-Panel Mulberry Silk Velvet with Zari Borders",
  },
  {
    id: "look-2",
    name: "The Varanasi Katan Brocade Saree",
    slug: "varanasi-katan-brocade-saree",
    category: "Heritage Sarees",
    price: 14800,
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1000&auto=format&fit=crop",
    tagline: "Interlaced Silver & Gold Gilded Kadhwa Weft",
  },
  {
    id: "look-3",
    name: "The Mehrunnisa Anarkali Ensemble",
    slug: "mehrunnisa-anarkali-ensemble",
    category: "Kalidar Ensembles",
    price: 18900,
    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1000&auto=format&fit=crop",
    tagline: "48-Meter Pleated Tissue Organza Drape",
  },
  {
    id: "look-4",
    name: "The Darbar Silk Sherwani",
    slug: "darbar-silk-sherwani",
    category: "Regal Menswear",
    price: 22500,
    image: "https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?q=80&w=1000&auto=format&fit=crop",
    tagline: "Hand-Tailored Matka Silk with Cast Brass Accents",
  },
  {
    id: "look-5",
    name: "The Sitara Tissue Silk Drape",
    slug: "sitara-tissue-silk-drape",
    category: "Heritage Sarees",
    price: 11200,
    image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=1000&auto=format&fit=crop",
    tagline: "Liquid Gold Iridescent Metallic Yarn Weave",
  },
];

export function LookbookRail() {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const offset = direction === "left" ? -400 : 400;
      scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  return (
    <section className="py-24 bg-ivory overflow-hidden border-t border-gold/25 select-none">
      <div className="max-w-7xl mx-auto px-4 md:px-8 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.35em] text-gold-dark font-semibold mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-gold-dark" />
            Editorial Lookbook
          </p>
          <h2 className="text-3xl md:text-5xl font-serif text-oxblood">
            Signature Silhouettes
          </h2>
          <p className="text-xs md:text-sm text-noir/60 mt-2">
            Drag horizontally to discover the 2026 Festive Couture showcase.
          </p>
        </div>

        {/* Arrow Navigation Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleScroll("left")}
            aria-label="Scroll left"
            className="w-10 h-10 border border-gold/40 flex items-center justify-center text-oxblood hover:bg-gold/10 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleScroll("right")}
            aria-label="Scroll right"
            className="w-10 h-10 border border-gold/40 flex items-center justify-center text-oxblood hover:bg-gold/10 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Drag-to-Explore Rail */}
      <div
        ref={scrollRef}
        data-cursor="Drag Rail"
        className="flex gap-6 overflow-x-auto px-4 md:px-8 pb-8 no-scrollbar scroll-smooth cursor-grab active:cursor-grabbing"
      >
        {FEATURED_LOOKS.map((look) => (
          <motion.div
            key={look.id}
            whileHover={{ y: -6 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="shrink-0 w-[300px] sm:w-[380px] bg-white border border-gold/30 p-4 shadow-sm flex flex-col justify-between group"
          >
            {/* Image */}
            <div className="relative aspect-[3/4] overflow-hidden bg-noir/5 border border-gold/20 mb-4">
              <Image
                src={look.image}
                alt={look.name}
                fill
                sizes="380px"
                className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute top-3 left-3 px-2.5 py-0.5 bg-ivory/95 border border-gold/30 text-[9px] uppercase tracking-widest text-oxblood font-semibold">
                {look.category}
              </div>
            </div>

            {/* Details */}
            <div className="space-y-1.5">
              <h3 className="font-serif text-lg text-oxblood font-medium truncate">
                {look.name}
              </h3>
              <p className="text-[11px] text-noir/60 line-clamp-1 italic font-serif">
                {look.tagline}
              </p>
              <div className="pt-3 border-t border-gold/15 flex items-center justify-between">
                <span className="font-serif text-sm font-semibold text-oxblood">
                  {formatPrice(look.price)}
                </span>
                <Link
                  href={`/product/${look.slug}`}
                  className="text-[10px] uppercase tracking-widest text-gold-dark hover:text-oxblood flex items-center gap-1 font-semibold transition-colors"
                >
                  Explore Creation <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
