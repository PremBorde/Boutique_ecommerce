import React from "react";
import Link from "next/link";
import { Gem, Shield, Clock, Compass } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-noir text-ivory/80 pt-20 pb-12 border-t border-gold/30">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Heritage Trust Badges */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-16 border-b border-gold/20 text-center md:text-left">
          <div className="flex flex-col items-center md:items-start space-y-2">
            <Gem className="w-5 h-5 text-gold mb-1" />
            <h4 className="font-serif text-sm text-ivory uppercase tracking-wider">Heritage Craft</h4>
            <p className="text-xs text-ivory/60 leading-relaxed">
              Authentic hand-embroidery, dabka, and pit-loom weaves from master generational artisans.
            </p>
          </div>
          <div className="flex flex-col items-center md:items-start space-y-2">
            <Shield className="w-5 h-5 text-gold mb-1" />
            <h4 className="font-serif text-sm text-ivory uppercase tracking-wider">Purity Hallmark</h4>
            <p className="text-xs text-ivory/60 leading-relaxed">
              100% genuine Mulberry silks, Katan brocades, and verified metallic zari threads.
            </p>
          </div>
          <div className="flex flex-col items-center md:items-start space-y-2">
            <Compass className="w-5 h-5 text-gold mb-1" />
            <h4 className="font-serif text-sm text-ivory uppercase tracking-wider">Bespoke Fit</h4>
            <p className="text-xs text-ivory/60 leading-relaxed">
              Personalized size consultations with our virtual AI stylist and atelier tailors.
            </p>
          </div>
          <div className="flex flex-col items-center md:items-start space-y-2">
            <Clock className="w-5 h-5 text-gold mb-1" />
            <h4 className="font-serif text-sm text-ivory uppercase tracking-wider">White-Glove Delivery</h4>
            <p className="text-xs text-ivory/60 leading-relaxed">
              Fully insured express transit worldwide in custom archival keepsake boxes.
            </p>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 py-16">
          {/* Brand Col */}
          <div className="md:col-span-4 space-y-4">
            <Link href="/" className="inline-block">
              <span className="font-display text-2xl tracking-[0.25em] text-gold-foil uppercase font-semibold">
                Zaria
              </span>
              <span className="block text-[10px] uppercase tracking-[0.35em] text-ivory/50">
                Atelier · All Over India
              </span>
            </Link>
            <p className="text-xs text-ivory/70 max-w-sm leading-relaxed">
              Threaded in Gold, Cut in Silk. An editorial Indian couture house celebrating regional
              weaving guilds, regal silhouettes, and baroque ornament all over India.
            </p>
            <p className="text-[11px] text-gold-antique tracking-widest font-mono">
              EST. MMXXVI · ALL OVER INDIA
            </p>
          </div>

          {/* Collections */}
          <div className="md:col-span-3 space-y-3">
            <p className="text-[11px] uppercase tracking-[0.25em] text-gold font-semibold">
              The Collections
            </p>
            <ul className="space-y-2 text-xs text-ivory/70">
              <li>
                <Link href="/shop?category=lehengas-couture" className="hover:text-gold transition-colors">
                  Heirloom Bridal Lehengas
                </Link>
              </li>
              <li>
                <Link href="/shop?category=heritage-sarees" className="hover:text-gold transition-colors">
                  Varanasi Katan Sarees
                </Link>
              </li>
              <li>
                <Link href="/shop?category=anarkalis-ensembles" className="hover:text-gold transition-colors">
                  Kalidar Anarkali Sets
                </Link>
              </li>
              <li>
                <Link href="/shop?category=festive-pret" className="hover:text-gold transition-colors">
                  Festive Silk Pret
                </Link>
              </li>
              <li>
                <Link href="/shop?category=regal-menswear" className="hover:text-gold transition-colors">
                  Achkans & Sherwanis
                </Link>
              </li>
            </ul>
          </div>

          {/* Client Privileges */}
          <div className="md:col-span-2 space-y-3">
            <p className="text-[11px] uppercase tracking-[0.25em] text-gold font-semibold">
              Client Services
            </p>
            <ul className="space-y-2 text-xs text-ivory/70">
              <li>
                <Link href="/account" className="hover:text-gold transition-colors">
                  Private Account
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-gold transition-colors">
                  Your Atelier Bag
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-gold transition-colors">
                  Catalogue Search
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-gold transition-colors">
                  Atelier Master Console
                </Link>
              </li>
            </ul>
          </div>

          {/* Store Hours & Atelier */}
          <div className="md:col-span-3 space-y-3">
            <p className="text-[11px] uppercase tracking-[0.25em] text-gold font-semibold">
              Flagship Atelier
            </p>
            <p className="text-xs text-ivory/70 leading-relaxed">
              Haveli 14, Civil Lines, Jaipur 302006<br />
              Rajasthan, India
            </p>
            <p className="text-xs text-ivory/60 pt-1">
              Private Viewings: Mon – Sat, 11:00 – 19:30 IST<br />
              Concierge: concierge@zariaatelier.com
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-gold/15 flex flex-col sm:flex-row items-center justify-between text-[11px] text-ivory/40 tracking-wider">
          <p>© {new Date().getFullYear()} Zaria Atelier. All Rights Reserved.</p>
          <p className="mt-2 sm:mt-0 font-serif italic text-gold/70">
            Crafted with devotional precision for the discerning collector.
          </p>
        </div>
      </div>
    </footer>
  );
}
