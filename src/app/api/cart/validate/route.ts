import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface IncomingItem {
  variantId: string;
  quantity: number;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const items: IncomingItem[] = body.items || [];
    const couponCode: string | undefined = body.couponCode?.trim();

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({
        valid: false,
        error: "Your bag is empty.",
        items: [],
        issues: ["BAG_EMPTY"],
        subtotal: 0,
        discount: 0,
        shipping: 0,
        total: 0,
      });
    }

    const issues: string[] = [];
    let subtotal = 0;
    const validatedItems: any[] = [];

    // Fetch all requested variants in one query
    const variantIds = items.map((i) => i.variantId);
    const dbVariants = await prisma.variant.findMany({
      where: { id: { in: variantIds } },
      include: {
        product: true,
        inventory: true,
      },
    });

    const variantMap = new Map(dbVariants.map((v) => [v.id, v]));

    for (const item of items) {
      const v = variantMap.get(item.variantId);

      if (!v || !v.active || !v.product.active) {
        issues.push(`Item is no longer available in the atelier collection.`);
        continue;
      }

      const availableStock = v.inventory?.quantity ?? 0;
      const unitPrice = Number(v.priceOverride ?? v.product.basePrice);

      if (availableStock <= 0) {
        issues.push(`"${v.product.name} (${v.color}, ${v.size})" is currently out of stock.`);
      } else if (item.quantity > availableStock) {
        issues.push(
          `Requested ${item.quantity} units of "${v.product.name}", but only ${availableStock} remain in stock.`
        );
      }

      const safeQuantity = Math.min(item.quantity, Math.max(1, availableStock));
      const lineTotal = unitPrice * safeQuantity;
      subtotal += lineTotal;

      validatedItems.push({
        variantId: v.id,
        productId: v.product.id,
        name: v.product.name,
        slug: v.product.slug,
        color: v.color,
        size: v.size,
        sku: v.sku,
        unitPrice,
        quantity: safeQuantity,
        availableStock,
        lineTotal,
        inStock: availableStock > 0,
      });
    }

    // Server-side Coupon validation
    let discount = 0;
    let validCoupon: any = null;

    if (couponCode) {
      const dbCoupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase() },
      });

      const now = new Date();
      if (!dbCoupon || !dbCoupon.active) {
        issues.push(`Privilege coupon "${couponCode}" is invalid.`);
      } else if (dbCoupon.expiresAt <= now) {
        issues.push(`Privilege coupon "${couponCode}" has expired.`);
      } else if (subtotal < Number(dbCoupon.minOrderValue)) {
        issues.push(
          `Coupon requires a minimum order value of ₹${dbCoupon.minOrderValue}.`
        );
      } else {
        const rawDiscount = (subtotal * dbCoupon.percentOff) / 100;
        discount = dbCoupon.maxDiscount
          ? Math.min(rawDiscount, Number(dbCoupon.maxDiscount))
          : rawDiscount;
        discount = Math.round(discount);
        validCoupon = {
          code: dbCoupon.code,
          percentOff: dbCoupon.percentOff,
          discountAmount: discount,
        };
      }
    }

    // Shipping calculation: Complimentary on orders above ₹10,000
    const shipping = subtotal === 0 || subtotal >= 10000 ? 0 : 500;
    const total = Math.max(0, subtotal - discount + shipping);

    const hasBlockingIssues = validatedItems.some((it) => it.availableStock <= 0);

    return NextResponse.json({
      valid: !hasBlockingIssues && issues.length === 0,
      items: validatedItems,
      issues,
      subtotal,
      discount,
      shipping,
      total,
      coupon: validCoupon,
    });
  } catch (error) {
    console.error("Cart validation error:", error);
    return NextResponse.json(
      { error: "Failed to validate bag contents." },
      { status: 500 }
    );
  }
}
