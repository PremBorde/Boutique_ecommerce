import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const requests = await (prisma as any).unmetSearchRequest.findMany({
      orderBy: { createdAt: "desc" },
      take: 30,
    });
    return NextResponse.json({ requests });
  } catch (error: any) {
    return NextResponse.json({ requests: [] });
  }
}
