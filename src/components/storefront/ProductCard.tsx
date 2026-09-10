"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { formatPrice } from "@/lib/utils";
import { resolveShadeImage } from "@/lib/colorShades";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    description: string;
    fabric?: string | null;
    stylistNote?: string | null;
    basePrice: number | string | { toString(): string };
    category?: { name: string; slug: string } | null;
    images: Array<{
      url: string;
      altText?: string | null;
      isPrimary?: boolean;
    }>;
    variants?: Array<{
      id: string;
      color: string;
      colorHex: string;
      size: string;
      inventory?: { quantity: number } | null;
    }>;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  // 3D Tilt calculation
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useTransform(mouseY, [-0.5, 0.5], [6, -6]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-6, 6]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const x = (e.clientX - rect.left) / width - 0.5;
    const y = (e.clientY - rect.top) / height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  const [activeColorShade, setActiveColorShade] = useState<{
    color: string;
    colorHex: string;
  } | null>(null);

  const primaryImage =
    product.images.find((img) => img.isPrimary)?.url ||
    product.images[0]?.url ||
    "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1000";

  const secondaryImage =
    product.images.length > 1
      ? product.images[1].url
      : primaryImage;

  const currentShadeImage = activeColorShade
    ? resolveShadeImage(product, activeColorShade.color)
    : null;

  const displayPrimaryImage = currentShadeImage?.url || primaryImage;

  // Unique colors
  const colorVariants = Array.from(
    new Map(
      (product.variants || []).map((v) => [v.colorHex, v])
    ).values()
  );

  // Total stock across all variants
  const totalStock = (product.variants || []).reduce(
    (sum, v) => sum + (v.inventory?.quantity || 0),
    0
  );
  const isOutOfStock = (product.variants || []).length > 0 && totalStock === 0;

  return (
    <motion.div
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className="group relative flex flex-col bg-white dark:bg-[#161214] border border-gold/25 dark:border-gold/20 p-3.5 transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(74,14,23,0.18)] dark:hover:shadow-[0_20px_40px_-15px_rgba(201,160,80,0.15)]"
    >
      <Link href={`/product/${product.slug}`} className="block relative aspect-[3/4] overflow-hidden bg-noir/5 dark:bg-noir/30">
        {/* Primary Image */}
        <Image
          src={displayPrimaryImage}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className={`object-cover transition-all duration-700 ease-out ${
            isHovered && secondaryImage !== primaryImage && !activeColorShade
              ? "opacity-0 scale-105"
              : "opacity-100 scale-100"
          }`}
        />

        {/* Dynamic Shade Tint Overlay if card is previewing a shade */}
        {currentShadeImage?.isTinted && activeColorShade?.colorHex && (
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-300"
            style={{
              backgroundColor: activeColorShade.colorHex,
              mixBlendMode: "color",
              opacity: 0.52,
            }}
          />
        )}

        {/* Secondary Image (Crossfade on hover) */}
        {secondaryImage !== primaryImage && (
          <Image
            src={secondaryImage}
            alt={`${product.name} alternate view`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className={`object-cover transition-all duration-700 ease-out ${
              isHovered ? "opacity-100 scale-105" : "opacity-0 scale-100"
            }`}
          />
        )}

        {/* Stock or Category Badge */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
          {product.category && (
            <span className="text-[9px] uppercase tracking-[0.25em] px-2 py-0.5 bg-ivory/90 dark:bg-[#20181B]/90 text-oxblood dark:text-gold-foil border border-gold/30 font-medium backdrop-blur-sm">
              {product.category.name}
            </span>
          )}
          {isOutOfStock && (
            <span className="text-[9px] uppercase tracking-[0.2em] px-2 py-0.5 bg-noir text-gold-light border border-gold font-medium">
              Archived / Sold Out
            </span>
          )}
        </div>

        {/* Ambient Stylist Companion on Hover (Section 7 - Zero extra API calls) */}
        {product.stylistNote && (
          <div
            className={`absolute inset-x-2 top-2 z-20 transition-all duration-300 pointer-events-none ${
              isHovered ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
            }`}
          >
            <div className="bg-[#FAF7F2]/95 dark:bg-[#161214]/95 backdrop-blur-md border border-[#C9A050]/40 p-2 shadow-lg">
              <div className="flex items-start gap-1.5">
                <span className="text-[#C9A050] text-[10px] select-none">✦</span>
                <div className="flex-1">
                  <p className="font-serif italic text-[10px] text-oxblood dark:text-ivory leading-tight line-clamp-2">
                    &ldquo;{product.stylistNote}&rdquo;
                  </p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (typeof window !== "undefined") {
                        window.dispatchEvent(
                          new CustomEvent("zaria:ask-concierge", {
                            detail: {
                              prompt: `Tell me how to style ${product.name} and what pieces complement it.`,
                            },
                          })
                        );
                      }
                    }}
                    className="pointer-events-auto mt-1 text-[9px] uppercase tracking-wider text-[#9E7A2F] dark:text-gold-light hover:underline font-semibold flex items-center gap-1"
                  >
                    <span>Ask Concierge</span>
                    <span aria-hidden="true">→</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View Details Overlay on Hover */}
        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-noir/80 via-noir/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <span className="text-[11px] uppercase tracking-[0.25em] text-gold-foil font-serif font-medium">
            Explore Piece →
          </span>
        </div>
      </Link>

      {/* Product Information */}
      <div className="pt-4 flex flex-col flex-1 justify-between">
        <div>
          {/* Color Dots with Live Shade Preview */}
          {colorVariants.length > 0 && (
            <div className="flex items-center gap-1.5 mb-2">
              {colorVariants.map((v) => {
                const isSelected = activeColorShade?.colorHex === v.colorHex;
                return (
                  <button
                    type="button"
                    key={v.colorHex}
                    title={v.color}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setActiveColorShade(isSelected ? null : { color: v.color, colorHex: v.colorHex });
                    }}
                    onMouseEnter={() => setActiveColorShade({ color: v.color, colorHex: v.colorHex })}
                    style={{ backgroundColor: v.colorHex }}
                    className={`w-3 h-3 rounded-full border transition-transform cursor-pointer ${
                      isSelected
                        ? "scale-125 border-gold ring-1 ring-gold shadow-xs"
                        : "border-black/20 hover:scale-110"
                    }`}
                  />
                );
              })}
              <span className="text-[10px] text-noir/40 dark:text-ivory/40 ml-1 truncate">
                {activeColorShade ? activeColorShade.color : `${colorVariants.length} ${colorVariants.length === 1 ? "shade" : "shades"}`}
              </span>
            </div>
          )}

          <Link href={`/product/${product.slug}`} className="block">
            <h3 className="font-serif text-base text-oxblood dark:text-ivory hover:text-gold dark:hover:text-gold-light transition-colors font-normal line-clamp-1">
              {product.name}
            </h3>
          </Link>

          {product.fabric && (
            <p className="text-[11px] text-noir/50 dark:text-ivory/50 line-clamp-1 mt-0.5">
              {product.fabric}
            </p>
          )}
        </div>

        <div className="pt-3 mt-3 border-t border-gold/15 dark:border-gold/10 flex items-center justify-between">
          <span className="font-serif text-sm font-semibold text-oxblood dark:text-gold-foil">
            {formatPrice(product.basePrice)}
          </span>
          <span className="text-[10px] uppercase tracking-wider text-gold-dark dark:text-gold-light font-medium group-hover:translate-x-0.5 transition-transform">
            Details →
          </span>
        </div>
      </div>
    </motion.div>
  );
}
