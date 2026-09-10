import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Group unmet searches by query text, with count and latest date
    const rawSearches = await prisma.unmetSearchRequest.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    // Aggregate by query
    const queryMap = new Map<
      string,
      { query: string; count: number; lastSeen: Date; filtersUsed: any }
    >();
    for (const s of rawSearches) {
      const key = (s.query || "").toLowerCase().trim();
      if (!key) continue;
      if (queryMap.has(key)) {
        const entry = queryMap.get(key)!;
        entry.count++;
        if (new Date(s.createdAt) > entry.lastSeen) {
          entry.lastSeen = new Date(s.createdAt);
        }
      } else {
        queryMap.set(key, {
          query: s.query || "",
          count: 1,
          lastSeen: new Date(s.createdAt),
          filtersUsed: s.filtersUsed,
        });
      }
    }

    const unmetSearches = Array.from(queryMap.values()).sort(
      (a, b) => b.count - a.count
    );

    // Recent AI chat messages from users
    const chatMessages = await prisma.chatMessage.findMany({
      where: { role: "user" },
      select: {
        id: true,
        content: true,
        createdAt: true,
        productIds: true,
      },
      orderBy: { createdAt: "desc" },
      take: 30,
    });

    // Zero-stock variants
    const zeroStockVariants = await prisma.variant.findMany({
      where: {
        inventory: { quantity: 0 },
        active: true,
      },
      select: {
        id: true,
        sku: true,
        color: true,
        size: true,
        inventory: { select: { quantity: true } },
        product: { select: { name: true, id: true } },
      },
      orderBy: { sku: "asc" },
    });

    return NextResponse.json({
      unmetSearches,
      chatMessages,
      zeroStockVariants,
    });
  } catch (error) {
    console.error("Admin insights error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve insights." },
      { status: 500 }
    );
  }
}
