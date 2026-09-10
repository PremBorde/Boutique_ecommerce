"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCart } from "@/hooks/useCart";
import { ShoppingBag, User, Search, Menu, X, ShieldCheck } from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

interface NavItem {
  label: string;
  href: string;
}

const NAV_LINKS: NavItem[] = [
  { label: "The Atelier", href: "/" },
  { label: "All Creations", href: "/shop" },
  { label: "Lehengas", href: "/shop?category=lehengas-couture" },
  { label: "Sarees", href: "/shop?category=heritage-sarees" },
  { label: "Festive Pret", href: "/shop?category=festive-pret" },
  { label: "Menswear", href: "/shop?category=regal-menswear" },
];

function DesktopNavLinks() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category");

  return (
    <div className="hidden md:flex items-center space-x-8">
      {NAV_LINKS.map((link) => {
        let isActive = false;
        if (link.href === "/") {
          isActive = pathname === "/";
        } else if (link.href === "/shop") {
          isActive = pathname === "/shop" && !currentCategory;
        } else if (link.href.includes("category=")) {
          const cat = link.href.split("category=")[1];
          isActive = pathname === "/shop" && currentCategory === cat;
        } else {
          isActive = pathname === link.href;
        }

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
  );
}

function MobileNavLinks({ onClose }: { onClose: () => void }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category");

  return (
    <>
      {NAV_LINKS.map((link) => {
        let isActive = false;
        if (link.href === "/") {
          isActive = pathname === "/";
        } else if (link.href === "/shop") {
          isActive = pathname === "/shop" && !currentCategory;
        } else if (link.href.includes("category=")) {
          const cat = link.href.split("category=")[1];
          isActive = pathname === "/shop" && currentCategory === cat;
        } else {
          isActive = pathname === link.href;
        }

        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onClose}
            className={`block text-xs uppercase tracking-[0.25em] py-2 font-medium border-b border-gold/10 transition-colors ${
              isActive
                ? "text-oxblood dark:text-gold-light font-semibold border-gold"
                : "text-noir/80 dark:text-ivory/80 hover:text-oxblood dark:hover:text-gold"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </>
  );
}

function DesktopNavFallback() {
  return (
    <div className="hidden md:flex items-center space-x-8">
      {NAV_LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="text-xs uppercase tracking-[0.2em] font-medium transition-colors relative py-1 text-noir/70 dark:text-ivory/70 hover:text-oxblood dark:hover:text-gold-light"
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { toggleDrawer, getItemCount } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const itemCount = mounted ? getItemCount() : 0;

  return (
    <header className="sticky top-0 z-40 bg-ivory/95 dark:bg-[#0C0A0B]/95 backdrop-blur-md border-b border-gold/25 dark:border-gold/15 transition-colors duration-300">
      {/* Top Heritage Micro-Ticker (Responsive) */}
      <div className="bg-oxblood dark:bg-[#20070B] text-gold-foil py-1.5 px-3 sm:px-4 text-center text-[9px] sm:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.3em] font-medium flex items-center justify-center gap-2 sm:gap-3 border-b border-gold/15 overflow-hidden whitespace-nowrap">
        <span className="hidden md:inline">Hand-Crafted in Small Batches ·</span>
        <span className="truncate">Bespoke Indian Luxury</span>
        <span className="hidden sm:inline">· Complimentary Insured Delivery</span>
      </div>

      <nav className="max-w-7xl mx-auto px-3 sm:px-6 md:px-8 h-15 sm:h-16 md:h-18 flex items-center justify-between">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-noir dark:text-ivory hover:text-oxblood dark:hover:text-gold w-9 h-9 flex items-center justify-center -ml-1 shrink-0 cursor-pointer"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Brand Wordmark */}
        <Link href="/" className="flex flex-col items-center group px-1 text-center">
          <span className="font-display text-xl sm:text-2xl md:text-3xl tracking-[0.18em] sm:tracking-[0.22em] text-oxblood dark:text-gold-foil uppercase group-hover:text-gold transition-colors font-semibold">
            Zaria
          </span>
          <span className="text-[7.5px] sm:text-[9px] uppercase tracking-[0.32em] sm:tracking-[0.45em] text-gold-antique dark:text-gold-light/70 -mt-0.5 font-sans font-medium whitespace-nowrap">
            Atelier · Across India
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <Suspense fallback={<DesktopNavFallback />}>
          <DesktopNavLinks />
        </Suspense>

        {/* Right Actions */}
        <div className="flex items-center space-x-1 sm:space-x-3.5 shrink-0">
          <Link
            href="/shop"
            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-noir/70 dark:text-ivory/70 hover:text-oxblood dark:hover:text-gold-light transition-colors"
            title="Search Catalogue"
            aria-label="Search Catalogue"
          >
            <Search className="w-4 h-4" />
          </Link>

          {/* Account Icon */}
          <Link
            href="/account"
            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-noir/70 dark:text-ivory/70 hover:text-oxblood dark:hover:text-gold-light transition-colors relative"
            title={session?.user ? `Signed in as ${session.user.name}` : "Client Account"}
            aria-label="Client Account"
          >
            <User className="w-4 h-4" />
            {session?.user && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-gold" />
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
            className="relative w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-noir/70 dark:text-ivory/70 hover:text-oxblood dark:hover:text-gold-light transition-colors cursor-pointer"
            aria-label="View shopping bag"
          >
            <ShoppingBag className="w-4 h-4 sm:w-[18px] sm:h-[18px] stroke-[1.4]" />
            {itemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[15px] h-[15px] px-0.5 rounded-full bg-[#4A0E17] text-[#DFC07B] text-[8px] font-sans font-medium flex items-center justify-center shadow-xs border border-[#C9A050]/50 leading-none">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gold/20 bg-ivory dark:bg-[#141012] px-6 py-6 space-y-4 animate-slide-up">
          <Suspense fallback={null}>
            <MobileNavLinks onClose={() => setMobileOpen(false)} />
          </Suspense>
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
