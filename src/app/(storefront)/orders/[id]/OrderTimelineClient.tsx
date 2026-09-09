"use client";

import React, { useState } from "react";
import Link from "next/link";
import { formatPrice, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Clock,
  Package,
  Truck,
  AlertTriangle,
  ArrowLeft,
  XCircle,
  ShieldCheck,
} from "lucide-react";

interface OrderTimelineClientProps {
  order: any;
}

const STEPS = [
  { status: "PENDING", label: "Commission Placed", icon: Clock },
  { status: "CONFIRMED", label: "Payment Honored", icon: CheckCircle2 },
  { status: "PROCESSING", label: "Atelier Tailoring", icon: Package },
  { status: "SHIPPED", label: "Insured Transit", icon: Truck },
  { status: "DELIVERED", label: "Client Handover", icon: ShieldCheck },
];

export function OrderTimelineClient({ order: initialOrder }: OrderTimelineClientProps) {
  const [order, setOrder] = useState(initialOrder);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");
  const [cancelSuccess, setCancelSuccess] = useState("");

  const isCancelled = order.status === "CANCELLED";
  const canCancel = order.status === "PENDING" || order.status === "CONFIRMED";

  const getStepIndex = (status: string) => {
    return STEPS.findIndex((s) => s.status === status);
  };

  const currentStepIdx = isCancelled ? -1 : getStepIndex(order.status);

  const handleCancelOrder = async () => {
    if (!confirm("Are you sure you wish to cancel this bespoke order? All reserved pieces will be restored to the vault.")) {
      return;
    }

    setCancelling(true);
    setCancelError("");

    try {
      const res = await fetch(`/api/orders/${order.id}/cancel`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        setCancelError(data.error || "Failed to cancel order.");
      } else {
        setCancelSuccess("Order cancelled. Stock has been restored to the atelier vault.");
        setOrder((prev: any) => ({
          ...prev,
          status: "CANCELLED",
          statusHistory: [
            ...prev.statusHistory,
            {
              id: "temp-cancel",
              status: "CANCELLED",
              note: "Order cancelled by client. Stock restored atomically to vault.",
              createdAt: new Date().toISOString(),
            },
          ],
        }));
      }
    } catch (err: any) {
      setCancelError(err.message || "Failed to communicate with server.");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="min-h-screen bg-regal-texture py-12 px-4 md:px-8 transition-colors duration-300">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Navigation & Order Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gold/20">
          <Link
            href="/shop"
            className="text-xs uppercase tracking-[0.2em] text-oxblood dark:text-gold-light hover:text-gold transition-colors font-medium flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Continue Browsing
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-xs text-noir/50 dark:text-ivory/50 uppercase tracking-widest">
              Confirmation No:
            </span>
            <span className="font-mono text-sm font-semibold text-oxblood dark:text-gold-foil bg-gold/10 border border-gold/30 px-3 py-1">
              {order.orderNumber}
            </span>
          </div>
        </div>

        {/* State Machine Status Timeline */}
        <div className="bg-white/90 dark:bg-[#161214] border border-gold/30 dark:border-gold/20 p-6 md:p-10 shadow-xs transition-colors duration-300">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <p className="text-[10px] uppercase tracking-[0.35em] text-gold-dark dark:text-gold-light font-semibold">
                Order State Machine
              </p>
              <h1 className="text-2xl md:text-3xl font-serif text-oxblood dark:text-gold-foil mt-1">
                {isCancelled ? "Order Cancelled" : "Creation & Delivery Timeline"}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`text-xs uppercase tracking-[0.2em] px-3.5 py-1 font-semibold border ${
                  isCancelled
                    ? "bg-red-50 text-red-700 border-red-200"
                    : order.status === "DELIVERED"
                    ? "bg-emerald/10 text-emerald border-emerald/30"
                    : "bg-gold/15 text-gold-dark border-gold/40"
                }`}
              >
                {order.status}
              </span>

              {canCancel && (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={cancelling}
                  onClick={handleCancelOrder}
                  className="text-red-700 border-red-300 hover:bg-red-50 text-[10px]"
                >
                  {cancelling ? "Restoring..." : "Cancel Order"}
                </Button>
              )}
            </div>
          </div>

          {cancelError && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{cancelError}</span>
            </div>
          )}

          {cancelSuccess && (
            <div className="mb-6 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{cancelSuccess}</span>
            </div>
          )}

          {/* Stepper Progress Bar */}
          {!isCancelled ? (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-4">
              {STEPS.map((step, idx) => {
                const Icon = step.icon;
                const isPassed = currentStepIdx >= idx;
                const isCurrent = currentStepIdx === idx;

                return (
                  <div
                    key={step.status}
                    className={`relative flex flex-col items-center text-center p-3 border transition-all ${
                      isCurrent
                        ? "bg-oxblood text-gold-light border-oxblood shadow-xs"
                        : isPassed
                        ? "bg-gold/10 text-oxblood border-gold/40"
                        : "bg-white/40 text-noir/30 border-gold/15"
                    }`}
                  >
                    <Icon className={`w-5 h-5 mb-2 ${isCurrent ? "text-gold-foil" : ""}`} />
                    <span className="text-[11px] font-serif uppercase tracking-wider font-semibold">
                      {step.label}
                    </span>
                    <span className="text-[9px] uppercase tracking-widest mt-1 opacity-70">
                      Step {idx + 1}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-3">
              <XCircle className="w-5 h-5 text-red-600 shrink-0" />
              <div>
                <p className="font-semibold">Order Retracted</p>
                <p className="text-red-700 mt-0.5">
                  This commission has been cancelled. Inventory units were immediately restored to the active catalogue.
                </p>
              </div>
            </div>
          )}

          {/* Status Change Audit Log */}
          <div className="mt-8 pt-6 border-t border-gold/20">
            <h3 className="text-xs uppercase tracking-[0.25em] text-noir/60 font-semibold mb-4">
              Atelier Ledger Log
            </h3>
            <div className="space-y-3">
              {order.statusHistory.map((hist: any) => (
                <div
                  key={hist.id}
                  className="flex items-start justify-between text-xs py-2 border-b border-gold/10 last:border-0"
                >
                  <div className="space-y-0.5">
                    <span className="font-serif font-semibold text-oxblood uppercase tracking-wider">
                      {hist.status}
                    </span>
                    {hist.note && (
                      <p className="text-noir/70 italic">&ldquo;{hist.note}&rdquo;</p>
                    )}
                  </div>
                  <span className="text-noir/40 text-[11px] shrink-0 ml-4">
                    {formatDate(hist.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Details & Summary Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Purchased Items (Left Col) */}
          <div className="lg:col-span-8 bg-white/90 dark:bg-[#161214] border border-gold/30 dark:border-gold/20 p-6 md:p-8 shadow-xs space-y-6 transition-colors duration-300">
            <h2 className="font-serif text-lg text-oxblood dark:text-gold-foil border-b border-gold/20 pb-3 font-semibold">
              Commissioned Garments
            </h2>

            <div className="divide-y divide-gold/15">
              {order.items.map((it: any) => (
                <div key={it.id} className="py-4 first:pt-0 flex justify-between items-center text-xs">
                  <div>
                    <h3 className="font-serif text-sm md:text-base text-oxblood font-semibold">
                      {it.title}
                    </h3>
                    <p className="text-noir/60 mt-0.5">
                      Shade: {it.color} · Size: {it.size} · SKU: <span className="font-mono text-[10px]">{it.sku}</span>
                    </p>
                    <p className="text-noir/50 mt-0.5">
                      {formatPrice(it.unitPriceAtPurchase)} × {it.qty}
                    </p>
                  </div>
                  <span className="font-serif text-sm font-semibold text-oxblood">
                    {formatPrice(it.subtotal)}
                  </span>
                </div>
              ))}
            </div>

            {/* Financial Summary */}
            <div className="pt-4 border-t border-gold/20 space-y-2 text-xs text-noir/70">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald font-medium">
                  <span>Privilege Discount ({order.couponCode || "COUPON"})</span>
                  <span>-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>White-Glove Delivery</span>
                <span>{order.shipping === 0 ? "Complimentary" : formatPrice(order.shipping)}</span>
              </div>
              <div className="pt-2 border-t border-gold/20 flex justify-between font-serif text-base text-oxblood font-semibold">
                <span>Total Amount Paid</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Shipping & Payment Meta (Right Col) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white/90 border border-gold/30 p-6 shadow-xs space-y-4 text-xs">
              <h3 className="font-serif text-base text-oxblood border-b border-gold/20 pb-2 font-semibold">
                Client & Delivery Details
              </h3>
              <div>
                <p className="text-noir/50 uppercase tracking-wider text-[10px]">Client</p>
                <p className="font-semibold text-noir mt-0.5">{order.customerName}</p>
                <p className="text-noir/60">{order.email}</p>
                <p className="text-noir/60">{order.phone}</p>
              </div>

              <div className="pt-2 border-t border-gold/10">
                <p className="text-noir/50 uppercase tracking-wider text-[10px]">Delivery Address</p>
                <p className="text-noir/80 mt-0.5">
                  {order.shippingAddress?.line1}<br />
                  {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.postalCode}<br />
                  {order.shippingAddress?.country}
                </p>
              </div>

              <div className="pt-2 border-t border-gold/10">
                <p className="text-noir/50 uppercase tracking-wider text-[10px]">Payment Protocol</p>
                <p className="font-medium text-emerald flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {order.paymentMethod} · {order.paymentStatus}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
