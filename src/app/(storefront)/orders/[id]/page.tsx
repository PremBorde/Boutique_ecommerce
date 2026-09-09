import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { OrderTimelineClient } from "./OrderTimelineClient";

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
