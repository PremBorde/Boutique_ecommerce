"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCart } from "@/hooks/useCart";
import { ShoppingBag, User, Search, Menu, X, ShieldCheck } from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { toggleDrawer, getItemCount } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const itemCount = getItemCount();

  const navLinks = [
    { label: "The Atelier", href: "/" },
    { label: "All Creations", href: "/shop" },
    { label: "Lehengas", href: "/shop?category=lehengas-couture" },
    { label: "Sarees", href: "/shop?category=heritage-sarees" },
    { label: "Festive Pret", href: "/shop?category=festive-pret" },
    { label: "Menswear", href: "/shop?category=regal-menswear" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-ivory/95 dark:bg-[#0C0A0B]/95 backdrop-blur-md border-b border-gold/25 dark:border-gold/15 transition-colors duration-300">
      {/* Top Heritage Micro-Ticker */}
      <div className="bg-oxblood dark:bg-[#20070B] text-gold-foil py-1.5 px-4 text-center text-[10px] uppercase tracking-[0.3em] font-medium flex items-center justify-center gap-3 border-b border-gold/15">
        <span>Hand-Crafted in Small Batches</span>
        <span>·</span>
        <span>Bespoke Indian Luxury</span>
        <span>·</span>
        <span>Complimentary Insured Delivery</span>
      </div>

      <nav className="max-w-7xl mx-auto px-4 md:px-8 h-16 md:h-18 flex items-center justify-between">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-noir dark:text-ivory hover:text-oxblood dark:hover:text-gold p-1"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Brand Wordmark */}
        <Link href="/" className="flex flex-col items-center group">
          <span className="font-display text-2xl md:text-3xl tracking-[0.22em] text-oxblood dark:text-gold-foil uppercase group-hover:text-gold transition-colors font-semibold">
            Zaria
          </span>
          <span className="text-[9px] uppercase tracking-[0.45em] text-gold-antique dark:text-gold-light/70 -mt-1 font-sans font-medium">
            Atelier · Jaipur
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-xs uppercase tracking-[0.2em] font-medium transition-colors relative py-1 ${
                  isActive
                    ? "text-oxblood dark:text-gold-light font-semibold after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1.5px] after:bg-gold"
                    : "text-noir/70 dark:text-ivory/70 hover:text-oxblood dark:hover:text-gold-light"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-4">
          <Link
            href="/shop"
            className="text-noir/70 dark:text-ivory/70 hover:text-oxblood dark:hover:text-gold-light transition-colors p-1"
            title="Search Catalogue"
          >
            <Search className="w-4 h-4" />
          </Link>

          {/* Account Icon */}
          <Link
            href="/account"
            className="text-noir/70 dark:text-ivory/70 hover:text-oxblood dark:hover:text-gold-light transition-colors p-1 relative"
            title={session?.user ? `Signed in as ${session.user.name}` : "Client Account"}
          >
            <User className="w-4 h-4" />
            {session?.user && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-gold" />
            )}
          </Link>

          {/* Theme Toggle Button */}
          <ThemeToggle />

          {/* Admin shortcut if logged in as Admin */}
          {(session?.user as any)?.role === "ADMIN" && (
            <Link
              href="/admin"
              className="hidden sm:flex items-center gap-1 text-[10px] uppercase tracking-[0.2em] px-2 py-0.5 border border-gold/40 text-gold-dark dark:text-gold-light bg-gold/10 font-medium hover:bg-gold/20 transition-colors"
            >
              <ShieldCheck className="w-3 h-3" />
              Admin
            </Link>
          )}

          {/* Bag / Cart Icon */}
          <button
            id="navbar-cart-btn"
            onClick={toggleDrawer}
            className="relative text-noir/80 dark:text-ivory/80 hover:text-oxblood dark:hover:text-gold-light transition-colors p-1 flex items-center"
            aria-label="View shopping bag"
          >
            <ShoppingBag className="w-5 h-5 text-oxblood dark:text-gold-light" />
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-oxblood dark:bg-gold-dark text-gold-foil dark:text-noir text-[10px] font-semibold flex items-center justify-center shadow-sm border border-gold/40">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gold/20 bg-ivory dark:bg-[#141012] px-6 py-6 space-y-4 animate-slide-up">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block text-xs uppercase tracking-[0.25em] text-noir/80 dark:text-ivory/80 hover:text-oxblood dark:hover:text-gold py-2 font-medium border-b border-gold/10"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 flex items-center justify-between">
            <Link
              href="/account"
              onClick={() => setMobileOpen(false)}
              className="text-xs uppercase tracking-[0.2em] text-oxblood dark:text-gold-light font-semibold"
            >
              {session?.user ? `Account (${session.user.name})` : "Sign In / Register"}
            </Link>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              {(session?.user as any)?.role === "ADMIN" && (
                <Link
                  href="/admin"
                  onClick={() => setMobileOpen(false)}
                  className="text-[10px] uppercase tracking-[0.2em] px-2 py-1 bg-gold/20 text-gold-dark dark:text-gold-light font-medium border border-gold/40"
                >
                  Admin Console
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
