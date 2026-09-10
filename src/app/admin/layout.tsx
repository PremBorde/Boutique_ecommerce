"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldCheck,
  Package,
  ArrowLeft,
  Layers,
  Tag,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Clock,
  IndianRupee,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

interface Metrics {
  totalRevenue: number;
  pendingOrders: number;
  lowStockCount: number;
  avgOrderValue: number;
  revenueThisMonth: number;
  totalOrders: number;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [metrics, setMetrics] = useState<Metrics | null>(null);

  useEffect(() => {
    fetch("/api/admin/metrics")
      .then((r) => r.json())
      .then((d) => setMetrics(d))
      .catch(() => {});
  }, []);

  const tabs = [
    { label: "Products & Stock", href: "/admin", icon: Layers },
    { label: "Bespoke Orders", href: "/admin/orders", icon: Package },
    { label: "Promo Coupons", href: "/admin/coupons", icon: Tag },
    { label: "AI Insights", href: "/admin/insights", icon: BarChart3 },
  ];

  const kpiCards = [
    {
      label: "Total Revenue",
      value: metrics ? formatPrice(metrics.totalRevenue) : "—",
      icon: IndianRupee,
      iconBox: "bg-gold/15 text-gold-dark dark:text-gold-light border border-gold/30",
      subText: "All non-cancelled orders",
    },
    {
      label: "This Month",
      value: metrics ? formatPrice(metrics.revenueThisMonth) : "—",
      icon: TrendingUp,
      iconBox: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20",
      subText: "Current calendar month",
    },
    {
      label: "Pending Orders",
      value: metrics ? String(metrics.pendingOrders) : "—",
      icon: Clock,
      iconBox: metrics && metrics.pendingOrders > 0
        ? "bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30"
        : "bg-gold/10 text-noir/50 dark:text-ivory/50 border border-gold/20",
      subText: "Awaiting preparation & cut",
    },
    {
      label: "Stock Alerts",
      value: metrics ? String(metrics.lowStockCount) : "—",
      icon: AlertTriangle,
      iconBox: metrics && metrics.lowStockCount > 0
        ? "bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30"
        : "bg-gold/10 text-noir/50 dark:text-ivory/50 border border-gold/20",
      subText: "Variants at zero stock",
    },
  ];

  return (
    <div className="min-h-screen bg-regal-texture text-noir dark:text-ivory transition-colors duration-300">
      {/* Admin Top Header */}
      <header className="bg-noir text-ivory border-b border-gold/40 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-8 h-14 sm:h-16 flex items-center justify-between gap-2">
          {/* Brand */}
          <div className="flex items-center gap-2 min-w-0">
            <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-gold shrink-0" />
            {/* Mobile: compact monogram */}
            <span className="sm:hidden font-display text-sm tracking-[0.15em] text-gold-foil uppercase font-semibold leading-tight">
              Zakia<br />
              <span className="text-[10px] tracking-[0.1em] text-gold/70">Atelier Console</span>
            </span>
            {/* Desktop: full name */}
            <span className="hidden sm:inline font-display text-base md:text-lg tracking-[0.2em] text-gold-foil uppercase font-semibold whitespace-nowrap">
              Zakia Atelier Console
            </span>
            <span className="hidden lg:inline-block text-[10px] uppercase tracking-widest px-2.5 py-0.5 bg-oxblood text-gold-light border border-gold/40 font-mono whitespace-nowrap">
              Admin: Prem Borde
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <span className="hidden xl:inline-block text-xs text-gold-foil font-serif whitespace-nowrap">
              Logged in as <strong className="text-gold-light font-sans font-semibold">Prem Borde</strong>
            </span>
            <ThemeToggle />
            <Link
              href="/"
              className="text-[10px] sm:text-xs uppercase tracking-wider text-ivory/70 hover:text-gold flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 border border-gold/30 hover:border-gold transition-colors whitespace-nowrap"
            >
              <ArrowLeft className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span className="hidden xs:inline">View </span>Storefront
            </Link>
          </div>
        </div>

        {/* Admin Navigation Sub-Bar */}
        <div className="bg-noir-surface border-t border-gold/15 px-3 sm:px-4 md:px-8">
          <div className="max-w-7xl mx-auto flex gap-3 sm:gap-5 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive =
                tab.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(tab.href);
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`py-2.5 sm:py-3 text-[10px] sm:text-xs uppercase tracking-[0.15em] sm:tracking-[0.2em] font-medium flex items-center gap-1.5 border-b-2 transition-all whitespace-nowrap ${
                    isActive
                      ? "border-gold text-gold font-semibold"
                      : "border-transparent text-ivory/50 hover:text-ivory/80"
                  }`}
                >
                  <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                  <span className="hidden xs:inline">{tab.label}</span>
                  {/* Ultra-small: icon only — label hidden */}
                  <span className="xs:hidden">{tab.label.split(" ")[0]}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-8 py-4 sm:py-6 md:py-8 space-y-4 sm:space-y-6 md:space-y-8">
        {/* KPI Metrics Summary Grid — 2×2 on mobile, 4 across on desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
          {kpiCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className="bg-white/90 dark:bg-[#161214] border border-gold/30 dark:border-gold/20 p-3 sm:p-4 md:p-5 shadow-xs hover:border-gold transition-all flex flex-col justify-between"
              >
                <div className="flex items-start justify-between gap-2 mb-2 sm:mb-3">
                  <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.15em] sm:tracking-[0.25em] text-noir/60 dark:text-ivory/60 font-semibold leading-tight">
                    {card.label}
                  </span>
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 ${card.iconBox}`}>
                    <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                </div>

                <div>
                  <p className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-oxblood dark:text-gold-foil leading-none">
                    {card.value}
                  </p>
                  <p className="text-[9px] sm:text-[11px] text-noir/50 dark:text-ivory/50 mt-1 sm:mt-2 leading-tight">
                    {card.subText}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Tab Page Content */}
        <div>{children}</div>
      </main>
    </div>
  );
}
