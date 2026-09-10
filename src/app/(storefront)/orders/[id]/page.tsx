import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { OrderTimelineClient } from "./OrderTimelineClient";

// Always render on-demand \u2014 order data is user-specific and must never be statically cached.
export const dynamic = "force-dynamic";

interface Props {
  params: {
    id: string;
  };
}

export default async function OrderPage({ params }: Props) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      items: true,
      statusHistory: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!order) {
    notFound();
  }

  // Serialize Decimals for Client Component
  const serializedOrder = {
    ...order,
    subtotal: Number(order.subtotal),
    discount: Number(order.discount),
    shipping: Number(order.shipping),
    total: Number(order.total),
    items: order.items.map((it) => ({
      ...it,
      unitPriceAtPurchase: Number(it.unitPriceAtPurchase),
      subtotal: Number(it.subtotal),
    })),
  };

  return <OrderTimelineClient order={serializedOrder} />;
}
