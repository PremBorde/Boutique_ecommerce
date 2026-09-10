import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    const category = searchParams.get("category");
    const color = searchParams.get("color");
    const size = searchParams.get("size");
    const minPrice = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined;
    const maxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined;
    const inStock = searchParams.get("inStock") === "true";
    const sort = searchParams.get("sort") || "newest";
    const page = Math.max(1, Number(searchParams.get("page") || "1"));
    const limit = Math.max(1, Math.min(50, Number(searchParams.get("limit") || "12")));
    const skip = (page - 1) * limit;

    const idsParam = searchParams.get("ids");

    const where: any = {
      active: true,
    };

    if (idsParam) {
      const ids = idsParam.split(",").map((s) => s.trim()).filter(Boolean);
      if (ids.length > 0) {
        where.id = { in: ids };
      }
    }

    // Text search in name, description, story, fabric
    if (q.trim()) {
      where.OR = [
        { name: { contains: q.trim(), mode: "insensitive" } },
        { description: { contains: q.trim(), mode: "insensitive" } },
        { story: { contains: q.trim(), mode: "insensitive" } },
        { fabric: { contains: q.trim(), mode: "insensitive" } },
      ];
    }

    // Category filter by slug or name
    if (category && category !== "all") {
      where.category = {
        slug: category,
      };
    }

    // Price range
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.basePrice = {};
      if (minPrice !== undefined) where.basePrice.gte = minPrice;
      if (maxPrice !== undefined) where.basePrice.lte = maxPrice;
    }

    // Variant-based filters (color, size, inStock)
    const variantWhere: any = { active: true };
    if (color && color !== "all") {
      variantWhere.color = { equals: color, mode: "insensitive" };
    }
    if (size && size !== "all") {
      variantWhere.size = { equals: size, mode: "insensitive" };
    }
    if (inStock) {
      variantWhere.inventory = {
        quantity: { gt: 0 },
      };
    }

    if (Object.keys(variantWhere).length > 1) {
      where.variants = {
        some: variantWhere,
      };
    }

    // Sorting
    let orderBy: any = { createdAt: "desc" };
    if (sort === "price_asc") {
      orderBy = { basePrice: "asc" };
    } else if (sort === "price_desc") {
      orderBy = { basePrice: "desc" };
    } else if (sort === "name_asc") {
      orderBy = { name: "asc" };
    }

    const [total, products, categories] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
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
      }),
      prisma.category.findMany({
        include: {
          _count: { select: { products: { where: { active: true } } } },
        },
      }),
    ]);

    return NextResponse.json({
      products,
      categories,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Products API error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve atelier catalogue." },
      { status: 500 }
    );
  }
}
