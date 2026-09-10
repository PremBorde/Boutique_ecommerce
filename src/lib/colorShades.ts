// Luxury Atelier Color-to-Image & Dynamic Shade Resolver

export interface ResolvedShadeImage {
  url: string;
  isTinted: boolean;
  colorHex?: string;
}

export const CATEGORY_SHADE_MAP: Record<string, Record<string, string>> = {
  sarees: {
    plum: "/products/saree_varanasi_katan.jpg",
    purple: "/products/saree_varanasi_katan.jpg",
    royal: "/products/saree_varanasi_katan.jpg",
    gold: "/products/saree_sitara_gold.jpg",
    antique: "/products/saree_sitara_gold.jpg",
    liquid: "/products/saree_sitara_gold.jpg",
    wine: "/products/saree_shikargah_wine.jpg",
    midnight: "/products/saree_shikargah_wine.jpg",
    copper: "/products/saree_chandrika_rose_gold.jpg",
    rose: "/products/saree_chandrika_rose_gold.jpg",
    pink: "/products/saree_chandrika_rose_gold.jpg",
    blush: "/products/saree_chandrika_rose_gold.jpg",
  },
  lehengas: {
    crimson: "/products/lehenga_crimson_bridal.jpg",
    red: "/products/lehenga_crimson_bridal.jpg",
    wine: "/products/lehenga_crimson_bridal.jpg",
    imperial: "/products/lehenga_crimson_bridal.jpg",
    emerald: "/products/lehenga_emerald_green.jpg",
    green: "/products/lehenga_emerald_green.jpg",
    forest: "/products/lehenga_emerald_green.jpg",
    ivory: "/products/lehenga_ivory_organza.jpg",
    white: "/products/lehenga_ivory_organza.jpg",
    organza: "/products/lehenga_ivory_organza.jpg",
    moonlit: "/products/lehenga_ivory_organza.jpg",
  },
  menswear: {
    black: "/products/menswear_bandhgala.jpg",
    obsidian: "/products/menswear_bandhgala.jpg",
    ivory: "/products/menswear_sherwani.jpg",
    cream: "/products/menswear_sherwani.jpg",
    sand: "/products/menswear_sherwani.jpg",
    champagne: "/products/menswear_sherwani.jpg",
    saffron: "/products/menswear_kurta_bundi.jpg",
    mustard: "/products/menswear_kurta_bundi.jpg",
    ochre: "/products/menswear_kurta_bundi.jpg",
  },
  pret: {
    saffron: "/products/pret_saffron_kurta.jpg",
    ochre: "/products/pret_saffron_kurta.jpg",
    yellow: "/products/pret_saffron_kurta.jpg",
  },
  anarkalis: {
    ivory: "/products/anarkali_ivory.jpg",
    sand: "/products/anarkali_ivory.jpg",
    cream: "/products/anarkali_ivory.jpg",
  },
};

/**
 * Resolves the studio photo or dynamic fabric tint for any product shade
 */
export function resolveShadeImage(
  product: {
    slug?: string;
    category?: { slug?: string; name?: string } | null;
    images?: Array<{ url: string; color?: string | null }>;
    variants?: Array<{ color: string; colorHex: string }>;
  },
  selectedColor?: string | null
): ResolvedShadeImage {
  const images = product.images || [];
  const primaryUrl =
    images[0]?.url ||
    "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b";

  if (!selectedColor) {
    return { url: primaryUrl, isTinted: false };
  }

  const colorNorm = selectedColor.toLowerCase().trim();
  const matchedVariant = (product.variants || []).find(
    (v) => v.color.toLowerCase() === colorNorm
  );

  // 1. Direct tag on product.images
  const direct = images.find(
    (img) => img.color && img.color.toLowerCase() === colorNorm
  );
  if (direct) {
    return { url: direct.url, isTinted: false, colorHex: matchedVariant?.colorHex };
  }

  // 2. Category-based shade mapping to curated studio photos
  const categoryKey = Object.keys(CATEGORY_SHADE_MAP).find(
    (k) =>
      product.category?.slug?.toLowerCase().includes(k) ||
      product.category?.name?.toLowerCase().includes(k) ||
      product.slug?.toLowerCase().includes(k)
  );

  if (categoryKey) {
    const map = CATEGORY_SHADE_MAP[categoryKey];
    for (const [kw, url] of Object.entries(map)) {
      if (colorNorm.includes(kw)) {
        return { url, isTinted: false, colorHex: matchedVariant?.colorHex };
      }
    }
  }

  // 3. Dynamic shade fallback: Use primary image with tailored fabric color wash
  const primaryColor =
    images[0]?.color?.toLowerCase() ||
    product.variants?.[0]?.color?.toLowerCase();
  const isNativeColor = primaryColor && colorNorm === primaryColor;

  return {
    url: primaryUrl,
    isTinted: !isNativeColor,
    colorHex: matchedVariant?.colorHex,
  };
}
