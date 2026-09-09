import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { active, basePrice, description } = await req.json();
    const data: any = {};
    if (typeof active === "boolean") data.active = active;
    if (basePrice !== undefined) data.basePrice = Number(basePrice);
    if (description) data.description = description;

    const product = await prisma.product.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update product." },
      { status: 500 }
    );
  }
}
