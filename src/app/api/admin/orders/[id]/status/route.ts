import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";
import { canTransition } from "@/lib/state-machine";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { nextStatus, note } = await req.json();
    const orderId = params.id;

    if (!nextStatus || !(nextStatus in OrderStatus)) {
      return NextResponse.json(
        { error: `Invalid status: "${nextStatus}".` },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    // Enforce state machine rules
    const isValidTransition = canTransition(
      order.status,
      nextStatus as OrderStatus
    );

    if (!isValidTransition) {
      return NextResponse.json(
        {
          error: `Illegal state transition from "${order.status}" to "${nextStatus}". Please follow the approved atelier progression.`,
        },
        { status: 400 }
      );
    }

    // Execute state transition atomically
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // If transitioning to CANCELLED, restore inventory
      if (nextStatus === "CANCELLED" && order.status !== "CANCELLED") {
        for (const it of order.items) {
          await tx.inventory.upsert({
            where: { variantId: it.variantId },
            update: {
              quantity: { increment: it.qty },
            },
            create: {
              variantId: it.variantId,
              quantity: it.qty,
            },
          });
        }
      }

      // Update order status
      const updated = await tx.order.update({
        where: { id: orderId },
        data: {
          status: nextStatus as OrderStatus,
        },
      });

      // Append to status history
      await tx.orderStatusHistory.create({
        data: {
          orderId,
          status: nextStatus as OrderStatus,
          note: note || `Status transitioned to ${nextStatus} by atelier master.`,
        },
      });

      return updated;
    });

    return NextResponse.json({
      success: true,
      order: updatedOrder,
    });
  } catch (error: any) {
    console.error("Admin order status transition error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update order status." },
      { status: 500 }
    );
  }
}
