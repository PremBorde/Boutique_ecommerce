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

  const userId = (session.user as any)?.id;
  const userEmail = session.user.email?.toLowerCase().trim();

  // Strict tenant security: user can fetch orders tied to their userId or account email
  const whereConditions: any[] = [];
  if (userId) whereConditions.push({ userId });
  if (userEmail) whereConditions.push({ email: userEmail });

  if (whereConditions.length === 0) {
    return NextResponse.json({ orders: [] });
  }

  const orders = await prisma.order.findMany({
    where: {
      OR: whereConditions,
    },
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
