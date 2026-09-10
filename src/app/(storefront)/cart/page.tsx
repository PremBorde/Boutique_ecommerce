"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Tag,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function CartPage() {
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    getSubtotal,
    getDiscount,
    getShipping,
    getTotal,
    coupon,
    setCoupon,
  } = useCart();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [couponCodeInput, setCouponCodeInput] = useState(coupon?.code || "");
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState(
    coupon ? `Privilege code ${coupon.code} applied (${coupon.percentOff}% off)` : ""
  );
  const [couponLoading, setCouponLoading] = useState(false);

  const subtotal = getSubtotal();
  const discount = getDiscount();
  const shipping = getShipping();
  const total = getTotal();

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCodeInput.trim()) return;

    setCouponError("");
    setCouponSuccess("");
    setCouponLoading(true);

    try {
      const res = await fetch("/api/coupon/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponCodeInput.trim(),
          subtotal,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.valid) {
        setCoupon(null);
        setCouponError(data.error || "Invalid coupon code.");
      } else {
        setCoupon(data.coupon);
        setCouponSuccess(
          `Privilege Code ${data.coupon.code} honored! You save ${formatPrice(
            data.coupon.discountAmount
          )}.`
        );
      }
    } catch (err) {
      setCouponError("Could not connect to coupon verification engine.");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCoupon(null);
    setCouponCodeInput("");
    setCouponSuccess("");
    setCouponError("");
  };

  return (
    <div className="min-h-screen bg-regal-texture py-16 px-4 md:px-8 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-6 mb-8 border-b border-gold/20">
          <div>
            <p className="text-[10px] uppercase tracking-[0.35em] text-gold-antique dark:text-gold-light font-semibold mb-1">
              Your Curated Bag
            </p>
            <h1 className="text-3xl md:text-4xl font-serif text-oxblood dark:text-gold-foil">
              Atelier Acquisitions
            </h1>
          </div>
          <Link
            href="/shop"
            className="text-xs uppercase tracking-[0.2em] text-oxblood dark:text-gold-light hover:text-gold transition-colors font-medium"
          >
            ← Continue Browsing
          </Link>
        </div>

        {!mounted ? (
          <div className="py-24 text-center p-12 max-w-xl mx-auto">
            <div className="w-12 h-12 rounded-full border-2 border-gold/40 border-t-gold animate-spin mx-auto mb-4" />
            <p className="text-xs uppercase tracking-[0.2em] text-gold-antique dark:text-gold-light">
              Loading your curated acquisitions...
            </p>
          </div>
        ) : items.length === 0 ? (
          <div className="py-24 text-center bg-white/60 border border-dashed border-gold/30 p-12 max-w-xl mx-auto shadow-xs">
            <div className="w-16 h-16 rounded-full bg-gold/10 text-gold-dark flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-8 h-8 stroke-1" />
            </div>
            <h2 className="font-serif text-2xl text-oxblood mb-2">Your Bag is Empty</h2>
            <p className="text-xs text-noir/60 max-w-sm mx-auto mb-8 leading-relaxed">
              Discover our handcrafted lehengas, sarees, and festive wear to find your perfect look.
            </p>
            <Link href="/shop">
              <Button variant="oxblood" className="text-xs tracking-[0.25em]">
                Start Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Items Column */}
            <div className="lg:col-span-8 bg-white/80 dark:bg-[#161214] border border-gold/30 dark:border-gold/20 p-6 md:p-8 shadow-xs space-y-6 transition-colors duration-300">
              <div className="flex items-center justify-between pb-4 border-b border-gold/20 text-xs uppercase tracking-widest text-noir/50 dark:text-ivory/50 font-medium">
                <span>Selected Garments</span>
                <button
                  onClick={clearCart}
                  className="text-red-700 hover:underline normal-case tracking-normal"
                >
                  Clear Bag
                </button>
              </div>

              <div className="space-y-6 divide-y divide-gold/15">
                {items.map((item) => (
                  <div key={item.variantId} className="pt-6 first:pt-0 flex gap-6">
                    {/* Image */}
                    <div className="relative w-24 h-32 md:w-28 md:h-36 bg-noir/5 shrink-0 overflow-hidden border border-gold/20">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="112px"
                        className="object-cover"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-4">
                          <Link
                            href={`/product/${item.slug}`}
                            className="font-serif text-base md:text-lg text-oxblood hover:text-gold transition-colors font-medium"
                          >
                            {item.name}
                          </Link>
                          <button
                            onClick={() => removeItem(item.variantId)}
                            className="text-noir/40 hover:text-red-700 transition-colors p-1"
                            title="Remove from bag"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-xs text-noir/60 mt-1">
                          Shade: <span className="font-medium text-noir">{item.color}</span> · Size:{" "}
                          <span className="font-medium text-noir">{item.size}</span>
                        </p>
                        <p className="font-serif text-sm text-gold-dark mt-1 font-semibold">
                          {formatPrice(item.price)}
                        </p>
                      </div>

                      {/* Stepper and Row Total */}
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gold/10">
                        <div className="flex items-center border border-gold/30 bg-white">
                          <button
                            onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center text-noir/60 hover:text-oxblood hover:bg-gold/10 transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-10 text-center text-xs font-semibold text-noir">
                            {item.quantity}
                          </span>
                          <button
                            disabled={item.quantity >= item.maxStock}
                            onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center text-noir/60 hover:text-oxblood hover:bg-gold/10 transition-colors disabled:opacity-30"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] text-noir/40 block">Line Investment</span>
                          <span className="font-serif text-base font-semibold text-oxblood">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary & Coupon Column */}
            <div className="lg:col-span-4 space-y-6">
              {/* Coupon Box */}
              <div className="bg-white/80 border border-gold/30 p-6 shadow-xs">
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="w-4 h-4 text-gold-dark" />
                  <h3 className="font-serif text-sm text-oxblood uppercase tracking-wider font-semibold">
                    Privilege Code
                  </h3>
                </div>

                <form onSubmit={handleApplyCoupon} className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCodeInput}
                      onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                      placeholder="e.g. ROYAL15"
                      className="flex-1 h-10 px-3 text-xs uppercase tracking-wider bg-white border border-gold/30 focus:border-oxblood outline-none"
                    />
                    <Button
                      type="submit"
                      disabled={couponLoading || !couponCodeInput.trim()}
                      variant="outline"
                      size="sm"
                      className="h-10 text-[10px]"
                    >
                      {couponLoading ? "Validating..." : "Apply"}
                    </Button>
                  </div>

                  {/* Coupon Demo Badges */}
                  <div className="pt-2">
                    <p className="text-[10px] uppercase tracking-wider text-noir/40 mb-1">
                      Available Demo Codes:
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setCouponCodeInput("ROYAL15")}
                        className="text-[10px] px-2 py-0.5 bg-gold/10 border border-gold/30 text-gold-dark hover:bg-gold/20 font-mono"
                      >
                        ROYAL15 (15% off)
                      </button>
                      <button
                        type="button"
                        onClick={() => setCouponCodeInput("FESTIVE25")}
                        className="text-[10px] px-2 py-0.5 bg-gold/10 border border-gold/30 text-gold-dark hover:bg-gold/20 font-mono"
                      >
                        FESTIVE25 (25% off)
                      </button>
                    </div>
                  </div>

                  {couponSuccess && (
                    <div className="p-2.5 bg-emerald/10 border border-emerald/30 text-emerald text-xs flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        {couponSuccess}
                      </span>
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="text-[10px] text-red-700 hover:underline uppercase ml-2"
                      >
                        Remove
                      </button>
                    </div>
                  )}

                  {couponError && (
                    <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {couponError}
                    </div>
                  )}
                </form>
              </div>

              {/* Totals Box */}
              <div className="bg-white/80 dark:bg-[#161214] border border-gold/30 dark:border-gold/20 p-6 shadow-xs space-y-4 transition-colors duration-300">
                <h3 className="font-serif text-base text-oxblood dark:text-gold-foil uppercase tracking-wider border-b border-gold/20 pb-3 font-semibold">
                  Investment Summary
                </h3>

                <div className="space-y-2.5 text-xs text-noir/70 dark:text-ivory/70">
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

                  <div className="pt-3 border-t border-gold/20 flex justify-between font-serif text-lg text-oxblood font-semibold">
                    <span>Total Investment</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>

                <Link href="/checkout" className="block pt-2">
                  <Button
                    variant="oxblood"
                    className="w-full h-13 text-xs tracking-[0.25em] flex items-center justify-center gap-2 group"
                  >
                    Proceed to Checkout
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>

                <div className="flex items-center justify-center gap-2 text-[10px] uppercase tracking-wider text-noir/40 pt-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-gold-dark" />
                  Authenticity Verified · Insured Packaging
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
