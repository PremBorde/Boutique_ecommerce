import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [
      allOrders,
      lowStockVariants,
      chatMessages,
    ] = await Promise.all([
      prisma.order.findMany({
        select: { total: true, status: true, createdAt: true },
      }),
      prisma.variant.findMany({
        where: { inventory: { quantity: { lte: 2 } }, active: true },
        select: {
          id: true,
          sku: true,
          color: true,
          size: true,
          inventory: { select: { quantity: true } },
          product: { select: { name: true } },
        },
        take: 20,
      }),
      prisma.chatMessage.findMany({
        where: { role: "user" },
        select: { content: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
    ]);

    const activeOrders = allOrders.filter((o) => o.status !== "CANCELLED");

    const totalRevenue = activeOrders.reduce(
      (sum, o) => sum + Number(o.total),
      0
    );

    const totalOrders = allOrders.length;
    const pendingOrders = allOrders.filter((o) => o.status === "PENDING").length;
    const processingOrders = allOrders.filter(
      (o) => o.status === "PROCESSING"
    ).length;
    const shippedOrders = allOrders.filter((o) => o.status === "SHIPPED").length;
    const deliveredOrders = allOrders.filter(
      (o) => o.status === "DELIVERED"
    ).length;

    const avgOrderValue =
      activeOrders.length > 0 ? totalRevenue / activeOrders.length : 0;

    // Revenue this month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const revenueThisMonth = activeOrders
      .filter((o) => new Date(o.createdAt) >= startOfMonth)
      .reduce((sum, o) => sum + Number(o.total), 0);

    return NextResponse.json({
      totalRevenue,
      totalOrders,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      avgOrderValue,
      revenueThisMonth,
      lowStockCount: lowStockVariants.length,
      lowStockVariants,
      recentChatMessages: chatMessages,
    });
  } catch (error) {
    console.error("Admin metrics error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve metrics." },
      { status: 500 }
    );
  }
}
