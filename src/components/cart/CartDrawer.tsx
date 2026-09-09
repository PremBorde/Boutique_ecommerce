"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { X, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck } from "lucide-react";

export function CartDrawer() {
  const {
    items,
    isDrawerOpen,
    closeDrawer,
    updateQuantity,
    removeItem,
    getSubtotal,
    getDiscount,
    getShipping,
    getTotal,
    coupon,
  } = useCart();

  const subtotal = getSubtotal();
  const discount = getDiscount();
  const shipping = getShipping();
  const total = getTotal();

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDrawer}
            className="fixed inset-0 bg-noir/70 backdrop-blur-sm z-50 transition-opacity"
          />

          {/* Slide-in Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-ivory dark:bg-[#120E10] border-l border-gold/30 dark:border-gold/20 z-50 flex flex-col shadow-2xl transition-colors duration-300"
          >
            {/* Header */}
            <div className="p-6 border-b border-gold/20 flex items-center justify-between bg-white/60 dark:bg-[#171215]/80">
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-5 h-5 text-oxblood dark:text-gold-light" />
                <h2 className="font-serif text-xl text-oxblood dark:text-gold-foil font-normal">
                  Your Atelier Bag
                </h2>
                <span className="text-[11px] uppercase tracking-widest text-gold-dark dark:text-gold-light font-medium ml-1">
                  ({items.reduce((acc, it) => acc + it.quantity, 0)})
                </span>
              </div>
              <button
                onClick={closeDrawer}
                className="w-8 h-8 rounded-full flex items-center justify-center text-noir/60 dark:text-ivory/60 hover:text-oxblood dark:hover:text-gold hover:bg-gold/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {items.length === 0 ? (
                <div className="py-20 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-gold/10 text-gold-dark flex items-center justify-center mx-auto">
                    <ShoppingBag className="w-7 h-7 stroke-1" />
                  </div>
                  <p className="font-serif text-lg text-noir/80">Your bag is empty</p>
                  <p className="text-xs text-noir/50 max-w-xs mx-auto leading-relaxed">
                    Explore our heirloom sarees, lehengas, and bespoke craft pieces to add to your collection.
                  </p>
                  <Button
                    variant="oxblood"
                    size="sm"
                    onClick={closeDrawer}
                    className="mt-4"
                  >
                    Explore Catalogue
                  </Button>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.variantId}
                    className="flex gap-4 pb-6 border-b border-gold/15 last:border-0"
                  >
                    {/* Thumbnail */}
                    <div className="relative w-20 h-24 bg-noir/5 shrink-0 overflow-hidden border border-gold/20">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            href={`/product/${item.slug}`}
                            onClick={closeDrawer}
                            className="font-serif text-sm text-oxblood hover:text-gold transition-colors truncate font-medium"
                          >
                            {item.name}
                          </Link>
                          <button
                            onClick={() => removeItem(item.variantId)}
                            className="text-noir/40 hover:text-red-700 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-[11px] text-noir/60 mt-0.5">
                          {item.color} · Size {item.size}
                        </p>
                        <p className="font-serif text-xs text-gold-dark mt-1 font-semibold">
                          {formatPrice(item.price)}
                        </p>
                      </div>

                      {/* Quantity Stepper */}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border border-gold/30 bg-white">
                          <button
                            onClick={() =>
                              updateQuantity(item.variantId, item.quantity - 1)
                            }
                            className="w-7 h-7 flex items-center justify-center text-noir/60 hover:text-oxblood hover:bg-gold/10 transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-xs font-medium text-noir">
                            {item.quantity}
                          </span>
                          <button
                            disabled={item.quantity >= item.maxStock}
                            onClick={() =>
                              updateQuantity(item.variantId, item.quantity + 1)
                            }
                            className="w-7 h-7 flex items-center justify-center text-noir/60 hover:text-oxblood hover:bg-gold/10 transition-colors disabled:opacity-30"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        {item.quantity >= item.maxStock && (
                          <span className="text-[10px] text-amber-700 font-medium">
                            Max stock reached
                          </span>
                        )}
                        <span className="font-serif text-xs font-semibold text-oxblood">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer Summary & Checkout CTA */}
            {items.length > 0 && (
              <div className="p-6 border-t border-gold/25 bg-white/40 dark:bg-[#171215]/60 space-y-4">
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-noir/70 dark:text-ivory/70">
                    <span>Subtotal</span>
                    <span className="font-serif text-sm font-medium text-oxblood dark:text-ivory">
                      {formatPrice(subtotal)}
                    </span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald font-medium">
                      <span>Privilege Discount ({coupon?.code})</span>
                      <span>-{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-noir/70 dark:text-ivory/70">
                    <span>Atelier White-Glove Delivery</span>
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
                  <div className="pt-2 border-t border-gold/20 flex justify-between font-serif text-base text-oxblood dark:text-gold-foil font-semibold">
                    <span>Total Investment</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <Link href="/checkout" onClick={closeDrawer}>
                    <Button
                      variant="oxblood"
                      className="w-full h-12 text-xs tracking-[0.25em] flex items-center justify-center gap-2 group"
                    >
                      Proceed to Checkout
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link
                    href="/cart"
                    onClick={closeDrawer}
                    className="block text-center text-[11px] uppercase tracking-widest text-noir/60 dark:text-ivory/60 hover:text-oxblood dark:hover:text-gold mt-3 transition-colors font-medium"
                  >
                    View Detailed Bag & Apply Coupons →
                  </Link>
                </div>

                <div className="flex items-center justify-center gap-2 text-[10px] uppercase tracking-wider text-noir/40 dark:text-ivory/40 pt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-gold-dark" />
                  Insured Transit · Authenticity Guaranteed
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
