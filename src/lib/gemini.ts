import { GoogleGenerativeAI, FunctionDeclaration, SchemaType } from "@google/generative-ai";
import prisma from "./prisma";
import { getStorePolicy } from "./store-info";
import { GEMINI_MODEL_NAME } from "./ai/config";

// 1. Declare Gemini Function Tools
export const searchProductsDeclaration: FunctionDeclaration = {
  name: "searchProducts",
  description:
    "Search the active atelier catalogue by query keywords (fabric, garment type), category slug, price range, color, size, or stock availability. Returns real product IDs, names, prices, colors, and stock.",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      query: {
        type: SchemaType.STRING,
        description: "Keywords such as 'silk', 'lehenga', 'velvet', 'zari', 'saree', 'column dress', 'jacket'",
      },
      category: {
        type: SchemaType.STRING,
        description: "Category slug, e.g. 'lehengas-couture', 'heritage-sarees', 'anarkalis-ensembles', 'festive-pret', 'contemporary-luxury'",
      },
      maxPrice: {
        type: SchemaType.NUMBER,
        description: "Maximum budget in INR (e.g. 15000 or 25000)",
      },
      color: {
        type: SchemaType.STRING,
        description: "Color/shade name, e.g. 'Crimson Wine', 'Emerald Forest', 'Sand Ivory'",
      },
      size: {
        type: SchemaType.STRING,
        description: "Size code, e.g. 'XS', 'S', 'M', 'L', 'XL', 'Free Size'",
      },
      inStockOnly: {
        type: SchemaType.BOOLEAN,
        description: "Filter only pieces that currently have inventory > 0",
      },
    },
  },
};

export const getProductByIdDeclaration: FunctionDeclaration = {
  name: "getProductById",
  description:
    "Fetch complete verified details of a specific garment by its ID, including all variants, available sizes, colors, fabric composition, story, and live inventory.",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      id: {
        type: SchemaType.STRING,
        description: "The product unique ID",
      },
    },
    required: ["id"],
  },
};

export const checkStockDeclaration: FunctionDeclaration = {
  name: "checkStock",
  description:
    "Check live vault stock levels for a specific product and optional color and size combination.",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      productId: {
        type: SchemaType.STRING,
        description: "The product ID to check stock for",
      },
      color: {
        type: SchemaType.STRING,
        description: "Optional variant shade/color name",
      },
      size: {
        type: SchemaType.STRING,
        description: "Optional variant size",
      },
    },
    required: ["productId"],
  },
};

export const getStoreInfoDeclaration: FunctionDeclaration = {
  name: "getStoreInfo",
  description:
    "Retrieve authentic atelier store policies regarding express shipping, 7-day exchange window, COD policy, genuine zari embroidery, and bespoke fittings.",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      topic: {
        type: SchemaType.STRING,
        description: "Topic: 'shipping', 'returns', 'payment', 'craftsmanship', or 'custom_fit'",
      },
    },
    required: ["topic"],
  },
};

// 2. Real Server-Side Tool Executors against Prisma
export async function executeSearchProducts(args: any) {
  const { query, category, maxPrice, color, size, inStockOnly } = args || {};

  const where: any = { active: true };

  if (query && typeof query === "string" && query.trim()) {
    where.OR = [
      { name: { contains: query.trim(), mode: "insensitive" } },
      { description: { contains: query.trim(), mode: "insensitive" } },
      { fabric: { contains: query.trim(), mode: "insensitive" } },
    ];
  }

  if (category) {
    where.category = { slug: category };
  }

  if (maxPrice !== undefined) {
    where.basePrice = { lte: Number(maxPrice) };
  }

  const variantWhere: any = { active: true };
  if (color) variantWhere.color = { contains: color, mode: "insensitive" };
  if (size) variantWhere.size = { equals: size, mode: "insensitive" };
  if (inStockOnly) variantWhere.inventory = { quantity: { gt: 0 } };

  if (Object.keys(variantWhere).length > 1) {
    where.variants = { some: variantWhere };
  }

  const products = await prisma.product.findMany({
    where,
    take: 6,
    include: {
      category: true,
      variants: {
        where: { active: true },
        include: { inventory: true },
      },
    },
  });

  return products.map((p) => {
    const totalStock = p.variants.reduce((sum, v) => sum + (v.inventory?.quantity || 0), 0);
    const availableColors = Array.from(new Set(p.variants.map((v) => v.color)));
    const availableSizes = Array.from(new Set(p.variants.map((v) => v.size)));

    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      category: p.category.name,
      basePrice: Number(p.basePrice),
      fabric: p.fabric,
      availableColors,
      availableSizes,
      totalStock,
      inStock: totalStock > 0,
    };
  });
}

export async function executeGetProductById(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      variants: {
        include: { inventory: true },
      },
    },
  });

  if (!product) return { error: "Garment not found in atelier registry." };

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    story: product.story,
    fabric: product.fabric,
    basePrice: Number(product.basePrice),
    category: product.category.name,
    variants: product.variants.map((v) => ({
      id: v.id,
      color: v.color,
      size: v.size,
      sku: v.sku,
      stock: v.inventory?.quantity ?? 0,
    })),
  };
}

export async function executeCheckStock(productId: string, color?: string, size?: string) {
  const where: any = { productId, active: true };
  if (color) where.color = { equals: color, mode: "insensitive" };
  if (size) where.size = { equals: size, mode: "insensitive" };

  const variants = await prisma.variant.findMany({
    where,
    include: {
      product: true,
      inventory: true,
    },
  });

  if (variants.length === 0) {
    return {
      productId,
      inStock: false,
      message: "No matching color and size combination found for this piece.",
    };
  }

  const stockBreakdown = variants.map((v) => ({
    color: v.color,
    size: v.size,
    sku: v.sku,
    quantity: v.inventory?.quantity ?? 0,
  }));

  const total = stockBreakdown.reduce((sum, item) => sum + item.quantity, 0);

  return {
    productId,
    productName: variants[0]?.product.name,
    inStock: total > 0,
    totalAvailable: total,
    variants: stockBreakdown,
  };
}

export function executeGetStoreInfo(topic: string) {
  return {
    topic,
    policy: getStorePolicy(topic),
  };
}

// 3. Central Tool Execution Dispatcher
export async function dispatchToolCall(name: string, args: any) {
  switch (name) {
    case "searchProducts":
      return await executeSearchProducts(args);
    case "getProductById":
      return await executeGetProductById(args?.id);
    case "checkStock":
      return await executeCheckStock(args?.productId, args?.color, args?.size);
    case "getStoreInfo":
      return executeGetStoreInfo(args?.topic || "general");
    default:
      return { error: `Tool "${name}" not recognized.` };
  }
}

// 4. System Instruction for Gemini 2.0 Flash
export const STYLIST_SYSTEM_INSTRUCTION = `
You are the Head Stylist and Concierge at "Zaria Atelier", an ultra-luxury Indian couture house celebrating master artisan clusters all over India.
Your tone is warm, poetic, confident, and refined (like an editorial fashion magazine editor and personal royal stylist).

CRITICAL RULES:
1. NEVER INVENT or hallucinate products, prices, SKUs, colors, sizes, or stock numbers. You MUST ALWAYS rely on facts returned by tools.
2. If you recommend garments, you MUST call 'searchProducts' or 'getProductById' first. Then include the exact product IDs in your structured response.
3. If searchProducts returns zero results, politely acknowledge this and suggest a broader search (e.g. exploring other silk weaves or colors). Do NOT fabricate options.
4. For stock, price, or availability questions, always call 'getProductById' or 'checkStock'.
5. For store policy questions (shipping, returns, COD, fabrics), answer strictly from 'getStoreInfo'.
6. You MUST always output your final response as a JSON object matching this schema:
   {
     "message": "Stylist reply text...",
     "products": ["productId1", "productId2"]
   }
   If no specific products are recommended or it's a general policy question, set "products" to [].
`.trim();

// 5. Main AI Shopping Assistant Orchestrator Loop
export async function runGeminiChatLoop(
  messages: Array<{ role: string; content: string }>
): Promise<{ message: string; products: string[] }> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  // If no Gemini API key is configured yet, use our high-accuracy heuristic fallback
  // that executes the exact same Prisma queries and returns the exact contract shape!
  if (!apiKey || apiKey === "your-gemini-api-key-here") {
    return runFallbackHeuristicStylist(messages);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL_NAME,
      systemInstruction: STYLIST_SYSTEM_INSTRUCTION,
      tools: [
        {
          functionDeclarations: [
            searchProductsDeclaration,
            getProductByIdDeclaration,
            checkStockDeclaration,
            getStoreInfoDeclaration,
          ],
        },
      ],
      generationConfig: {
        temperature: 0.3,
      },
    });

    const chat = model.startChat({
      history: messages.slice(0, -1).map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
    });

    const latestUserMessage = messages[messages.length - 1]?.content || "Hello";
    let response = await chat.sendMessage(latestUserMessage);

    // Tool execution loop (capped at max 5 iterations)
    let loopCount = 0;
    while (response.response.functionCalls()?.length && loopCount < 5) {
      loopCount++;
      const functionCalls = response.response.functionCalls()!;
      const functionResponses = [];

      for (const call of functionCalls) {
        const result = await dispatchToolCall(call.name, call.args);
        functionResponses.push({
          functionResponse: {
            name: call.name,
            response: { result },
          },
        });
      }

      response = await chat.sendMessage(functionResponses);
    }

    const rawText = response.response.text();

    // Parse structured response
    try {
      const cleaned = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      return {
        message: parsed.message || rawText,
        products: Array.isArray(parsed.products) ? parsed.products : [],
      };
    } catch {
      // If model returned plain text, extract any mentions or fallback
      return {
        message: rawText,
        products: [],
      };
    }
  } catch (error: any) {
    console.warn("Gemini API call encountered an issue, invoking fallback stylist:", error?.message);
    return runFallbackHeuristicStylist(messages);
  }
}

// Graceful fallback stylist that executes real Prisma queries when offline or rate limited
async function runFallbackHeuristicStylist(
  messages: Array<{ role: string; content: string }>
): Promise<{ message: string; products: string[] }> {
  const lastMsg = (messages[messages.length - 1]?.content || "").toLowerCase();

  if (lastMsg.includes("ship") || lastMsg.includes("return") || lastMsg.includes("policy") || lastMsg.includes("cod")) {
    const policy = getStorePolicy(lastMsg);
    return {
      message: policy,
      products: [],
    };
  }

  let query = "";
  let category: string | undefined = undefined;
  let maxPrice: number | undefined = undefined;

  if (lastMsg.includes("lehenga")) category = "lehengas-couture";
  else if (lastMsg.includes("saree")) category = "heritage-sarees";
  else if (lastMsg.includes("anarkali")) category = "anarkalis-ensembles";
  else if (lastMsg.includes("pret") || lastMsg.includes("kurta")) category = "festive-pret";
  else if (lastMsg.includes("contemporary") || lastMsg.includes("dress") || lastMsg.includes("jacket") || lastMsg.includes("coord") || lastMsg.includes("modern") || lastMsg.includes("western")) category = "contemporary-luxury";

  if (lastMsg.includes("under 15000") || lastMsg.includes("under 15,000") || lastMsg.includes("under ₹15,000")) {
    maxPrice = 15000;
  } else if (lastMsg.includes("under 10000") || lastMsg.includes("under 10,000")) {
    maxPrice = 10000;
  } else if (lastMsg.includes("under 5000") || lastMsg.includes("under 5,000")) {
    maxPrice = 5000;
  }

  if (lastMsg.includes("crimson") || lastMsg.includes("wine")) query = "velvet";
  else if (lastMsg.includes("wedding") || lastMsg.includes("bridal") || lastMsg.includes("festive")) query = "silk";

  const results = await executeSearchProducts({
    query,
    category,
    maxPrice,
    inStockOnly: true,
  });

  const productIds = results.slice(0, 3).map((p) => p.id);

  if (productIds.length > 0) {
    return {
      message: `I have curated these exquisite heirloom creations from our vault, handcrafted in limited batches:`,
      products: productIds,
    };
  }

  return {
    message:
      "Welcome to Zaria Atelier. I am your personal stylist. You may ask me for festive styling recommendations, fabric provenance, stock availability, or store policies.",
    products: [],
  };
}
