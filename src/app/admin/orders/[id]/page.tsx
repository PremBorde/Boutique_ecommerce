"use client";

import React, { useState, useEffect, useRef } from "react";
import { formatPrice, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { getAllowedTransitions } from "@/lib/state-machine";
import {
  ArrowLeft,
  Printer,
  Package,
  MapPin,
  User,
  CheckCircle2,
  AlertCircle,
  Truck,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";

interface OrderDetailPageProps {
  params: { id: string };
}

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);
  const [transitioningId, setTransitioningId] = useState<string | null>(null);
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [courierName, setCourierName] = useState("");
  const [trackingRef, setTrackingRef] = useState("");
  const [savingDispatch, setSavingDispatch] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const showFeedback = (msg: string, type: "success" | "error") => {
    setFeedback({ msg, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data.order);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [params.id]);

  const handleStatusChange = async (targetStatus: string) => {
    if (targetStatus === "SHIPPED") {
      setShowDispatchModal(true);
      return;
    }

    setTransitioningId(order.id);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nextStatus: targetStatus,
          note: `Transitioned to ${targetStatus} in Atelier Console.`,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showFeedback(`Order advanced to ${targetStatus}.`, "success");
        setOrder((prev: any) => ({ ...prev, status: targetStatus }));
      } else {
        showFeedback(data.error || "Transition rejected.", "error");
      }
    } catch {
      showFeedback("Connection error.", "error");
    } finally {
      setTransitioningId(null);
    }
  };

  const handleDispatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingDispatch(true);
    try {
      // Save dispatch notes first
      const noteText = `Courier: ${courierName || "TBD"} | Tracking: ${
        trackingRef || "Pending"
      }`;
      await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: noteText }),
      });

      // Then transition to SHIPPED
      const res = await fetch(`/api/admin/orders/${order.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nextStatus: "SHIPPED",
          note: noteText,
        }),
      });

      if (res.ok) {
        showFeedback("Order dispatched and marked as SHIPPED.", "success");
        setOrder((prev: any) => ({
          ...prev,
          status: "SHIPPED",
          notes: noteText,
        }));
        setShowDispatchModal(false);
      }
    } catch {
      showFeedback("Failed to dispatch.", "error");
    } finally {
      setSavingDispatch(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-xs uppercase tracking-widest text-noir/50">
        Retrieving bespoke order...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-20 text-center">
        <p className="font-serif text-lg text-noir/60">Order not found.</p>
        <Link href="/admin/orders" className="text-xs text-oxblood hover:underline mt-2 inline-block">
          ← Back to orders
        </Link>
      </div>
    );
  }

  const allowed = getAllowedTransitions(order.status);
  const isFinished =
    order.status === "DELIVERED" || order.status === "CANCELLED";
  const address =
    typeof order.shippingAddress === "string"
      ? JSON.parse(order.shippingAddress)
      : order.shippingAddress;

  const statusColor =
    order.status === "DELIVERED"
      ? "bg-emerald/10 text-emerald border-emerald/30"
      : order.status === "CANCELLED"
      ? "bg-red-50 text-red-700 border-red-200"
      : order.status === "SHIPPED"
      ? "bg-blue-50 text-blue-700 border-blue-200"
      : "bg-gold/15 text-gold-dark border-gold/40";

  return (
    <>
      {/* Screen UI */}
      <div className="space-y-6 print:hidden">
        {/* Navigation */}
        <div className="flex items-center gap-3">
          <Link
            href="/admin/orders"
            className="text-xs uppercase tracking-wider text-noir/50 hover:text-oxblood flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            All Orders
          </Link>
          <span className="text-noir/30">/</span>
          <span className="text-xs font-mono font-semibold text-oxblood">
            {order.orderNumber}
          </span>
        </div>

        {/* Feedback */}
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

        {/* Order Header Card */}
        <div className="bg-white/90 border border-gold/30 p-6 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-gold/15">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-mono text-xl font-bold text-oxblood tracking-widest">
                  {order.orderNumber}
                </span>
                <span
                  className={`text-[10px] uppercase tracking-widest px-2.5 py-0.5 border font-semibold ${statusColor}`}
                >
                  {order.status}
                </span>
              </div>
              <p className="text-xs text-noir/50 mt-1">
                Placed on {formatDate(order.createdAt)} · Payment:{" "}
                <span className="font-medium text-noir">
                  {order.paymentStatus}
                </span>
              </p>
              {order.notes && (
                <p className="text-xs text-blue-700 mt-1.5 flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5" />
                  {order.notes}
                </p>
              )}
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {/* State Transition */}
              {!isFinished && (
                <select
                  disabled={!!transitioningId}
                  value=""
                  onChange={(e) => {
                    if (e.target.value) handleStatusChange(e.target.value);
                  }}
                  className="h-9 px-3 text-xs bg-ivory border border-gold/40 text-oxblood font-semibold focus:border-oxblood outline-none cursor-pointer"
                >
                  <option value="">Advance Stage...</option>
                  {allowed.map((next) => (
                    <option key={next} value={next}>
                      → {next}
                    </option>
                  ))}
                </select>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={fetchOrder}
                className="gap-1.5 text-xs text-oxblood border-gold/30"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Refresh
              </Button>

              <Button
                variant="gold"
                size="sm"
                onClick={handlePrint}
                className="gap-1.5 text-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Invoice
              </Button>
            </div>
          </div>

          {/* Client & Address Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-5 text-xs">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-noir/40 font-semibold mb-2 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                Client Details
              </p>
              <p className="font-semibold text-noir">{order.customerName}</p>
              <p className="text-noir/60">{order.email}</p>
              <p className="text-noir/60">{order.phone}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-noir/40 font-semibold mb-2 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                Shipping Address
              </p>
              {address ? (
                <div className="text-noir/70 space-y-0.5">
                  <p className="font-medium text-noir">{address.line1 || address.address}</p>
                  {address.line2 && <p>{address.line2}</p>}
                  <p>
                    {[address.city, address.state, address.pincode || address.zip]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                  {address.country && <p>{address.country}</p>}
                </div>
              ) : (
                <p className="text-noir/40 italic">No address recorded.</p>
              )}
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="bg-white/90 border border-gold/30 shadow-xs overflow-x-auto">
          <div className="p-5 border-b border-gold/15">
            <h2 className="font-serif text-lg text-oxblood font-semibold flex items-center gap-2">
              <Package className="w-4 h-4 text-gold" />
              Order Items
            </h2>
          </div>
          <table className="w-full text-xs">
            <thead className="bg-noir/5 border-b border-gold/15">
              <tr>
                <th className="text-left px-5 py-3 text-[10px] uppercase tracking-widest text-noir/50 font-semibold">
                  Garment
                </th>
                <th className="text-center px-3 py-3 text-[10px] uppercase tracking-widest text-noir/50 font-semibold">
                  Shade · Size
                </th>
                <th className="text-center px-3 py-3 text-[10px] uppercase tracking-widest text-noir/50 font-semibold">
                  SKU
                </th>
                <th className="text-center px-3 py-3 text-[10px] uppercase tracking-widest text-noir/50 font-semibold">
                  Qty
                </th>
                <th className="text-right px-5 py-3 text-[10px] uppercase tracking-widest text-noir/50 font-semibold">
                  Unit Price
                </th>
                <th className="text-right px-5 py-3 text-[10px] uppercase tracking-widest text-noir/50 font-semibold">
                  Subtotal
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gold/10">
              {order.items.map((item: any) => (
                <tr key={item.id} className="hover:bg-gold/5 transition-colors">
                  <td className="px-5 py-4 font-semibold text-noir">
                    {item.title}
                  </td>
                  <td className="px-3 py-4 text-center text-noir/70">
                    {item.color} · {item.size}
                  </td>
                  <td className="px-3 py-4 text-center font-mono text-[10px] text-noir/50">
                    {item.sku}
                  </td>
                  <td className="px-3 py-4 text-center text-noir">
                    {item.qty}
                  </td>
                  <td className="px-5 py-4 text-right text-noir">
                    {formatPrice(item.unitPriceAtPurchase)}
                  </td>
                  <td className="px-5 py-4 text-right font-semibold text-oxblood">
                    {formatPrice(item.subtotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="p-5 border-t border-gold/15 flex justify-end">
            <div className="w-64 space-y-2 text-xs">
              <div className="flex justify-between text-noir/60">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              {Number(order.discount) > 0 && (
                <div className="flex justify-between text-emerald">
                  <span>
                    Discount{order.couponCode ? ` (${order.couponCode})` : ""}
                  </span>
                  <span>−{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-noir/60">
                <span>Shipping</span>
                <span>
                  {Number(order.shipping) === 0
                    ? "Complimentary"
                    : formatPrice(order.shipping)}
                </span>
              </div>
              <div className="flex justify-between font-semibold text-oxblood text-sm border-t border-gold/20 pt-2">
                <span>Total Settled</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Status History */}
        {order.statusHistory?.length > 0 && (
          <div className="bg-white/90 border border-gold/30 p-5 shadow-xs">
            <h2 className="font-serif text-base text-oxblood font-semibold mb-4">
              Order Timeline
            </h2>
            <div className="space-y-3">
              {order.statusHistory.map((h: any, i: number) => (
                <div key={h.id} className="flex items-start gap-3 text-xs">
                  <div className="w-2 h-2 rounded-full bg-gold mt-1.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-noir uppercase tracking-wider text-[10px]">
                      {h.status}
                    </p>
                    {h.note && <p className="text-noir/60 mt-0.5">{h.note}</p>}
                    <p className="text-[10px] text-noir/40 mt-0.5">
                      {formatDate(h.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Printable Invoice */}
      <div className="hidden print:block" ref={printRef}>
        <div className="p-8 max-w-2xl mx-auto font-sans text-sm text-black">
          {/* Header */}
          <div className="text-center border-b-2 border-black pb-6 mb-6">
            <h1 className="text-3xl font-bold tracking-[0.2em] uppercase">
              ZARIA ATELIER
            </h1>
            <p className="text-sm tracking-widest text-gray-600">JAIPUR</p>
            <p className="text-xs text-gray-500 mt-1">
              Bespoke Heirloom Atelier
            </p>
          </div>

          <div className="flex justify-between mb-6 text-xs">
            <div>
              <p className="font-bold uppercase tracking-wider mb-1">Invoice</p>
              <p>Order: {order.orderNumber}</p>
              <p>Date: {formatDate(order.createdAt)}</p>
              <p>Status: {order.status}</p>
              {order.notes && <p>Dispatch: {order.notes}</p>}
            </div>
            <div className="text-right">
              <p className="font-bold uppercase tracking-wider mb-1">
                Bill To
              </p>
              <p>{order.customerName}</p>
              <p>{order.email}</p>
              <p>{order.phone}</p>
            </div>
          </div>

          {/* Shipping */}
          {address && (
            <div className="mb-6 text-xs">
              <p className="font-bold uppercase tracking-wider mb-1">
                Shipping Address
              </p>
              <p>{address.line1 || address.address}</p>
              {address.line2 && <p>{address.line2}</p>}
              <p>
                {[address.city, address.state, address.pincode || address.zip]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            </div>
          )}

          {/* Items */}
          <table className="w-full text-xs border-collapse mb-6">
            <thead>
              <tr className="border-y border-black">
                <th className="text-left py-2 font-bold uppercase tracking-wider">
                  Garment
                </th>
                <th className="text-center py-2 font-bold uppercase tracking-wider">
                  Shade · Size
                </th>
                <th className="text-center py-2 font-bold uppercase tracking-wider">
                  Qty
                </th>
                <th className="text-right py-2 font-bold uppercase tracking-wider">
                  Price
                </th>
                <th className="text-right py-2 font-bold uppercase tracking-wider">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item: any) => (
                <tr key={item.id} className="border-b border-gray-200">
                  <td className="py-2">{item.title}</td>
                  <td className="py-2 text-center">
                    {item.color} · {item.size}
                  </td>
                  <td className="py-2 text-center">{item.qty}</td>
                  <td className="py-2 text-right">
                    {formatPrice(item.unitPriceAtPurchase)}
                  </td>
                  <td className="py-2 text-right">{formatPrice(item.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-56 text-xs space-y-1">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              {Number(order.discount) > 0 && (
                <div className="flex justify-between">
                  <span>
                    Discount{order.couponCode ? ` (${order.couponCode})` : ""}
                  </span>
                  <span>−{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>
                  {Number(order.shipping) === 0
                    ? "Complimentary"
                    : formatPrice(order.shipping)}
                </span>
              </div>
              <div className="flex justify-between font-bold text-sm border-t border-black pt-1">
                <span>Grand Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          <div className="text-center text-xs text-gray-500 border-t border-gray-300 pt-4">
            <p>Thank you for your patronage — Zaria Atelier, Jaipur</p>
            <p className="mt-0.5">Authorized by: Prem Borde (Administrator)</p>
          </div>
        </div>
      </div>

      {/* Dispatch Modal */}
      {showDispatchModal && (
        <div className="fixed inset-0 z-50 bg-noir/70 backdrop-blur-sm flex items-center justify-center p-4 print:hidden">
          <div className="bg-ivory border border-gold/40 p-8 max-w-md w-full shadow-2xl space-y-5">
            <div className="border-b border-gold/20 pb-4">
              <h2 className="font-serif text-xl text-oxblood font-semibold flex items-center gap-2">
                <Truck className="w-5 h-5" />
                Dispatch Order
              </h2>
              <p className="text-xs text-noir/60 mt-1">
                Add courier details before marking as SHIPPED.
              </p>
            </div>

            <form onSubmit={handleDispatchSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block uppercase tracking-wider font-semibold mb-1">
                  Courier / Carrier
                </label>
                <input
                  type="text"
                  value={courierName}
                  onChange={(e) => setCourierName(e.target.value)}
                  placeholder="e.g. BlueDart, DTDC, Delhivery..."
                  className="w-full h-10 px-3 bg-white border border-gold/30 outline-none focus:border-oxblood"
                />
              </div>
              <div>
                <label className="block uppercase tracking-wider font-semibold mb-1">
                  Tracking Reference / AWB
                </label>
                <input
                  type="text"
                  value={trackingRef}
                  onChange={(e) => setTrackingRef(e.target.value)}
                  placeholder="e.g. 1234567890"
                  className="w-full h-10 px-3 bg-white border border-gold/30 outline-none focus:border-oxblood font-mono"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2 border-t border-gold/20">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDispatchModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="oxblood"
                  size="sm"
                  disabled={savingDispatch}
                  className="gap-1.5"
                >
                  <Truck className="w-3.5 h-3.5" />
                  {savingDispatch ? "Dispatching..." : "Mark as Shipped"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
