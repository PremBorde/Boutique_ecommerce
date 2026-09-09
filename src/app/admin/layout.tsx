"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, Package, ShoppingBag, ArrowLeft, Layers } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const tabs = [
    { label: "Products & Stock", href: "/admin", icon: Layers },
    { label: "Bespoke Orders", href: "/admin/orders", icon: Package },
  ];

  return (
    <div className="min-h-screen bg-regal-texture text-noir">
      {/* Admin Top Header */}
      <header className="bg-noir text-ivory border-b border-gold/40 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-gold" />
            <span className="font-display text-lg tracking-[0.2em] text-gold-foil uppercase font-semibold">
              Zaria Atelier Console
            </span>
            <span className="hidden sm:inline-block text-[10px] uppercase tracking-widest px-2 py-0.5 bg-oxblood text-gold-light border border-gold/40 font-mono">
              Master Artisan Mode
            </span>
          </div>

          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="text-xs uppercase tracking-wider text-ivory/60 hover:text-gold flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              View Storefront
            </Link>
          </div>
        </div>

        {/* Admin Navigation Sub-Bar */}
        <div className="bg-noir-surface border-t border-gold/15 px-4 md:px-8">
          <div className="max-w-7xl mx-auto flex gap-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = pathname === tab.href;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`py-3 text-xs uppercase tracking-[0.2em] font-medium flex items-center gap-2 border-b-2 transition-all ${
                    isActive
                      ? "border-gold text-gold font-semibold"
                      : "border-transparent text-ivory/50 hover:text-ivory/80"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8">{children}</main>
    </div>
  );
}
