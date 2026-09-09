import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(req: Request) {
  try {
    const { variantId, quantity } = await req.json();

    if (!variantId || quantity === undefined || quantity < 0) {
      return NextResponse.json(
        { error: "Valid variantId and non-negative quantity are required." },
        { status: 400 }
      );
    }

    const inventory = await prisma.inventory.upsert({
      where: { variantId },
      update: { quantity: Number(quantity) },
      create: { variantId, quantity: Number(quantity) },
    });

    return NextResponse.json({ success: true, inventory });
  } catch (error: any) {
    console.error("Admin inventory update error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update inventory." },
      { status: 500 }
    );
  }
}
