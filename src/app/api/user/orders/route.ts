import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user || !(session.user as any).id) {
    return NextResponse.json(
      { error: "Unauthorized. Please log in to view your orders." },
      { status: 401 }
    );
  }

  const userId = (session.user as any).id;

  // Strict tenant security: user can ONLY fetch their own orders
  const orders = await prisma.order.findMany({
    where: { userId },
    include: {
      items: true,
      statusHistory: {
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ orders });
}
