import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { code, subtotal } = await req.json();

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { valid: false, error: "Please provide a valid privilege code." },
        { status: 400 }
      );
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase().trim() },
    });

    if (!coupon || !coupon.active) {
      return NextResponse.json(
        { valid: false, error: `Privilege code "${code}" is invalid or does not exist.` },
        { status: 404 }
      );
    }

    const now = new Date();
    if (coupon.expiresAt <= now) {
      return NextResponse.json(
        { valid: false, error: `Privilege code "${code}" has expired.` },
        { status: 400 }
      );
    }

    const numericSubtotal = Number(subtotal) || 0;
    const minOrder = Number(coupon.minOrderValue);

    if (numericSubtotal < minOrder) {
      return NextResponse.json(
        {
          valid: false,
          error: `Privilege code requires a minimum order value of ₹${minOrder.toLocaleString("en-IN")}.`,
        },
        { status: 400 }
      );
    }

    const rawDiscount = (numericSubtotal * coupon.percentOff) / 100;
    const maxDisc = coupon.maxDiscount ? Number(coupon.maxDiscount) : null;
    const finalDiscount = maxDisc ? Math.min(rawDiscount, maxDisc) : rawDiscount;

    return NextResponse.json({
      valid: true,
      coupon: {
        code: coupon.code,
        percentOff: coupon.percentOff,
        minOrderValue: minOrder,
        maxDiscount: maxDisc,
        discountAmount: Math.round(finalDiscount),
      },
    });
  } catch (error) {
    console.error("Coupon validation error:", error);
    return NextResponse.json(
      { valid: false, error: "Failed to evaluate coupon." },
      { status: 500 }
    );
  }
}
