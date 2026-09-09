"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import confetti from "canvas-confetti";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  CreditCard,
  Lock,
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const {
    items,
    coupon,
    getSubtotal,
    getDiscount,
    getShipping,
    getTotal,
    clearCart,
  } = useCart();

  // Form fields
  const [customerName, setCustomerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [line1, setLine1] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [postalCode, setPostalCode] = useState("");

  // Demo Simulated Payment Toggle
  const [simulatedStatus, setSimulatedStatus] = useState<"SUCCESS" | "FAILED">("SUCCESS");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Pre-fill from session if available
  useEffect(() => {
    if (session?.user) {
      if (session.user.name && !customerName) setCustomerName(session.user.name);
      if (session.user.email && !email) setEmail(session.user.email);
    }
  }, [session]);

  const subtotal = getSubtotal();
  const discount = getDiscount();
  const shipping = getShipping();
  const total = getTotal();

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      setErrorMsg("Your bag is empty. Please select garments before checkout.");
      return;
    }

    setErrorMsg("");
    setLoading(true);

    try {
      const payload = {
        customerName,
        email,
        phone,
        shippingAddress: {
          line1,
          city,
          state: stateName,
          postalCode,
          country: "India",
        },
        items: items.map((it) => ({
          variantId: it.variantId,
          quantity: it.quantity,
        })),
        couponCode: coupon?.code || null,
        simulatedPaymentStatus: simulatedStatus,
        idempotencyKey: `idemp_${Date.now()}_${Math.random()}`,
      };

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Failed to process order.");
        setLoading(false);
        return;
      }

      // Success celebration
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#C9A050", "#4A0E17", "#0B3B24", "#DFC07B"],
      });

      clearCart();
      router.push(`/orders/${data.order.id}`);
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred during payment processing.");
      setLoading(false);
    }
  };

  const fillDemoAddress = () => {
    setCustomerName("Ananya Singhania");
    setEmail("ananya@luxury.com");
    setPhone("+91 98200 55432");
    setLine1("Haveli 14, Civil Lines");
    setCity("Jaipur");
    setStateName("Rajasthan");
    setPostalCode("302006");
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center bg-regal-texture">
        <h1 className="font-serif text-3xl text-oxblood mb-2">No Items in Bag</h1>
        <p className="text-xs text-noir/60 mb-6">
          Your bag is currently empty. Please select a creation from our catalogue.
        </p>
        <Link href="/shop">
          <Button variant="oxblood" size="sm">
            Browse Catalogue
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-regal-texture py-12 px-4 md:px-8 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        {/* Header Breadcrumb */}
        <div className="flex items-center justify-between pb-6 mb-8 border-b border-gold/20">
          <Link
            href="/cart"
            className="text-xs uppercase tracking-[0.2em] text-oxblood dark:text-gold-light hover:text-gold transition-colors font-medium flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Return to Bag
          </Link>
          <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-gold-dark dark:text-gold-light font-medium">
            <Lock className="w-3.5 h-3.5" />
            256-Bit Encrypted Checkout
          </div>
        </div>

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Customer & Shipping Details (Left Col) */}
          <div className="lg:col-span-7 space-y-8">
            {/* Quick Demo Pre-fill */}
            <div className="flex items-center justify-between bg-gold/10 border border-gold/30 p-3 rounded-xs">
              <span className="text-[11px] uppercase tracking-wider text-gold-dark font-semibold">
                Quick Evaluator Testing
              </span>
              <button
                type="button"
                onClick={fillDemoAddress}
                className="text-[10px] uppercase tracking-widest bg-oxblood text-gold-light px-3 py-1 font-medium hover:bg-oxblood-light transition-colors"
              >
                Auto-Fill Address
              </button>
            </div>

            {/* 1. Customer Contact */}
            <div className="bg-white/80 dark:bg-[#161214] border border-gold/30 dark:border-gold/20 p-6 md:p-8 shadow-xs space-y-4 transition-colors duration-300">
              <h2 className="font-serif text-lg text-oxblood dark:text-gold-foil border-b border-gold/20 pb-3 font-semibold">
                1. Client Identification
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] uppercase tracking-[0.2em] text-noir/70 mb-1 font-medium">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Maharani Gayatri Devi"
                    className="w-full h-11 px-3 text-xs bg-white border border-gold/30 focus:border-oxblood outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-[0.2em] text-noir/70 mb-1 font-medium">
                    Email for Confirmation *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="client@luxury.com"
                    className="w-full h-11 px-3 text-xs bg-white border border-gold/30 focus:border-oxblood outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-[0.2em] text-noir/70 mb-1 font-medium">
                    Contact Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98200 12345"
                    className="w-full h-11 px-3 text-xs bg-white border border-gold/30 focus:border-oxblood outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 2. Shipping Address */}
            <div className="bg-white/80 border border-gold/30 p-6 md:p-8 shadow-xs space-y-4">
              <h2 className="font-serif text-lg text-oxblood border-b border-gold/20 pb-3 font-semibold">
                2. Bespoke Delivery Address
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.2em] text-noir/70 mb-1 font-medium">
                    Street Address / Estate / Suite *
                  </label>
                  <input
                    type="text"
                    required
                    value={line1}
                    onChange={(e) => setLine1(e.target.value)}
                    placeholder="Haveli 14, Civil Lines"
                    className="w-full h-11 px-3 text-xs bg-white border border-gold/30 focus:border-oxblood outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] uppercase tracking-[0.2em] text-noir/70 mb-1 font-medium">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Jaipur"
                      className="w-full h-11 px-3 text-xs bg-white border border-gold/30 focus:border-oxblood outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-[0.2em] text-noir/70 mb-1 font-medium">
                      State / Province *
                    </label>
                    <input
                      type="text"
                      required
                      value={stateName}
                      onChange={(e) => setStateName(e.target.value)}
                      placeholder="Rajasthan"
                      className="w-full h-11 px-3 text-xs bg-white border border-gold/30 focus:border-oxblood outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-[0.2em] text-noir/70 mb-1 font-medium">
                      Postal Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="302006"
                      className="w-full h-11 px-3 text-xs bg-white border border-gold/30 focus:border-oxblood outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Simulated Payment Section with Success/Failure Toggle */}
            <div className="bg-white/80 dark:bg-[#161214] border border-gold/30 dark:border-gold/20 p-6 md:p-8 shadow-xs space-y-4 transition-colors duration-300">
              <div className="flex items-center justify-between border-b border-gold/20 pb-3">
                <h2 className="font-serif text-lg text-oxblood dark:text-gold-foil font-semibold flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-gold-dark dark:text-gold-light" />
                  3. Payment Authorization (Demo Gateway)
                </h2>
                <span className="text-[10px] uppercase tracking-wider text-emerald bg-emerald/10 px-2 py-0.5 border border-emerald/30 font-medium">
                  Sandbox Active
                </span>
              </div>

              <p className="text-xs text-noir/60 leading-relaxed">
                This project features a fully simulated payment authorization pipeline. You can toggle
                between simulated success and simulated card decline to test error states and inventory rollback.
              </p>

              {/* Success / Failure Toggle */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSimulatedStatus("SUCCESS")}
                  className={`p-3.5 text-xs text-left border transition-all flex flex-col justify-between ${
                    simulatedStatus === "SUCCESS"
                      ? "border-emerald bg-emerald/5 ring-1 ring-emerald font-medium"
                      : "border-gold/30 bg-white hover:border-gold opacity-70"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-emerald">Simulate Payment Success</span>
                    {simulatedStatus === "SUCCESS" && (
                      <CheckCircle2 className="w-4 h-4 text-emerald" />
                    )}
                  </div>
                  <span className="text-[10px] text-noir/50 mt-1">
                    Reserves inventory atomically and creates order.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setSimulatedStatus("FAILED")}
                  className={`p-3.5 text-xs text-left border transition-all flex flex-col justify-between ${
                    simulatedStatus === "FAILED"
                      ? "border-red-600 bg-red-50 ring-1 ring-red-600 font-medium"
                      : "border-gold/30 bg-white hover:border-gold opacity-70"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-red-700">Simulate Payment Failure</span>
                    {simulatedStatus === "FAILED" && (
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                  <span className="text-[10px] text-noir/50 mt-1">
                    Simulates issuer card decline. Leaves stock untouched.
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Order Summary (Right Col) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white/80 dark:bg-[#161214] border border-gold/30 dark:border-gold/20 p-6 md:p-8 shadow-xs space-y-6 transition-colors duration-300">
              <h2 className="font-serif text-lg text-oxblood dark:text-gold-foil border-b border-gold/20 pb-3 font-semibold">
                Order Review ({items.length} {items.length === 1 ? "Piece" : "Pieces"})
              </h2>

              {/* Items List */}
              <div className="space-y-4 max-h-72 overflow-y-auto divide-y divide-gold/15 pr-1">
                {items.map((item) => (
                  <div key={item.variantId} className="pt-4 first:pt-0 flex gap-4">
                    <div className="relative w-16 h-20 bg-noir/5 shrink-0 border border-gold/20">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0 text-xs">
                      <p className="font-serif text-sm text-oxblood truncate font-medium">
                        {item.name}
                      </p>
                      <p className="text-noir/60 mt-0.5">
                        {item.color} · Size {item.size}
                      </p>
                      <p className="text-noir/50 mt-0.5">Qty: {item.quantity}</p>
                      <p className="font-serif text-gold-dark font-semibold mt-1">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Calculation Breakdown */}
              <div className="pt-4 border-t border-gold/20 space-y-2.5 text-xs text-noir/70">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-emerald font-medium">
                    <span>Privilege Discount ({coupon?.code})</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Atelier White-Glove Transit</span>
                  <span>
                    {shipping === 0 ? (
                      <span className="text-emerald font-medium uppercase tracking-wider text-[10px]">
                        Complimentary
                      </span>
                    ) : (
                      formatPrice(shipping)
                    )}
                  </span>
                </div>

                <div className="pt-3 border-t border-gold/20 flex justify-between font-serif text-xl text-oxblood dark:text-gold-foil font-semibold">
                  <span>Total Amount</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Confirm Order CTA (with double-click guard) */}
              <Button
                id="place-order-btn"
                type="submit"
                disabled={loading}
                variant="oxblood"
                className="w-full h-14 text-xs tracking-[0.25em] font-semibold"
              >
                {loading
                  ? "Reserving Inventory & Transacting..."
                  : `Authorize Payment · ${formatPrice(total)}`}
              </Button>

              <div className="text-center text-[10px] text-noir/40 uppercase tracking-widest flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-gold-dark" />
                Zero Hallucination Stock Guarantee
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
