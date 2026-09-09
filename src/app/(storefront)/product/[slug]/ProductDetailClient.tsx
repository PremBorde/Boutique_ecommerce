"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  ShieldCheck,
  Truck,
  RotateCcw,
  Minus,
  Plus,
  Check,
  AlertCircle,
  HelpCircle,
} from "lucide-react";

interface VariantType {
  id: string;
  color: string;
  colorHex: string;
  size: string;
  sku: string;
  priceOverride?: any;
  inventory?: { quantity: number } | null;
}

interface ProductImage {
  id: string;
  url: string;
  altText?: string | null;
  color?: string | null;
  isPrimary?: boolean;
}

interface ProductDetailClientProps {
  product: {
    id: string;
    name: string;
    slug: string;
    description: string;
    story?: string | null;
    fabric?: string | null;
    basePrice: any;
    category?: { name: string; slug: string } | null;
    images: ProductImage[];
    variants: VariantType[];
  };
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const { addItem, openDrawer } = useCart();

  // Extract unique colors and unique sizes
  const uniqueColors = useMemo(() => {
    const map = new Map<string, { color: string; colorHex: string }>();
    product.variants.forEach((v) => {
      if (!map.has(v.color)) {
        map.set(v.color, { color: v.color, colorHex: v.colorHex });
      }
    });
    return Array.from(map.values());
  }, [product.variants]);

  const uniqueSizes = useMemo(() => {
    const set = new Set<string>();
    product.variants.forEach((v) => set.add(v.size));
    return Array.from(set);
  }, [product.variants]);

  // Initial selection
  const [selectedColor, setSelectedColor] = useState<string>(
    uniqueColors[0]?.color || ""
  );
  const [selectedSize, setSelectedSize] = useState<string>(
    uniqueSizes[0] || ""
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [addedNotice, setAddedNotice] = useState<boolean>(false);

  // Find the exact matching variant for the chosen (color, size) pair
  const selectedVariant = useMemo(() => {
    return product.variants.find(
      (v) => v.color === selectedColor && v.size === selectedSize
    );
  }, [product.variants, selectedColor, selectedSize]);

  // Current stock for the selected variant
  const currentStock = selectedVariant?.inventory?.quantity ?? 0;
  const isVariantInStock = currentStock > 0;

  // Filter gallery images: prioritize images tagged with this color, else fallback to all
  const displayedImages = useMemo(() => {
    const colorSpecific = product.images.filter(
      (img) => img.color && img.color.toLowerCase() === selectedColor.toLowerCase()
    );
    return colorSpecific.length > 0 ? colorSpecific : product.images;
  }, [product.images, selectedColor]);

  const activeImage = displayedImages[activeImageIndex] || displayedImages[0] || product.images[0];

  // When color changes, reset image index and check if current size is valid
  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    setActiveImageIndex(0);
    setQuantity(1);
  };

  // Helper to test if a size has stock for the selected color
  const checkSizeStock = (size: string) => {
    const variant = product.variants.find(
      (v) => v.color === selectedColor && v.size === size
    );
    if (!variant) return { exists: false, stock: 0 };
    return { exists: true, stock: variant.inventory?.quantity ?? 0 };
  };

  const handleAddToCart = () => {
    if (!selectedVariant || !isVariantInStock) return;

    addItem({
      variantId: selectedVariant.id,
      productId: product.id,
      name: product.name,
      slug: product.slug,
      color: selectedVariant.color,
      size: selectedVariant.size,
      price: Number(selectedVariant.priceOverride ?? product.basePrice),
      image: activeImage.url,
      quantity,
      maxStock: currentStock,
    });

    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 3000);
    openDrawer();
  };

  const price = Number(selectedVariant?.priceOverride ?? product.basePrice);

  return (
    <div className="min-h-screen bg-regal-texture py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-noir/50 mb-8 pb-4 border-b border-gold/20">
          <Link href="/" className="hover:text-oxblood transition-colors">
            Atelier
          </Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-oxblood transition-colors">
            Catalogue
          </Link>
          {product.category && (
            <>
              <span>/</span>
              <Link
                href={`/shop?category=${product.category.slug}`}
                className="hover:text-oxblood transition-colors"
              >
                {product.category.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-oxblood font-semibold truncate max-w-xs">
            {product.name}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Image Gallery with Crossfade */}
          <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4">
            {/* Thumbnails */}
            {displayedImages.length > 1 && (
              <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto shrink-0 md:w-20">
                {displayedImages.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-16 h-20 md:w-20 md:h-26 overflow-hidden border transition-all ${
                      activeImageIndex === idx
                        ? "border-oxblood shadow-sm scale-105"
                        : "border-gold/30 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={img.url}
                      alt={img.altText || `${product.name} view ${idx + 1}`}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Main Stage Image with Soft Shimmer Crossfade */}
            <div className="relative flex-1 aspect-[3/4] bg-white border border-gold/30 overflow-hidden shadow-sm">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeImage?.url}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="relative w-full h-full"
                >
                  <Image
                    src={activeImage?.url || "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b"}
                    alt={activeImage?.altText || product.name}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    className="object-cover"
                  />
                  {/* Subtle fabric texture vignette */}
                  <div className="absolute inset-0 bg-radial-vignette pointer-events-none opacity-30" />
                </motion.div>
              </AnimatePresence>

              {/* Hallmark Ribbon */}
              <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 px-3 py-1 bg-ivory/95 border border-gold/40 backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-gold-dark" />
                <span className="text-[10px] uppercase tracking-[0.25em] text-oxblood font-semibold">
                  Artisan Handcrafted
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Product Narrative & Variant Matrix */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-8">
            <div>
              {/* Category & Title */}
              {product.category && (
                <p className="text-[11px] uppercase tracking-[0.3em] text-gold-dark font-medium mb-2">
                  {product.category.name}
                </p>
              )}
              <h1 className="text-3xl md:text-4xl font-serif text-oxblood leading-tight">
                {product.name}
              </h1>

              {/* Price Display */}
              <div className="mt-4 flex items-baseline gap-3">
                <span className="text-2xl md:text-3xl font-serif font-semibold text-oxblood">
                  {formatPrice(price)}
                </span>
                <span className="text-xs text-noir/50">Taxes & Insured Shipping Included</span>
              </div>

              {/* Short Story */}
              <p className="mt-4 text-xs md:text-sm text-noir/70 leading-relaxed">
                {product.description}
              </p>

              {/* Fabric Tag */}
              {product.fabric && (
                <div className="mt-4 p-3 bg-white/70 border border-gold/25 text-xs text-noir/80 flex items-start gap-2">
                  <span className="text-gold-dark font-semibold shrink-0">Fabric:</span>
                  <span>{product.fabric}</span>
                </div>
              )}

              {/* ---------------- VARIANT SELECTOR MATRIX ---------------- */}
              <div className="mt-8 space-y-6 pt-6 border-t border-gold/20">
                {/* 1. Color Selector */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs uppercase tracking-[0.2em] font-semibold text-noir">
                      Select Shade:{" "}
                      <span className="text-oxblood font-normal">{selectedColor}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    {uniqueColors.map((c) => {
                      const isSelected = selectedColor === c.color;
                      return (
                        <button
                          key={c.color}
                          onClick={() => handleColorSelect(c.color)}
                          title={c.color}
                          className={`group flex items-center gap-2 px-3 py-1.5 border transition-all ${
                            isSelected
                              ? "border-oxblood bg-white shadow-xs ring-1 ring-oxblood"
                              : "border-gold/30 bg-white/60 hover:border-gold"
                          }`}
                        >
                          <span
                            style={{ backgroundColor: c.colorHex }}
                            className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0"
                          />
                          <span className="text-xs text-noir/80 font-medium">
                            {c.color}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Size Selector (Matrix validation against selected color) */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs uppercase tracking-[0.2em] font-semibold text-noir">
                      Select Size:{" "}
                      <span className="text-oxblood font-normal">{selectedSize}</span>
                    </span>
                    <span className="text-[11px] text-gold-dark tracking-wider underline cursor-pointer">
                      Sizing Guide
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-2.5">
                    {uniqueSizes.map((sz) => {
                      const { exists, stock } = checkSizeStock(sz);
                      const isSelected = selectedSize === sz;
                      const isOutOfStock = !exists || stock === 0;

                      return (
                        <button
                          key={sz}
                          disabled={isOutOfStock}
                          onClick={() => {
                            setSelectedSize(sz);
                            setQuantity(1);
                          }}
                          className={`relative py-3 px-2 border text-xs font-medium uppercase tracking-wider transition-all flex flex-col items-center justify-center ${
                            isSelected && !isOutOfStock
                              ? "bg-oxblood text-gold-light border-oxblood shadow-xs font-semibold"
                              : isOutOfStock
                              ? "bg-noir/5 text-noir/30 border-dashed border-noir/20 cursor-not-allowed line-through"
                              : "bg-white/80 text-noir border-gold/30 hover:border-gold hover:bg-white"
                          }`}
                        >
                          <span>{sz}</span>
                          {isOutOfStock ? (
                            <span className="text-[8px] tracking-normal text-noir/40 mt-0.5 no-underline">
                              Sold Out
                            </span>
                          ) : stock <= 2 ? (
                            <span className="text-[8px] text-amber-700 tracking-normal mt-0.5">
                              {stock} left
                            </span>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Real-Time Stock Status Badge */}
                <div className="pt-2">
                  {!selectedVariant ? (
                    <div className="flex items-center gap-2 text-xs text-noir/60 bg-amber-50/60 p-2.5 border border-amber-200">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>This combination is currently not available in our atelier.</span>
                    </div>
                  ) : currentStock === 0 ? (
                    <div className="flex items-center gap-2 text-xs text-red-800 bg-red-50 p-2.5 border border-red-200">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>
                        Sold out in {selectedColor}, Size {selectedSize}. Please contact our stylist for custom commissioning.
                      </span>
                    </div>
                  ) : currentStock <= 2 ? (
                    <div className="flex items-center gap-2 text-xs text-amber-800 bg-amber-50 p-2.5 border border-amber-200 font-medium">
                      <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>
                        Rare Piece: Only <strong>{currentStock}</strong> available in vault.
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 p-2.5 border border-emerald-200 font-medium">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        In Stock · SKU: <strong className="font-mono text-[11px]">{selectedVariant.sku}</strong>
                      </span>
                    </div>
                  )}
                </div>

                {/* 4. Quantity Stepper & Add To Cart Button */}
                <div className="flex items-center gap-4 pt-2">
                  {/* Stepper */}
                  <div className="flex items-center border border-gold/40 bg-white h-13 px-2">
                    <button
                      disabled={quantity <= 1 || !isVariantInStock}
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-8 h-full flex items-center justify-center text-noir/60 hover:text-oxblood disabled:opacity-30 transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-10 text-center font-serif text-sm font-semibold text-noir">
                      {quantity}
                    </span>
                    <button
                      disabled={quantity >= currentStock || !isVariantInStock}
                      onClick={() => setQuantity((q) => Math.min(currentStock, q + 1))}
                      className="w-8 h-full flex items-center justify-center text-noir/60 hover:text-oxblood disabled:opacity-30 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Add To Bag CTA */}
                  <Button
                    id="add-to-cart-btn"
                    disabled={!selectedVariant || !isVariantInStock}
                    onClick={handleAddToCart}
                    variant="oxblood"
                    className="flex-1 h-13 text-xs tracking-[0.25em]"
                  >
                    {!selectedVariant
                      ? "Select Color & Size"
                      : !isVariantInStock
                      ? "Out of Stock"
                      : "Add to Bag"}
                  </Button>
                </div>

                {/* Added Tactile Notice */}
                {addedNotice && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-emerald/10 border border-emerald/30 text-emerald text-xs flex items-center justify-between"
                  >
                    <span>Added to your bag with distinction.</span>
                    <button
                      onClick={openDrawer}
                      className="font-semibold underline uppercase text-[10px] tracking-wider"
                    >
                      View Bag →
                    </button>
                  </motion.div>
                )}
              </div>

              {/* ---------------- CRAFT NARRATIVE ---------------- */}
              {product.story && (
                <div className="mt-8 pt-6 border-t border-gold/20">
                  <h3 className="text-xs uppercase tracking-[0.25em] font-semibold text-oxblood mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-gold-dark" />
                    The Craft Story
                  </h3>
                  <p className="text-xs text-noir/70 leading-relaxed italic font-serif">
                    &ldquo;{product.story}&rdquo;
                  </p>
                </div>
              )}

              {/* Trust Guarantees */}
              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gold/15 text-xs text-noir/70">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-gold-dark shrink-0" />
                  <span>Verified Pure Zari Hallmark</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-gold-dark shrink-0" />
                  <span>Complimentary Insured Delivery</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
