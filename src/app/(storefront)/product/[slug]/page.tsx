import { notFound } from "next/navigation";
import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import { ProductDetailClient } from "./ProductDetailClient";

// Dynamic route — never statically pre-render product pages at build time.
export const dynamic = "force-dynamic";

interface Props {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: params.slug },
      include: { category: true, images: true },
    });

    if (!product) {
      return { title: "Creations | Zaria Atelier" };
    }

    return {
      title: `${product.name} | Zaria Atelier`,
      description: product.description,
      openGraph: {
        title: `${product.name} | Zaria Atelier`,
        description: product.description,
        images: product.images[0]?.url ? [{ url: product.images[0].url }] : [],
      },
    };
  } catch {
    return { title: "Creations | Zaria Atelier" };
  }
}

export default async function ProductPage({ params }: Props) {
  const product = await prisma.product.findUnique({
    where: {
      slug: params.slug,
      active: true,
    },
    include: {
      category: true,
      images: {
        orderBy: { order: "asc" },
      },
      variants: {
        where: { active: true },
        include: {
          inventory: true,
        },
      },
    },
  });

  if (!product) {
    notFound();
  }

  // Serialize Decimals for Client Component
  const serializedProduct = {
    ...product,
    basePrice: Number(product.basePrice),
    variants: product.variants.map((v) => ({
      ...v,
      priceOverride: v.priceOverride ? Number(v.priceOverride) : null,
    })),
  };

  return <ProductDetailClient product={serializedProduct} />;
}
