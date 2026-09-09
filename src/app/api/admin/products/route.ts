import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { z } from "zod";

const productCreateSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(10),
  story: z.string().optional(),
  fabric: z.string().optional(),
  basePrice: z.number().positive(),
  categoryId: z.string(),
  imageUrl: z.string().url(),
  variants: z
    .array(
      z.object({
        color: z.string(),
        colorHex: z.string(),
        size: z.string(),
        sku: z.string(),
        stock: z.number().int().min(0),
      })
    )
    .min(1),
});

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        images: true,
        variants: {
          include: { inventory: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const categories = await prisma.category.findMany();

    return NextResponse.json({ products, categories });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to retrieve products for administration." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = productCreateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const {
      name,
      description,
      story,
      fabric,
      basePrice,
      categoryId,
      imageUrl,
      variants,
    } = result.data;

    let slug = slugify(name);
    const existingSlug = await prisma.product.findUnique({ where: { slug } });
    if (existingSlug) {
      slug = `${slug}-${Math.random().toString(36).substring(2, 6)}`;
    }

    const product = await prisma.$transaction(async (tx) => {
      const created = await tx.product.create({
        data: {
          name,
          slug,
          description,
          story,
          fabric,
          basePrice,
          categoryId,
          images: {
            create: [
              {
                url: imageUrl,
                altText: name,
                isPrimary: true,
                order: 0,
              },
            ],
          },
        },
      });

      for (const v of variants) {
        await tx.variant.create({
          data: {
            productId: created.id,
            color: v.color,
            colorHex: v.colorHex,
            size: v.size,
            sku: v.sku.toUpperCase(),
            inventory: {
              create: {
                quantity: v.stock,
              },
            },
          },
        });
      }

      return created;
    });

    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (error: any) {
    console.error("Admin product creation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create product." },
      { status: 500 }
    );
  }
}
