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
      color: "text-gold-dark",
      bg: "bg-gold/10",
    },
    {
      label: "Month Revenue",
      value: metrics ? formatPrice(metrics.revenueThisMonth) : "—",
      icon: TrendingUp,
      color: "text-emerald",
      bg: "bg-emerald/10",
    },
    {
      label: "Pending Orders",
      value: metrics ? String(metrics.pendingOrders) : "—",
      icon: Clock,
      color: metrics && metrics.pendingOrders > 0 ? "text-amber-600" : "text-noir/50",
      bg: metrics && metrics.pendingOrders > 0 ? "bg-amber-50" : "bg-noir/5",
      urgent: metrics && metrics.pendingOrders > 0,
    },
    {
      label: "Low / Zero Stock SKUs",
      value: metrics ? String(metrics.lowStockCount) : "—",
      icon: AlertTriangle,
      color: metrics && metrics.lowStockCount > 0 ? "text-red-600" : "text-noir/50",
      bg: metrics && metrics.lowStockCount > 0 ? "bg-red-50" : "bg-noir/5",
      urgent: metrics && metrics.lowStockCount > 0,
    },
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
              className="text-xs uppercase tracking-wider text-ivory/60 hover:text-gold flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              View Storefront
            </Link>
          </div>
        </div>

        {/* KPI Metrics Bar */}
        <div className="bg-noir/80 border-t border-gold/15 px-4 md:px-8 py-2">
          <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3">
            {kpiCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.label}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded border ${
                    card.urgent
                      ? "border-amber-400/40 bg-amber-900/20"
                      : "border-gold/20 bg-white/5"
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded flex items-center justify-center shrink-0 ${card.bg}`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${card.color}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] uppercase tracking-widest text-ivory/40 truncate">
                      {card.label}
                    </p>
                    <p
                      className={`text-sm font-semibold font-mono leading-tight ${card.color}`}
                    >
                      {card.value}
                    </p>
                  </div>
                </div>
              );
            })}
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

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8">{children}</main>
    </div>
  );
}
