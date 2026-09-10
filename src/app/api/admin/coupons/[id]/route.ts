import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

export const dynamic = "force-dynamic";

const patchSchema = z.object({
  active: z.boolean().optional(),
  percentOff: z.number().int().min(1).max(100).optional(),
  minOrderValue: z.number().min(0).optional(),
  maxDiscount: z.number().positive().nullable().optional(),
  expiresAt: z.string().datetime().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const result = patchSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const data: any = { ...result.data };
    if (data.expiresAt) data.expiresAt = new Date(data.expiresAt);

    const coupon = await prisma.coupon.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json({ success: true, coupon });
  } catch (error: any) {
    console.error("Coupon patch error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update coupon." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.coupon.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Coupon delete error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete coupon." },
      { status: 500 }
    );
  }
}
