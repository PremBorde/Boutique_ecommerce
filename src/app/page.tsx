import Link from "next/link";
import Image from "next/image";
import prisma from "@/lib/prisma";
import { AtelierIntro } from "@/components/animations/AtelierIntro";
import { HeroSection } from "@/components/storefront/HeroSection";
import { MarqueeTicker } from "@/components/animations/MarqueeTicker";
import { CraftPillars } from "@/components/storefront/CraftPillars";
import { LookbookRail } from "@/components/storefront/LookbookRail";
import { ProductCard } from "@/components/storefront/ProductCard";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, ShieldCheck, Gem } from "lucide-react";

export default async function HomePage() {
  // Fetch featured products and categories for the storefront
  const [featuredProducts, categories] = await Promise.all([
    prisma.product.findMany({
      where: { active: true, featured: true },
      take: 4,
      include: {
        category: true,
        images: { orderBy: { order: "asc" } },
        variants: {
          where: { active: true },
          include: { inventory: true },
        },
      },
    }),
    prisma.category.findMany({
      take: 5,
      include: {
        _count: { select: { products: { where: { active: true } } } },
      },
    }),
  ]);

  const serializedFeaturedProducts = featuredProducts.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    fabric: p.fabric,
    basePrice: Number(p.basePrice),
    category: p.category ? { name: p.category.name, slug: p.category.slug } : null,
    images: p.images.map((img) => ({
      url: img.url,
      altText: img.altText,
      isPrimary: img.isPrimary,
    })),
    variants: p.variants.map((v) => ({
      id: v.id,
      color: v.color,
      colorHex: v.colorHex,
      size: v.size,
      inventory: v.inventory ? { quantity: v.inventory.quantity } : null,
    })),
  }));

  return (
    <main className="relative bg-ivory">
      {/* 1. Opening Ritual: The Atelier Opens (<1.8s, session-flagged) */}
      <AtelierIntro />

      {/* 2. Hero Section with Layered Parallax */}
      <HeroSection />

      {/* 3. Infinite Marquee Ticker */}
      <MarqueeTicker />

      {/* 4. Horizontal Drag-to-Explore Lookbook Rail */}
      <LookbookRail />

      {/* 5. Scroll-Pinned 5 Craft Pillars Sequence */}
      <CraftPillars />

      {/* 6. Featured Vault Acquisitions Grid */}
      <section className="py-24 px-4 md:px-8 max-w-7xl mx-auto border-t border-gold/20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <p className="text-[10px] uppercase tracking-[0.35em] text-gold-dark font-semibold mb-2 flex items-center gap-1.5">
              <Gem className="w-3.5 h-3.5 text-gold-dark" />
              Vault Highlights
            </p>
            <h2 className="text-3xl md:text-5xl font-serif text-oxblood">
              Curated Heirlooms
            </h2>
          </div>

          <Link href="/shop">
            <Button variant="outline" size="sm" className="gap-2 text-xs text-oxblood border-gold/40">
              View Entire Collection <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {serializedFeaturedProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* 7. Shop by Category Showcase */}
      <section className="py-20 bg-white/50 border-t border-gold/25 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-lg mx-auto mb-12">
            <p className="text-[10px] uppercase tracking-[0.35em] text-gold-dark font-semibold mb-2">
              Bespoke Silhouettes
            </p>
            <h2 className="text-3xl md:text-4xl font-serif text-oxblood">
              Shop by Category
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/shop?category=${cat.slug}`}
                className="group relative aspect-[3/4] overflow-hidden border border-gold/30 bg-noir/5 p-4 flex flex-col justify-end shadow-xs hover:border-gold transition-all"
              >
                {cat.imageUrl && (
                  <Image
                    src={cat.imageUrl}
                    alt={cat.name}
                    fill
                    sizes="250px"
                    className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-noir/90 via-noir/40 to-transparent" />

                <div className="relative z-10 text-center">
                  <h3 className="font-serif text-sm md:text-base text-gold-foil font-semibold group-hover:text-gold-light transition-colors">
                    {cat.name}
                  </h3>
                  <span className="text-[10px] uppercase tracking-widest text-ivory/70 mt-1 block">
                    {cat._count.products} Creations
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Brand Story Editorial Strip */}
      <section className="py-24 bg-oxblood text-ivory px-4 md:px-8 border-t border-gold/30">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <Sparkles className="w-6 h-6 text-gold mx-auto" />
          <h2 className="text-3xl md:text-5xl font-serif leading-tight text-gold-foil">
            &ldquo;In an age of haste, we measure time in stitches.&rdquo;
          </h2>
          <p className="text-sm md:text-base text-ivory/80 leading-relaxed font-sans max-w-2xl mx-auto">
            Zaria was conceived to safeguard the vanishing weaving guilds of Varanasi and the master
            dabka embroiderers of Jaipur. Every garment that leaves our haveli is catalogued with an
            individual hallmark certificate, assuring its authenticity for generations.
          </p>
          <div className="pt-4">
            <Link href="/shop">
              <Button
                variant="gold"
                size="lg"
                className="h-13 px-8 text-xs tracking-[0.25em]"
              >
                Acquire an Heirloom
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
