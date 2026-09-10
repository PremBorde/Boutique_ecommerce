import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import {
  searchProducts,
  getProductById,
  checkStock,
  getStoreInfo,
  getCraftStory,
  SearchProductsArgs,
} from "@/lib/ai/tools";
import { GEMINI_MODEL_NAME, GEMINI_FALLBACK_MODEL_NAME } from "@/lib/ai/config";
import prisma from "@/lib/prisma";
import { computeStylePersona, SessionSignal } from "@/lib/ai/personas";
import { matchPrebuiltIntent, executeSmartFallback } from "@/lib/ai/prebuilt-answers";

// Initialize Gemini SDK with server-only key
const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Lightweight in-memory rate limiter per IP/session to protect Gemini free-tier RPM
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 15; // 15 req/min ceiling for free tier

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }
  entry.count++;
  return true;
}

const SYSTEM_INSTRUCTION = `
You are the in-house style guide for Zaria Atelier, a luxury Indian womenswear atelier celebrating heritage craftsmanship and contemporary silhouettes.
Voice: warm, concise, editorial — never pushy or overly salesy. Exactly 1–3 sentences per reply unless the patron explicitly asks for an extensive breakdown.

HARD RULES — violating these is a critical failure:
- Never invent a product, price, color, size, SKU, or stock number. Only state facts returned by a tool function call.
- Zaria is exclusively an Indian luxury womenswear atelier. Only recommend women's pieces from our active catalogue categories: Lehengas & Couture, Heritage Sarees, Anarkalis & Ensembles, Festive Pret, and Contemporary Luxury. Never recommend menswear or unverified items.
- If the patron asks for wedding or festive recommendations ("I need something for a wedding"), call searchProducts to recommend appropriate women's pieces such as lehengas, sarees, or festive ensembles.
- If the patron asks for dinner, cocktail, or modern occasion wear without a saree or lehenga ("I want something elegant for dinner but not a saree or lehenga"), search for and recommend Contemporary Luxury pieces (such as column dresses, embroidered silk jackets, or tissue co-ords).
- For ANY question about a specific product's stock, price, or available colors/sizes, you MUST call the relevant function first — never answer from assumption, even if it seems obvious.
- If searchProducts returns zero results, say so plainly and suggest broadening or adjusting criteria. Do not invent alternatives.
- For store-policy questions (returns, shipping, cash on delivery/COD, craftsmanship), use getStoreInfo only — never guess a policy.
- For questions regarding the craft heritage, artisan weave, or backstory of a piece, call getCraftStory. If no craft story is recorded, state plainly that you don't have that detail yet rather than inventing historical claims.
- "Won't Oversell" Honesty Trait: When a user asks about a specific product's price, if a comparable in-stock alternative exists in the same category at a meaningfully lower price (roughly 20%+ cheaper), mention it briefly as an option — call searchProducts to check before mentioning it. Never invent this alternative; only mention one if the function call actually returns one. If no such alternative exists, don't force or fabricate one.
- When you recommend products, always end your turn with a function-free final answer and let the app layer attach the product IDs you referenced — do not describe products you did not just retrieve via a function call.
`;

const tools = [
  {
    functionDeclarations: [
      {
        name: "searchProducts",
        description:
          "Search the product catalogue by natural-language query keywords (e.g. silk, lehenga, zari), category name or slug, price range, color, size, or stock availability.",
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            query: { type: SchemaType.STRING },
            category: { type: SchemaType.STRING },
            maxPrice: { type: SchemaType.NUMBER },
            minPrice: { type: SchemaType.NUMBER },
            color: { type: SchemaType.STRING },
            size: { type: SchemaType.STRING },
            inStockOnly: { type: SchemaType.BOOLEAN },
          },
        },
      },
      {
        name: "getProductById",
        description: "Get full verified details for one specific product by its unique ID.",
        parameters: {
          type: SchemaType.OBJECT,
          properties: { id: { type: SchemaType.STRING } },
          required: ["id"],
        },
      },
      {
        name: "checkStock",
        description: "Check live stock quantity in the vault for a specific variantId or productId with color/size.",
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            variantId: { type: SchemaType.STRING },
            productId: { type: SchemaType.STRING },
            color: { type: SchemaType.STRING },
            size: { type: SchemaType.STRING },
          },
        },
      },
      {
        name: "getStoreInfo",
        description: "Get authentic store policy info: returns, shipping, cash on delivery (COD), or craftsmanship.",
        parameters: {
          type: SchemaType.OBJECT,
          properties: { topic: { type: SchemaType.STRING } },
          required: ["topic"],
        },
      },
      {
        name: "getCraftStory",
        description: "Get verified artisan heritage, fabric origin, and craft story for a specific piece.",
        parameters: {
          type: SchemaType.OBJECT,
          properties: { productId: { type: SchemaType.STRING } },
          required: ["productId"],
        },
      },
    ],
  },
];

export async function POST(req: Request) {
  let userText = "";
  try {
    const body = await req.json();
    const { messages, sessionId, sessionToken } = body;

    const clientIp = req.headers.get("x-forwarded-for") || "client_session";
    const throttleKey = sessionId || sessionToken || clientIp;

    // Rate limiting check
    if (!checkRateLimit(throttleKey)) {
      return Response.json(
        {
          message:
            "I'm taking a momentary breath as our atelier is experiencing high traffic. Please try your question again in just a moment.",
          products: [],
        },
        { status: 200 } // Friendly fallback status per requirements
      );
    }

    // Format incoming messages for Gemini
    // Expects messages format: [{ role: 'user' | 'model', parts: [{ text }] }] or standard conversation objects
    let geminiHistory: any[] = [];
    if (Array.isArray(messages) && messages.length > 0) {
      geminiHistory = messages.map((m: any) => {
        if (m.parts) return m;
        return {
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content || m.text || "" }],
        };
      });
    }

    // Extract last user message
    const lastMessage = geminiHistory.pop() || {
      role: "user",
      parts: [{ text: "Hello" }],
    };
    userText = lastMessage.parts?.[0]?.text || "";

    const touchedProductIds = new Set<string>();
    const sessionSignals: SessionSignal[] = [];

    // 1. SMART PRE-BUILT INTENT INTERCEPTION (Saves API quota, 0 cost, instant answers)
    const prebuilt = await matchPrebuiltIntent(userText, sessionSignals);
    if (prebuilt) {
      return Response.json({
        message: prebuilt.message,
        products: prebuilt.products,
        persona: prebuilt.persona || null,
      });
    }

    // 2. If Gemini API key is missing or unconfigured, execute smart local database discovery
    if (!genAI || !apiKey) {
      const fallback = await executeSmartFallback(userText);
      return Response.json({
        message: fallback.message,
        products: fallback.products,
        persona: null,
      });
    }

    // Instantiate Gemini model
    let model = genAI.getGenerativeModel({
      model: GEMINI_MODEL_NAME,
      systemInstruction: SYSTEM_INSTRUCTION,
      tools: tools as any,
    });

    const chat = model.startChat({ history: geminiHistory });
    let result = await chat.sendMessage(lastMessage.parts[0].text);

    let loopGuard = 0;

    // Deterministic Function-Calling Loop (capped at 5 iterations)
    while (loopGuard < 5) {
      const calls = result.response.functionCalls();
      if (!calls || calls.length === 0) break;

      const responses = await Promise.all(
        calls.map(async (call) => {
          let data: any = null;

          if (call.name === "searchProducts") {
            const args = call.args as SearchProductsArgs;
            data = await searchProducts(args);

            // Log session signal for style persona calculation (Section 8.2)
            sessionSignals.push({
              category: args.category,
              color: args.color,
              query: args.query,
              price: args.maxPrice,
            });

            // Section 8.5: Honest "No Match" Logging
            if (Array.isArray(data) && data.length === 0) {
              // Fire-and-forget logging to UnmetSearchRequest
              try {
                (prisma as any).unmetSearchRequest?.create({
                  data: {
                    query: args.query || args.category || "Empty filter search",
                    filtersUsed: args as any,
                    sessionId: sessionId || sessionToken || "anonymous",
                  },
                }).catch(() => {});
              } catch {
                // Non-blocking
              }
            }

            // Grounding bookkeeping: collect real product IDs surfaced
            if (Array.isArray(data)) {
              data.forEach((p: any) => {
                if (p?.id) touchedProductIds.add(p.id);
              });
            }
          } else if (call.name === "getProductById") {
            const p = await getProductById((call.args as any).id);
            data = p;
            if (p?.id) touchedProductIds.add(p.id);
          } else if (call.name === "checkStock") {
            data = await checkStock(call.args as any);
          } else if (call.name === "getStoreInfo") {
            data = getStoreInfo((call.args as any).topic);
          } else if (call.name === "getCraftStory") {
            data = await getCraftStory((call.args as any).productId);
          } else {
            data = { error: `Function ${call.name} is not recognized` };
          }

          return {
            functionResponse: {
              name: call.name,
              response: { result: data },
            },
          };
        })
      );

      result = await chat.sendMessage(responses);
      loopGuard++;
    }

    const finalText = result.response.text();
    const productIdsList = Array.from(touchedProductIds).slice(0, 6);

    // Compute Style Persona if signals accumulated
    const computedPersona = computeStylePersona(sessionSignals);

    return Response.json({
      message: finalText,
      products: productIdsList,
      persona: computedPersona ? {
        id: computedPersona.id,
        name: computedPersona.name,
        badge: computedPersona.badge,
        tagline: computedPersona.tagline,
      } : null,
    });
  } catch (error: any) {
    console.error("Gemini Chat API Error, invoking smart fallback:", error);

    try {
      const fallback = await executeSmartFallback(userText);
      return Response.json(
        {
          message: fallback.message,
          products: fallback.products,
          persona: null,
        },
        { status: 200 }
      );
    } catch {
      return Response.json(
        {
          message:
            "I am delighted to assist you with our handwoven silks, sizes, bespoke fittings, and store policies. Please ask about any garment or occasion.",
          products: [],
        },
        { status: 200 }
      );
    }
  }
}
