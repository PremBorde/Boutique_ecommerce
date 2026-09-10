import Link from "next/link";
import Image from "next/image";
import prisma from "@/lib/prisma";
import { HeroSection } from "@/components/storefront/HeroSection";
import { MarqueeTicker } from "@/components/animations/MarqueeTicker";
import { CraftPillars } from "@/components/storefront/CraftPillars";
import { LookbookRail } from "@/components/storefront/LookbookRail";
import { ProductCard } from "@/components/storefront/ProductCard";
import { ScrollExpand } from "@/components/animations/ScrollExpand";
import { Button } from "@/components/ui/button";
import { ArrowRight, Gem } from "lucide-react";

// ISR: serve cached page, revalidate in background every 5 minutes.
// Admin product changes will be live within 5 minutes.
export const revalidate = 300;

export default async function HomePage() {
  // Fetch featured products and categories for the storefront.
  // Wrapped in try/catch so a DB hiccup never crashes the whole page.
  const productQuery = prisma.product.findMany({
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
  });

  const categoryQuery = prisma.category.findMany({
    take: 5,
    include: {
      _count: { select: { products: { where: { active: true } } } },
    },
  });

  type FeaturedProduct = Awaited<typeof productQuery>[number];
  type CategoryWithCount = Awaited<typeof categoryQuery>[number];

  let featuredProducts: FeaturedProduct[] = [];
  let categories: CategoryWithCount[] = [];

  try {
    [featuredProducts, categories] = await Promise.all([productQuery, categoryQuery]);
  } catch (err) {
    console.error("[HomePage] DB fetch failed:", err);
    // Page will render with empty collections — graceful degradation.
  }

  const serializedFeaturedProducts = featuredProducts.map((p) => ({
    ...p,
    basePrice: Number(p.basePrice),
    variants: p.variants.map((v) => ({
      ...v,
      priceOverride: v.priceOverride ? Number(v.priceOverride) : null,
    })),
  }));

  return (
    <main className="relative bg-ivory dark:bg-[#0C0A0B] transition-colors duration-300">
      {/* Hero Section with Layered Parallax */}
      <HeroSection />

      {/* 3. Infinite Marquee Ticker */}
      <MarqueeTicker />

      {/* 4. Horizontal Drag-to-Explore Lookbook Rail */}
      <LookbookRail />

      {/* 5. Scroll-Pinned 5 Craft Pillars Sequence */}
      <CraftPillars />

      {/* 6. Featured Outfits Grid */}
      <section className="py-24 px-4 md:px-8 max-w-7xl mx-auto border-t border-gold/20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <p className="text-[10px] uppercase tracking-[0.35em] text-gold-dark dark:text-gold-light font-semibold mb-2 flex items-center gap-1.5">
              <Gem className="w-3.5 h-3.5 text-gold-dark dark:text-gold-light" />
              Featured Picks
            </p>
            <h2 className="text-3xl md:text-5xl font-serif text-oxblood dark:text-gold-foil">
              Our Signature Collection
            </h2>
          </div>

          <Link href="/shop">
            <Button variant="outline" size="sm" className="gap-2 text-xs text-oxblood dark:text-gold-light border-gold/40 dark:border-gold/30 hover:bg-gold/10">
              View All Outfits <ArrowRight className="w-3.5 h-3.5" />
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
      <section className="py-20 bg-white/50 dark:bg-[#110D0F] border-t border-gold/25 dark:border-gold/15 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-lg mx-auto mb-12">
            <p className="text-[10px] uppercase tracking-[0.35em] text-gold-dark dark:text-gold-light font-semibold mb-2">
              Browse Categories
            </p>
            <h2 className="text-3xl md:text-4xl font-serif text-oxblood dark:text-gold-foil">
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
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-noir/90 via-noir/40 to-transparent" />

                <div className="relative z-10 text-center">
                  <h3 className="font-serif text-sm md:text-base text-gold-foil font-semibold group-hover:text-gold-light transition-colors">
                    {cat.name}
                  </h3>
                  <span className="text-[10px] uppercase tracking-widest text-ivory/70 mt-1 block">
                    {cat._count.products} Designs
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
          <h2 className="text-3xl md:text-5xl font-serif leading-tight text-gold-foil">
            &ldquo;In a world of fast fashion, we craft every piece with patience and care.&rdquo;
          </h2>
          <p className="text-sm md:text-base text-ivory/80 leading-relaxed font-sans max-w-2xl mx-auto">
            Zaria bridges timeless heritage with contemporary Indian luxury. Every piece is
            handcrafted by skilled artisans using pure handloom silks, intricate embroidery, and modern cuts
            designed to be cherished for years to come.
          </p>
          <div className="pt-4">
            <Link href="/shop">
              <Button
                variant="gold"
                size="lg"
                className="h-13 px-8 text-xs tracking-[0.25em]"
              >
                Explore The Collection
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 9. Masterpiece Lookbook Reveal */}
      <section className="relative bg-[#0A0709] border-t border-gold/30 pt-16 pb-0 text-ivory">
        <div className="max-w-4xl mx-auto text-center px-4 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-gold/10 border border-gold/30 mb-3 backdrop-blur-xs">
            <span className="text-gold text-xs">✦</span>
            <span className="text-[10px] uppercase tracking-[0.35em] text-gold-foil font-semibold">
              The Grand Atelier Reveal
            </span>
            <span className="text-gold text-xs">✦</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-serif text-ivory">
            The Noor Mahal Bridal Edit
          </h2>
          <p className="text-xs md:text-sm text-ivory/70 max-w-lg mx-auto mt-2 font-light">
            Scroll down to unfold the artisan embroidery, hand-set zari details, and pure silk velvet drape.
          </p>
        </div>

        <ScrollExpand
          src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=92&w=2560&auto=format&fit=crop"
          alt="The Noor Mahal Velvet Lehenga by Zaria Atelier"
          useWindowScroll
          startWidth={52}
          startHeight={76}
          startRadius={6}
          mediaZoom={1.0}
          objectPosition="center 26%"
          scrollDistance={0.8}
          holdDistance={0.25}
          overlayScrim={0.72}
          title={
            <div className="space-y-2.5 max-w-lg px-4 text-center select-none pointer-events-none">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-noir/85 border border-gold/40 backdrop-blur-md shadow-xl mb-1">
                <span className="text-gold text-[10px]">✦</span>
                <span className="text-[9.5px] uppercase tracking-[0.35em] text-gold-foil font-semibold">
                  Bridal Couture Spotlight
                </span>
                <span className="text-gold text-[10px]">✦</span>
              </div>
              <h3 className="font-serif text-3xl sm:text-5xl md:text-6xl text-ivory tracking-wide leading-tight drop-shadow-[0_4px_30px_rgba(0,0,0,0.95)]">
                The Noor Mahal
              </h3>
              <p className="font-sans text-[11px] sm:text-xs uppercase tracking-[0.28em] text-gold-light/95 drop-shadow-md font-medium">
                18-Panel Pure Silk Velvet · Hand Zari Jaal
              </p>
            </div>
          }
          scrollHint={
            <div className="flex flex-col items-center gap-1.5 text-gold-light/90">
              <span className="text-[9.5px] uppercase tracking-[0.3em] font-medium">
                Scroll to Unfold Creation
              </span>
              <div className="w-5 h-5 rounded-full border border-gold/40 flex items-center justify-center animate-bounce">
                <span className="text-xs leading-none">↓</span>
              </div>
            </div>
          }
        >
          <div className="max-w-2xl mx-auto space-y-4 px-6 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-gold/15 border border-gold/40 backdrop-blur-md">
              <span className="text-[10px] uppercase tracking-[0.35em] text-gold-foil font-semibold">
                Limited Atelier Edition
              </span>
            </div>

            <h3 className="font-serif text-3xl sm:text-5xl md:text-6xl text-ivory leading-tight drop-shadow-lg">
              Crafted in Pure Gold &amp; Silk
            </h3>

            <p className="text-xs sm:text-sm text-ivory/85 leading-relaxed font-sans max-w-lg mx-auto font-light">
              Over 320 karigar hours of zardozi bullion embroidery on 18 hand-panelled cuts of mulberry silk velvet. Complete with real metallic zari borders.
            </p>

            <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Link href="/product/noor-mahal-velvet-lehenga">
                <Button
                  variant="gold"
                  size="lg"
                  className="h-12 px-8 text-xs tracking-[0.25em] shadow-[0_4px_25px_rgba(201,160,80,0.35)]"
                >
                  Acquire This Piece · ₹28,500
                </Button>
              </Link>
              <Link href="/shop?category=lehengas-couture">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 px-7 text-xs tracking-[0.25em] border-gold/40 text-ivory hover:bg-gold/15 backdrop-blur-sm"
                >
                  Explore Bridal Gallery →
                </Button>
              </Link>
            </div>
          </div>
        </ScrollExpand>
      </section>
    </main>
  );
}

