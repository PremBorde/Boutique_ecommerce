import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const orderId = params.id;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    // Security: Only order owner or admin can cancel
    if (order.userId && (!session?.user || ((session.user as any).id !== order.userId && (session.user as any).role !== "ADMIN"))) {
      return NextResponse.json(
        { error: "Forbidden. You cannot cancel an order belonging to another client." },
        { status: 403 }
      );
    }

    // State machine rule: CANCELLED is reachable ONLY from PENDING or CONFIRMED
    if (order.status !== "PENDING" && order.status !== "CONFIRMED") {
      return NextResponse.json(
        {
          error: `Cannot cancel an order in "${order.status}" stage. Only PENDING or CONFIRMED orders may be retracted.`,
        },
        { status: 400 }
      );
    }

    // Atomically restore inventory and update status
    await prisma.$transaction(async (tx) => {
      // 1. Restore inventory for all items
      for (const item of order.items) {
        await tx.inventory.update({
          where: { variantId: item.variantId },
          data: {
            quantity: { increment: item.qty },
          },
        });
      }

      // 2. Update order status to CANCELLED
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: "CANCELLED",
        },
      });

      // 3. Add to status history
      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          status: "CANCELLED",
          note: "Order cancelled by client. Stock restored atomically to vault.",
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Order successfully cancelled and inventory restored.",
    });
  } catch (error: any) {
    console.error("Order cancellation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to cancel order." },
      { status: 500 }
    );
  }
}
