"use client";

import React, { useState, useEffect } from "react";
import { formatDate, formatPrice } from "@/lib/utils";
import {
  BarChart3,
  Search,
  TrendingUp,
  MessageSquare,
  AlertTriangle,
  RefreshCw,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface UnmetSearch {
  query: string;
  count: number;
  lastSeen: string;
  filtersUsed: any;
}

interface ChatMsg {
  id: string;
  content: string;
  createdAt: string;
}

interface ZeroStockVariant {
  id: string;
  sku: string;
  color: string;
  size: string;
  inventory: { quantity: number } | null;
  product: { name: string; id: string };
}

export default function InsightsPage() {
  const [unmetSearches, setUnmetSearches] = useState<UnmetSearch[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([]);
  const [zeroStock, setZeroStock] = useState<ZeroStockVariant[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/insights");
      if (res.ok) {
        const data = await res.json();
        setUnmetSearches(data.unmetSearches || []);
        setChatMessages(data.chatMessages || []);
        setZeroStock(data.zeroStockVariants || []);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center text-xs uppercase tracking-widest text-noir/50">
        Analysing atelier intelligence data...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 border border-gold/30 p-6 shadow-xs">
        <div>
          <h1 className="font-serif text-2xl text-oxblood font-semibold flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-gold-dark" />
            AI Demand Intelligence
          </h1>
          <p className="text-xs text-noir/60 mt-1">
            Patron search trends, AI concierge conversations, and stock-out
            alerts — all in one view.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchInsights}
          className="gap-1.5 text-xs text-oxblood border-gold/30 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: Unmet Searches (2/3 width on xl) */}
        <div className="xl:col-span-2 space-y-6">
          {/* Unmet Searches Card */}
          <div className="bg-white/90 border border-gold/30 shadow-xs">
            <div className="flex items-center justify-between p-5 border-b border-gold/15">
              <div>
                <h2 className="font-serif text-lg text-oxblood font-semibold flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-gold" />
                  Unmet Patron Demand
                </h2>
                <p className="text-xs text-noir/50 mt-0.5">
                  Queries where the AI Concierge found 0 matching pieces.
                  These reveal the atelier's next design opportunities.
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-gold/10 text-gold-dark border border-gold/30 shrink-0">
                {unmetSearches.length} unique
              </span>
            </div>

            {unmetSearches.length === 0 ? (
              <div className="p-8 text-center text-xs text-noir/40 italic">
                No unmet searches recorded. The AI Concierge is satisfying all
                patron queries.
              </div>
            ) : (
              <div className="divide-y divide-gold/10 max-h-80 overflow-y-auto">
                {unmetSearches.map((s, i) => (
                  <div
                    key={i}
                    className="px-5 py-3 flex items-center justify-between gap-4 hover:bg-gold/5 transition-colors"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-6 h-6 rounded-full bg-oxblood/10 text-oxblood text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-noir truncate">
                          &ldquo;{s.query}&rdquo;
                        </p>
                        {s.filtersUsed &&
                          Object.keys(s.filtersUsed).length > 0 && (
                            <p className="text-[10px] font-mono text-noir/40 mt-0.5 truncate">
                              Filters: {JSON.stringify(s.filtersUsed)}
                            </p>
                          )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 text-xs">
                      <span className="px-2 py-0.5 bg-oxblood/10 text-oxblood border border-oxblood/20 font-semibold text-[10px]">
                        {s.count}×
                      </span>
                      <span className="text-[10px] text-noir/40">
                        {formatDate(s.lastSeen)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Chat Log Card */}
          <div className="bg-white/90 border border-gold/30 shadow-xs">
            <div className="flex items-center justify-between p-5 border-b border-gold/15">
              <div>
                <h2 className="font-serif text-lg text-oxblood font-semibold flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-gold" />
                  Recent AI Concierge Conversations
                </h2>
                <p className="text-xs text-noir/50 mt-0.5">
                  Latest patron questions — detect high-intent buyers and
                  styling queries.
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-gold/10 text-gold-dark border border-gold/30 shrink-0">
                {chatMessages.length} messages
              </span>
            </div>

            {chatMessages.length === 0 ? (
              <div className="p-8 text-center text-xs text-noir/40 italic">
                No AI Concierge conversations recorded yet.
              </div>
            ) : (
              <div className="divide-y divide-gold/10 max-h-72 overflow-y-auto">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className="px-5 py-3 hover:bg-gold/5 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-xs text-noir leading-relaxed line-clamp-2">
                        <span className="text-gold-dark font-semibold mr-1.5">
                          Patron:
                        </span>
                        {msg.content}
                      </p>
                      <span className="text-[10px] text-noir/40 shrink-0 mt-0.5">
                        {formatDate(msg.createdAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Stock Alerts */}
        <div className="space-y-6">
          {/* Zero Stock Alert Card */}
          <div className="bg-white/90 border border-red-200 shadow-xs">
            <div className="flex items-center justify-between p-5 border-b border-red-100 bg-red-50/60">
              <h2 className="font-serif text-base text-red-700 font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Out-of-Stock SKUs
              </h2>
              <span
                className={`text-xs font-semibold px-2.5 py-1 border font-mono ${
                  zeroStock.length > 0
                    ? "bg-red-100 text-red-700 border-red-200"
                    : "bg-emerald/10 text-emerald border-emerald/30"
                }`}
              >
                {zeroStock.length}
              </span>
            </div>

            {zeroStock.length === 0 ? (
              <div className="p-6 text-center text-xs text-emerald italic">
                ✓ All active SKUs are in stock.
              </div>
            ) : (
              <div className="divide-y divide-red-50 max-h-96 overflow-y-auto">
                {zeroStock.map((v) => (
                  <div
                    key={v.id}
                    className="px-4 py-3 hover:bg-red-50/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-noir truncate">
                          {v.product.name}
                        </p>
                        <p className="text-[10px] text-noir/50 mt-0.5">
                          {v.color} · {v.size}
                        </p>
                        <p className="text-[10px] font-mono text-noir/40">
                          {v.sku}
                        </p>
                      </div>
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 bg-red-100 text-red-700 border border-red-200 shrink-0">
                        0 units
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {zeroStock.length > 0 && (
              <div className="p-4 border-t border-red-100">
                <Link
                  href="/admin"
                  className="text-xs uppercase tracking-wider text-oxblood hover:text-gold font-medium flex items-center gap-1.5 transition-colors"
                >
                  <Package className="w-3.5 h-3.5" />
                  Go to Inventory Manager →
                </Link>
              </div>
            )}
          </div>

          {/* Summary Insight Card */}
          <div className="bg-gradient-to-br from-oxblood/5 to-gold/5 border border-gold/25 p-5 shadow-xs">
            <h3 className="font-serif text-base text-oxblood font-semibold mb-3">
              Atelier Intelligence Summary
            </h3>
            <div className="space-y-3 text-xs text-noir/70">
              <div className="flex items-start gap-2">
                <Search className="w-3.5 h-3.5 text-gold shrink-0 mt-0.5" />
                <p>
                  <strong>{unmetSearches.length}</strong> unique patron requests
                  found no matching pieces — these are design commissions
                  waiting to be fulfilled.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <MessageSquare className="w-3.5 h-3.5 text-gold shrink-0 mt-0.5" />
                <p>
                  <strong>{chatMessages.length}</strong> recent AI Concierge
                  conversations recorded this session.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                <p>
                  <strong className={zeroStock.length > 0 ? "text-red-600" : ""}>
                    {zeroStock.length}
                  </strong>{" "}
                  active SKUs are completely out of stock and unavailable to
                  patrons.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
