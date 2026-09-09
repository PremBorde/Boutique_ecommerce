"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { formatPrice } from "@/lib/utils";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    description: string;
    fabric?: string | null;
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

  const primaryImage =
    product.images.find((img) => img.isPrimary)?.url ||
    product.images[0]?.url ||
    "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1000";

  const secondaryImage =
    product.images.length > 1
      ? product.images[1].url
      : primaryImage;

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
      className="group relative flex flex-col bg-white border border-gold/25 p-3.5 transition-shadow duration-500 hover:shadow-[0_20px_40px_-15px_rgba(74,14,23,0.18)]"
    >
      <Link href={`/product/${product.slug}`} className="block relative aspect-[3/4] overflow-hidden bg-noir/5">
        {/* Primary Image */}
        <Image
          src={primaryImage}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className={`object-cover transition-all duration-700 ease-out ${
            isHovered && secondaryImage !== primaryImage
              ? "opacity-0 scale-105"
              : "opacity-100 scale-100"
          }`}
        />

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
            <span className="text-[9px] uppercase tracking-[0.25em] px-2 py-0.5 bg-ivory/90 text-oxblood border border-gold/30 font-medium backdrop-blur-sm">
              {product.category.name}
            </span>
          )}
          {isOutOfStock && (
            <span className="text-[9px] uppercase tracking-[0.2em] px-2 py-0.5 bg-noir text-gold-light border border-gold font-medium">
              Archived / Sold Out
            </span>
          )}
        </div>

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
          {/* Color Dots */}
          {colorVariants.length > 0 && (
            <div className="flex items-center gap-1.5 mb-2">
              {colorVariants.map((v) => (
                <span
                  key={v.colorHex}
                  title={v.color}
                  style={{ backgroundColor: v.colorHex }}
                  className="w-2.5 h-2.5 rounded-full border border-black/20 shadow-xs"
                />
              ))}
              <span className="text-[10px] text-noir/40 ml-1">
                {colorVariants.length} {colorVariants.length === 1 ? "shade" : "shades"}
              </span>
            </div>
          )}

          <Link href={`/product/${product.slug}`} className="block">
            <h3 className="font-serif text-base text-oxblood hover:text-gold transition-colors font-normal line-clamp-1">
              {product.name}
            </h3>
          </Link>

          {product.fabric && (
            <p className="text-[11px] text-noir/50 line-clamp-1 mt-0.5">
              {product.fabric}
            </p>
          )}
        </div>

        <div className="pt-3 mt-3 border-t border-gold/15 flex items-center justify-between">
          <span className="font-serif text-sm font-semibold text-oxblood">
            {formatPrice(product.basePrice)}
          </span>
          <span className="text-[10px] uppercase tracking-wider text-gold-dark font-medium group-hover:translate-x-0.5 transition-transform">
            Details →
          </span>
        </div>
      </div>
    </motion.div>
  );
}
