"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { formatPrice, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { getAllowedTransitions } from "@/lib/state-machine";
import {
  Package,
  Search,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
} from "lucide-react";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [feedback, setFeedback] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [transitioningId, setTransitioningId] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.set("q", search.trim());
      if (statusFilter !== "ALL") params.set("status", statusFilter);

      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error("Failed to load admin orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders();
  };

  const handleStatusChange = async (orderId: string, targetStatus: string) => {
    setTransitioningId(orderId);
    setFeedback(null);

    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nextStatus: targetStatus,
          note: `Transitioned to ${targetStatus} in Atelier Console.`,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setFeedback({
          msg: `Order state successfully transitioned to ${targetStatus}.`,
          type: "success",
        });
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId ? { ...o, status: targetStatus } : o
          )
        );
        setTimeout(() => setFeedback(null), 3000);
      } else {
        setFeedback({
          msg: data.error || "State transition rejected by state machine.",
          type: "error",
        });
      }
    } catch (err: any) {
      setFeedback({ msg: err.message || "Failed to transition state.", type: "error" });
    } finally {
      setTransitioningId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Filter Bar */}
      <div className="bg-white/80 border border-gold/30 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl text-oxblood font-semibold flex items-center gap-2">
            <Package className="w-5 h-5 text-gold-dark" />
            Bespoke Order State Machine Console
          </h1>
          <p className="text-xs text-noir/60 mt-1">
            Server-enforced lifecycle: PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED (Cancelling restores stock).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchOrders}
            className="text-xs text-oxblood border-gold/30"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1" />
            Sync
          </Button>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white/80 border border-gold/30 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order number or client..."
            className="w-full h-10 pl-9 pr-3 text-xs bg-white border border-gold/30 focus:border-oxblood outline-none"
          />
          <Search className="w-4 h-4 text-noir/40 absolute left-3 top-3" />
        </form>

        <div className="flex items-center gap-2 text-xs w-full sm:w-auto">
          <span className="text-noir/50 uppercase tracking-widest text-[10px]">Filter Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 text-xs bg-white border border-gold/30 text-noir focus:border-oxblood outline-none cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">PENDING</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="PROCESSING">PROCESSING</option>
            <option value="SHIPPED">SHIPPED</option>
            <option value="DELIVERED">DELIVERED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>
      </div>

      {/* Feedback Notice */}
      {feedback && (
        <div
          className={`p-3.5 text-xs flex items-center gap-2 border ${
            feedback.type === "success"
              ? "bg-emerald/10 border-emerald/30 text-emerald"
              : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{feedback.msg}</span>
        </div>
      )}

      {/* Orders List */}
      {loading ? (
        <div className="py-20 text-center text-xs uppercase tracking-widest text-noir/50">
          Auditing order registry...
        </div>
      ) : orders.length === 0 ? (
        <div className="py-16 text-center bg-white/60 border border-dashed border-gold/30 p-8">
          <p className="font-serif text-lg text-noir/70">No orders matching criteria.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const allowed = getAllowedTransitions(order.status);
            const isFinished = order.status === "DELIVERED" || order.status === "CANCELLED";

            return (
              <div
                key={order.id}
                className="bg-white/95 border border-gold/30 p-6 shadow-xs hover:border-gold transition-colors"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-gold/15 text-xs">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-semibold text-oxblood">
                        {order.orderNumber}
                      </span>
                      <span
                        className={`text-[10px] uppercase tracking-widest px-2.5 py-0.5 border font-semibold ${
                          order.status === "DELIVERED"
                            ? "bg-emerald/10 text-emerald border-emerald/30"
                            : order.status === "CANCELLED"
                            ? "bg-red-50 text-red-700 border-red-200"
                            : "bg-gold/15 text-gold-dark border-gold/40"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <p className="text-noir/60 mt-1">
                      Client: <strong className="text-noir">{order.customerName}</strong> ({order.email}) ·{" "}
                      {formatDate(order.createdAt)}
                    </p>
                  </div>

                  {/* State Machine Transition Dropdown */}
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] uppercase tracking-wider text-noir/50">
                      Transition State:
                    </span>
                    {isFinished ? (
                      <span className="text-[11px] italic text-noir/40">
                        Terminal State (No further transitions)
                      </span>
                    ) : (
                      <select
                        disabled={transitioningId === order.id || allowed.length === 0}
                        value=""
                        onChange={(e) => {
                          if (e.target.value) handleStatusChange(order.id, e.target.value);
                        }}
                        className="h-9 px-3 text-xs bg-ivory border border-gold/40 text-oxblood font-semibold focus:border-oxblood outline-none cursor-pointer"
                      >
                        <option value="">Choose Next Valid Stage...</option>
                        {allowed.map((next) => (
                          <option key={next} value={next}>
                            → Advance to {next}
                          </option>
                        ))}
                      </select>
                    )}

                    <Link
                      href={`/orders/${order.id}`}
                      className="text-[11px] uppercase tracking-wider text-oxblood hover:text-gold font-medium ml-2"
                    >
                      Customer View →
                    </Link>
                  </div>
                </div>

                {/* Items and Totals */}
                <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                  <div className="text-noir/70 space-y-1">
                    {order.items.map((it: any) => (
                      <p key={it.id}>
                        {it.title} ({it.color}, {it.size}) × {it.qty} · SKU:{" "}
                        <span className="font-mono text-[10px]">{it.sku}</span> · Purchase Price:{" "}
                        {formatPrice(it.unitPriceAtPurchase)}
                      </p>
                    ))}
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-noir/40 uppercase block">Settled Amount</span>
                    <span className="font-serif text-base font-semibold text-oxblood">
                      {formatPrice(order.total)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
