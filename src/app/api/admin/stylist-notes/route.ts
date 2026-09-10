import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GEMINI_MODEL_NAME } from "@/lib/ai/config";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

/**
 * Generates one warm, editorial stylist sentence for a product.
 */
async function generateStylistNoteForProduct(product: {
  id: string;
  name: string;
  category?: { name: string } | null;
  fabric?: string | null;
  basePrice: any;
  description: string;
}): Promise<string> {
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: GEMINI_MODEL_NAME });
      const prompt = `Write exactly one warm, editorial, sophisticated styling sentence recommending this Indian luxury boutique piece to a discerning patron:
Product: ${product.name}
Category: ${product.category?.name || "Boutique Atelier"}
Fabric: ${product.fabric || "Pure silk"}
Price: ₹${Number(product.basePrice).toLocaleString("en-IN")}
Description: ${product.description}

Rules: Keep it strictly 1 concise sentence. Focus on drape, occasion, or heirloom feel. No cheesy exclamation marks.`;

      const result = await model.generateContent(prompt);
      const note = result.response.text().trim();
      if (note) return note;
    } catch (err) {
      console.warn("Gemini stylist note generation error, using editorial fallback:", err);
    }
  }

  // Editorial fallback based on piece characteristics
  return `An exceptional ${product.fabric || "handcrafted"} silhouette, best styled with muted gold accents and heirloom jewelry for celebratory evenings.`;
}

export async function POST(req: Request) {
  try {
    const { productId, batchAll } = await req.json();

    if (batchAll) {
      const products = await prisma.product.findMany({
        where: { active: true },
        include: { category: true },
      });

      const updated = [];
      for (const p of products) {
        const note = await generateStylistNoteForProduct(p);
        await prisma.product.update({
          where: { id: p.id },
          data: { stylistNote: note },
        });
        updated.push({ id: p.id, name: p.name, stylistNote: note });
      }

      return NextResponse.json({ success: true, count: updated.length, updated });
    }

    if (!productId) {
      return NextResponse.json({ error: "productId or batchAll required" }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { category: true },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const stylistNote = await generateStylistNoteForProduct(product);
    await prisma.product.update({
      where: { id: productId },
      data: { stylistNote },
    });

    return NextResponse.json({ success: true, productId, stylistNote });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
