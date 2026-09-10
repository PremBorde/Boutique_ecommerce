import prisma from "@/lib/prisma";

export interface SearchProductsArgs {
  query?: string;
  category?: string;
  maxPrice?: number;
  minPrice?: number;
  color?: string;
  size?: string;
  inStockOnly?: boolean;
}

export interface ShapedVariant {
  variantId: string;
  color: string;
  size: string;
  stockQuantity: number;
  priceOverride: number | null;
}

export interface ShapedProduct {
  id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  description: string;
  fabric: string | null;
  stylistNote?: string | null;
  imageUrl: string | null;
  inStock: boolean;
  variants: ShapedVariant[];
}

/**
 * 1. searchProducts
 * Searches active products using natural language keywords, category, price band, color, size, and live inventory.
 * Trims and sanitizes data so no internal/admin attributes leak to Gemini.
 */
export async function searchProducts(args: SearchProductsArgs): Promise<ShapedProduct[]> {
  const { query, category, maxPrice, minPrice, color, size, inStockOnly } = args;

  const products = await prisma.product.findMany({
    where: {
      active: true,
      ...(query && {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
          { fabric: { contains: query, mode: "insensitive" } },
          { category: { name: { contains: query, mode: "insensitive" } } },
        ],
      }),
      ...(category && {
        category: {
          OR: [
            { name: { equals: category, mode: "insensitive" } },
            { slug: { equals: category, mode: "insensitive" } },
          ],
        },
      }),
      ...(minPrice !== undefined || maxPrice !== undefined
        ? {
            basePrice: {
              gte: minPrice !== undefined ? minPrice : 0,
              lte: maxPrice !== undefined ? maxPrice : 9999999,
            },
          }
        : {}),
      variants: {
        some: {
          active: true,
          ...(color && { color: { contains: color, mode: "insensitive" } }),
          ...(size && { size: { equals: size, mode: "insensitive" } }),
          ...(inStockOnly ? { inventory: { quantity: { gt: 0 } } } : {}),
        },
      },
    },
    include: {
      category: { select: { name: true, slug: true } },
      images: {
        orderBy: [{ isPrimary: "desc" }, { order: "asc" }],
        take: 1,
        select: { url: true },
      },
      variants: {
        where: { active: true },
        include: {
          inventory: { select: { quantity: true } },
        },
      },
    },
    take: 8, // Cap results to prevent token blowout
  });

  return products.map((p) => {
    const variants: ShapedVariant[] = p.variants.map((v) => ({
      variantId: v.id,
      color: v.color,
      size: v.size,
      stockQuantity: v.inventory?.quantity ?? 0,
      priceOverride: v.priceOverride ? Number(v.priceOverride) : null,
    }));

    const totalStock = variants.reduce((sum, v) => sum + v.stockQuantity, 0);

    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      category: p.category.name,
      price: Number(p.basePrice),
      description: p.description,
      fabric: p.fabric,
      stylistNote: p.stylistNote ?? null,
      imageUrl: p.images[0]?.url ?? null,
      inStock: totalStock > 0,
      variants,
    };
  });
}

/**
 * 2. getProductById
 * Retrieves one specific product with full verified details for precision answering.
 */
export async function getProductById(id: string): Promise<ShapedProduct | null> {
  const p = await prisma.product.findUnique({
    where: { id },
    include: {
      category: { select: { name: true, slug: true } },
      images: {
        orderBy: [{ isPrimary: "desc" }, { order: "asc" }],
        select: { url: true },
      },
      variants: {
        where: { active: true },
        include: {
          inventory: { select: { quantity: true } },
        },
      },
    },
  });

  if (!p) return null;

  const variants: ShapedVariant[] = p.variants.map((v) => ({
    variantId: v.id,
    color: v.color,
    size: v.size,
    stockQuantity: v.inventory?.quantity ?? 0,
    priceOverride: v.priceOverride ? Number(v.priceOverride) : null,
  }));

  const totalStock = variants.reduce((sum, v) => sum + v.stockQuantity, 0);

  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    category: p.category.name,
    price: Number(p.basePrice),
    description: p.description,
    fabric: p.fabric,
    stylistNote: p.stylistNote ?? null,
    imageUrl: p.images[0]?.url ?? null,
    inStock: totalStock > 0,
    variants,
  };
}

/**
 * 3. checkStock
 * Live vault inventory query for a specific variantId or productId + color/size combination.
 */
export async function checkStock(args: {
  variantId?: string;
  productId?: string;
  color?: string;
  size?: string;
}): Promise<{
  available: boolean;
  quantity: number;
  details: string;
  variantId?: string;
}> {
  if (args.variantId) {
    const inv = await prisma.inventory.findUnique({
      where: { variantId: args.variantId },
      include: {
        variant: {
          select: {
            color: true,
            size: true,
            product: { select: { name: true } },
          },
        },
      },
    });

    const qty = inv?.quantity ?? 0;
    return {
      variantId: args.variantId,
      available: qty > 0,
      quantity: qty,
      details: inv
        ? `${inv.variant.product.name} in ${inv.variant.color} (${inv.variant.size}): ${qty} piece(s) available in atelier vault.`
        : `Variant ID ${args.variantId} not found in inventory records.`,
    };
  }

  if (args.productId) {
    const variants = await prisma.variant.findMany({
      where: {
        productId: args.productId,
        active: true,
        ...(args.color && { color: { contains: args.color, mode: "insensitive" } }),
        ...(args.size && { size: { equals: args.size, mode: "insensitive" } }),
      },
      include: {
        inventory: { select: { quantity: true } },
        product: { select: { name: true } },
      },
    });

    if (variants.length === 0) {
      return {
        available: false,
        quantity: 0,
        details: `No variant found for the requested color/size criteria on this garment.`,
      };
    }

    const totalQty = variants.reduce((sum, v) => sum + (v.inventory?.quantity ?? 0), 0);
    const breakdown = variants
      .map((v) => `${v.color} (${v.size}): ${v.inventory?.quantity ?? 0} in stock`)
      .join("; ");

    return {
      available: totalQty > 0,
      quantity: totalQty,
      details: breakdown,
    };
  }

  return {
    available: false,
    quantity: 0,
    details: "Please specify either a variantId or a productId to check stock.",
  };
}

/**
 * Store policy config — hand-written, NEVER AI-generated.
 * Source of truth for client queries on shipping, returns, and payment.
 */
export const STORE_INFO = {
  returns:
    "We offer a 7-day exchange window for unworn items with security tags and hallmark certificates intact. Bespoke bridal orders made to custom measurements are final sale.",
  shipping:
    "Complimentary express shipping on all orders above ₹10,000 across India. For orders below ₹10,000, insured standard delivery is ₹500. Typical atelier dispatch takes 2 to 4 business days in tamper-proof keepsake boxes.",
  cod:
    "Cash on Delivery (COD) is not accepted due to the high-value transit insurance required for handwoven silk couture and zari embroideries. We accept all major credit/debit cards, Net Banking, and UPI.",
  craftsmanship:
    "All pieces are hallmarked and handcrafted by master artisans all over India with certified Mulberry silks, pure Katan, and lab-tested gold/silver zari.",
} as const;

/**
 * 4. getStoreInfo
 * Deterministic policy retrieval. Never allows LLM to imagine policies.
 */
export function getStoreInfo(topic: string): string {
  const key = topic.toLowerCase().trim();
  if (key.includes("return") || key.includes("exchange") || key.includes("refund")) {
    return STORE_INFO.returns;
  }
  if (key.includes("cod") || key.includes("cash") || key.includes("payment")) {
    return STORE_INFO.cod;
  }
  if (key.includes("ship") || key.includes("deliver") || key.includes("courier")) {
    return STORE_INFO.shipping;
  }
  if (key.includes("craft") || key.includes("silk") || key.includes("zari") || key.includes("authentic")) {
    return STORE_INFO.craftsmanship;
  }
  return "I don't have specific information on that — please visit our atelier policies page or contact our concierge at support@zariaboutique.com.";
}

/**
 * Section 8.1: getCraftStory
 * Returns verified editorial heritage and craft background stored in the database.
 * The model NEVER improvises cultural or artisan facts.
 */
export async function getCraftStory(productId: string): Promise<{
  productId: string;
  name: string;
  fabric: string | null;
  craftStory: string | null;
}> {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, name: true, fabric: true, story: true },
  });

  if (!product) {
    return {
      productId,
      name: "Unknown Piece",
      fabric: null,
      craftStory: null,
    };
  }

  return {
    productId: product.id,
    name: product.name,
    fabric: product.fabric,
    craftStory: product.story,
  };
}
