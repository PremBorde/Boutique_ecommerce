import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const checkoutSchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Valid email is required."),
  phone: z.string().min(10, "Valid phone number is required."),
  shippingAddress: z.object({
    line1: z.string().min(3, "Address line 1 is required."),
    city: z.string().min(2, "City is required."),
    state: z.string().min(2, "State is required."),
    postalCode: z.string().min(5, "Postal code is required."),
    country: z.string().default("India"),
  }),
  items: z
    .array(
      z.object({
        variantId: z.string(),
        quantity: z.number().int().positive(),
      })
    )
    .min(1, "At least one item is required."),
  couponCode: z.string().optional().nullable(),
  simulatedPaymentStatus: z.enum(["SUCCESS", "FAILED"]).default("SUCCESS"),
  idempotencyKey: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id || null;

    const body = await req.json();
    const result = checkoutSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const {
      customerName,
      email,
      phone,
      shippingAddress,
      items,
      couponCode,
      simulatedPaymentStatus,
    } = result.data;

    // 1. Simulated Payment Failure Demo Toggle
    if (simulatedPaymentStatus === "FAILED") {
      return NextResponse.json(
        {
          error: "Simulated payment failed. Card declined by issuing bank (Demo Mode).",
          code: "PAYMENT_DECLINED",
        },
        { status: 402 }
      );
    }

    // 2. ATOMIC TRANSACTION: Inventory decrement + Order creation
    const order = await prisma.$transaction(
      async (tx) => {
        let subtotal = 0;
        const orderItemsData: any[] = [];

        // Verify and decrement inventory atomically for each item
        for (const item of items) {
          const v = await tx.variant.findUnique({
            where: { id: item.variantId },
            include: { product: true, inventory: true },
          });

          if (!v || !v.active || !v.product.active) {
            throw new Error(`Item ${item.variantId} is no longer active.`);
          }

          // ATOMIC CONDITIONAL UPDATE:
          // UPDATE "Inventory" SET quantity = quantity - qty WHERE variantId = id AND quantity >= qty;
          const updateResult = await tx.inventory.updateMany({
            where: {
              variantId: item.variantId,
              quantity: { gte: item.quantity },
            },
            data: {
              quantity: { decrement: item.quantity },
            },
          });

          if (updateResult.count !== 1) {
            const currentQuantity = v.inventory?.quantity ?? 0;
            throw new Error(
              `INSUFFICIENT_STOCK: "${v.product.name} (${v.color}, ${v.size})" has only ${currentQuantity} units available.`
            );
          }

          // Always use live database price, never client price
          const unitPrice = Number(v.priceOverride ?? v.product.basePrice);
          const lineTotal = unitPrice * item.quantity;
          subtotal += lineTotal;

          orderItemsData.push({
            variantId: v.id,
            sku: v.sku,
            title: v.product.name,
            color: v.color,
            size: v.size,
            qty: item.quantity,
            unitPriceAtPurchase: unitPrice,
            subtotal: lineTotal,
          });
        }

        // 3. Server-side coupon re-validation inside the transaction
        let discount = 0;
        let appliedCouponCode: string | null = null;

        if (couponCode) {
          const dbCoupon = await tx.coupon.findUnique({
            where: { code: couponCode.toUpperCase().trim() },
          });

          const now = new Date();
          if (
            dbCoupon &&
            dbCoupon.active &&
            dbCoupon.expiresAt > now &&
            subtotal >= Number(dbCoupon.minOrderValue)
          ) {
            const rawDiscount = (subtotal * dbCoupon.percentOff) / 100;
            discount = dbCoupon.maxDiscount
              ? Math.min(rawDiscount, Number(dbCoupon.maxDiscount))
              : rawDiscount;
            discount = Math.round(discount);
            appliedCouponCode = dbCoupon.code;
          }
        }

        // 4. Shipping Calculation: Complimentary above ₹10,000
        const shipping = subtotal >= 10000 ? 0 : 500;
        const total = Math.max(0, subtotal - discount + shipping);

        // 5. Generate Order Number
        const randomHex = Math.random().toString(16).substring(2, 6).toUpperCase();
        const orderNumber = `ZR-${new Date().getFullYear()}-${randomHex}`;

        // 5.5 Verify and resolve valid userId to guarantee foreign key integrity
        let validUserId: string | null = null;
        if (userId) {
          const userById = await tx.user.findUnique({
            where: { id: userId },
            select: { id: true },
          });
          if (userById) {
            validUserId = userById.id;
          }
        }

        // If session token has a stale ID (e.g. after DB reseed), match by verified email
        if (!validUserId) {
          const emailToMatch = session?.user?.email || email;
          if (emailToMatch) {
            const userByEmail = await tx.user.findUnique({
              where: { email: emailToMatch.toLowerCase().trim() },
              select: { id: true },
            });
            if (userByEmail) {
              validUserId = userByEmail.id;
            }
          }
        }

        // 6. Create Order with Items and Status History
        const createdOrder = await tx.order.create({
          data: {
            orderNumber,
            userId: validUserId,
            customerName,
            email: email.toLowerCase().trim(),
            phone,
            shippingAddress,
            subtotal,
            discount,
            shipping,
            total,
            couponCode: appliedCouponCode,
            status: "CONFIRMED",
            paymentMethod: "SIMULATED_CARD",
            paymentStatus: "PAID",
            items: {
              create: orderItemsData,
            },
            statusHistory: {
              create: [
                {
                  status: "PENDING",
                  note: "Order initialized via simulated checkout gateway",
                },
                {
                  status: "CONFIRMED",
                  note: "Simulated payment captured successfully. Inventory reserved.",
                },
              ],
            },
          },
          include: {
            items: true,
          },
        });

        return createdOrder;
      },
      {
        timeout: 15000,
      }
    );

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        total: order.total,
        status: order.status,
      },
    });
  } catch (error: any) {
    console.error("Checkout order creation error:", error);

    if (error.message?.startsWith("INSUFFICIENT_STOCK")) {
      return NextResponse.json(
        { error: error.message.replace("INSUFFICIENT_STOCK: ", "") },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to process order." },
      { status: 500 }
    );
  }
}
