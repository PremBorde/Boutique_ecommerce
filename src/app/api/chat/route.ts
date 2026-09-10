import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { runGeminiChatLoop } from "@/lib/gemini";
import { matchPrebuiltIntent, executeSmartFallback } from "@/lib/ai/prebuilt-answers";

export async function POST(req: Request) {
  try {
    const { message, sessionToken: incomingToken } = await req.json();

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        { error: "Message content cannot be empty." },
        { status: 400 }
      );
    }

    const sessionToken =
      incomingToken || `chat_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Upsert chat session
    const session = await prisma.chatSession.upsert({
      where: { sessionToken },
      create: { sessionToken },
      update: {},
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
          take: 10,
        },
      },
    });

    // Save user message to database
    await prisma.chatMessage.create({
      data: {
        sessionId: session.id,
        role: "user",
        content: message.trim(),
      },
    });

    // 1. SMART PREBUILT INTENT CHECK (0 Gemini API calls, 0 cost, instant response)
    const prebuilt = await matchPrebuiltIntent(message.trim());
    if (prebuilt) {
      let resolvedProducts: any[] = [];
      if (prebuilt.products && prebuilt.products.length > 0) {
        resolvedProducts = await prisma.product.findMany({
          where: {
            id: { in: prebuilt.products },
            active: true,
          },
          include: {
            category: true,
            images: { orderBy: { order: "asc" } },
            variants: {
              where: { active: true },
              include: { inventory: true },
            },
          },
        });
      }

      await prisma.chatMessage.create({
        data: {
          sessionId: session.id,
          role: "assistant",
          content: prebuilt.message,
          productIds: prebuilt.products as any,
        },
      });

      return NextResponse.json({
        message: prebuilt.message,
        products: resolvedProducts,
        sessionToken,
      });
    }

    // 2. Prepare message history for Gemini
    const history = [
      ...session.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      { role: "user", content: message.trim() },
    ];

    // Execute Gemini 2.0 Flash function calling loop
    let aiResult: any;
    try {
      aiResult = await runGeminiChatLoop(history);
    } catch {
      const fallback = await executeSmartFallback(message.trim());
      aiResult = {
        message: fallback.message,
        products: fallback.products,
      };
    }

    // Resolve product IDs to full Product entities for rendering real cards
    let resolvedProducts: any[] = [];
    if (aiResult.products && aiResult.products.length > 0) {
      resolvedProducts = await prisma.product.findMany({
        where: {
          id: { in: aiResult.products },
          active: true,
        },
        include: {
          category: true,
          images: { orderBy: { order: "asc" } },
          variants: {
            where: { active: true },
            include: { inventory: true },
          },
        },
      });
    }

    // Save assistant message to database
    await prisma.chatMessage.create({
      data: {
        sessionId: session.id,
        role: "assistant",
        content: aiResult.message,
        productIds: aiResult.products as any,
      },
    });

    return NextResponse.json({
      message: aiResult.message,
      products: resolvedProducts,
      sessionToken,
    });
  } catch (error: any) {
    console.error("Chat API route error:", error);
    return NextResponse.json(
      {
        message:
          "The atelier concierge is attending to another royal commission. Please try again shortly.",
        products: [],
      },
      { status: 500 }
    );
  }
}
