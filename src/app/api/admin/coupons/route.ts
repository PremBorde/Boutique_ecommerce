import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

export const dynamic = "force-dynamic";

const couponCreateSchema = z.object({
  code: z.string().min(2).max(30).toUpperCase(),
  percentOff: z.number().int().min(1).max(100),
  minOrderValue: z.number().min(0).default(0),
  maxDiscount: z.number().positive().optional(),
  expiresAt: z.string().datetime(),
  active: z.boolean().default(true),
});

export async function GET() {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ coupons });
  } catch (error) {
    console.error("Coupon list error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve coupons." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = couponCreateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { code, percentOff, minOrderValue, maxDiscount, expiresAt, active } =
      result.data;

    // Check code uniqueness
    const existing = await prisma.coupon.findUnique({ where: { code } });
    if (existing) {
      return NextResponse.json(
        { error: `Coupon code "${code}" already exists.` },
        { status: 409 }
      );
    }

    const coupon = await prisma.coupon.create({
      data: {
        code,
        percentOff,
        minOrderValue,
        maxDiscount: maxDiscount ?? null,
        expiresAt: new Date(expiresAt),
        active,
      },
    });

    return NextResponse.json({ success: true, coupon }, { status: 201 });
  } catch (error: any) {
    console.error("Coupon creation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create coupon." },
      { status: 500 }
    );
  }
}
