import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        items: {
          include: { variant: { include: { product: true } } },
        },
        statusHistory: { orderBy: { createdAt: "asc" } },
        user: { select: { name: true, email: true } },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Admin single order error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve order." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { notes } = body;

    const order = await prisma.order.update({
      where: { id: params.id },
      data: { notes: notes ?? undefined },
    });

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    console.error("Order patch error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update order." },
      { status: 500 }
    );
  }
}
