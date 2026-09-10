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
    <div className="min-h-screen bg-regal-texture text-noir">
      {/* Admin Top Header */}
      <header className="bg-noir text-ivory border-b border-gold/40 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-gold" />
            <span className="font-display text-lg tracking-[0.2em] text-gold-foil uppercase font-semibold">
              Zaria Atelier Console
            </span>
            <span className="hidden sm:inline-block text-[10px] uppercase tracking-widest px-2.5 py-0.5 bg-oxblood text-gold-light border border-gold/40 font-mono">
              Admin: Prem Borde
            </span>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <span className="hidden md:inline-block text-xs text-gold-foil font-serif">
              Logged in as <strong className="text-gold-light font-sans font-semibold">Prem Borde</strong>
            </span>
            <Link
              href="/"
              className="text-xs uppercase tracking-wider text-ivory/70 hover:text-gold flex items-center gap-1.5 px-3 py-1.5 border border-gold/30 hover:border-gold transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              View Storefront
            </Link>
          </div>
        </div>

        {/* Admin Navigation Sub-Bar */}
        <div className="bg-noir-surface border-t border-gold/15 px-4 md:px-8">
          <div className="max-w-7xl mx-auto flex gap-6 overflow-x-auto no-scrollbar">
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
                  className={`py-3 text-xs uppercase tracking-[0.2em] font-medium flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
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

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
        {/* KPI Metrics Summary Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className="bg-white/90 dark:bg-[#161214] border border-gold/30 dark:border-gold/20 p-5 shadow-xs hover:border-gold transition-all flex flex-col justify-between"
              >
                <div className="flex items-center justify-between gap-3 mb-3">
                  <span className="text-[10px] uppercase tracking-[0.25em] text-noir/60 dark:text-ivory/60 font-semibold truncate">
                    {card.label}
                  </span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${card.iconBox}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                <div>
                  <p className="font-serif text-2xl lg:text-3xl font-bold text-oxblood dark:text-gold-foil leading-none">
                    {card.value}
                  </p>
                  <p className="text-[11px] text-noir/50 dark:text-ivory/50 mt-2 flex items-center gap-1.5">
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
