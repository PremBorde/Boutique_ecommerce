import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getComplementarySlugs, COMPLEMENTARY_CATEGORIES } from "@/lib/ai/complementary-categories";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || "heritage-sarees";
    const excludeProductId = searchParams.get("excludeId");

    const complementarySlugs = getComplementarySlugs(category);

    const complementaryProduct = await prisma.product.findFirst({
      where: {
        active: true,
        category: {
          slug: { in: complementarySlugs },
        },
        ...(excludeProductId ? { id: { not: excludeProductId } } : {}),
        variants: {
          some: {
            active: true,
            inventory: { quantity: { gt: 0 } },
          },
        },
      },
      include: {
        category: true,
        images: {
          orderBy: [{ isPrimary: "desc" }, { order: "asc" }],
          take: 1,
        },
      },
    });

    const advice =
      (COMPLEMENTARY_CATEGORIES as any)[category]?.stylingAdvice ||
      "Pairs beautifully with contrasting handwoven accents.";

    return NextResponse.json({
      product: complementaryProduct,
      stylingAdvice: advice,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
