import { searchProducts, STORE_INFO } from "./tools";
import { computeStylePersona, SessionSignal } from "./personas";

export interface PrebuiltAnswerResult {
  matched: boolean;
  message: string;
  products: string[];
  persona?: any;
}

/**
 * High-performance smart pre-built intent engine.
 * Intercepts common patron queries, policy questions, and chip clicks
 * to return instant, zero-cost, grounded answers with real Prisma data.
 */
export async function matchPrebuiltIntent(
  userText: string,
  sessionSignals: SessionSignal[] = []
): Promise<PrebuiltAnswerResult | null> {
  const query = userText.toLowerCase().trim();

  // 1. POLICY INTENTS (Instant, 0 cost, 0 API calls)
  if (
    query.includes("return") ||
    query.includes("exchange") ||
    query.includes("refund") ||
    query.includes("policy")
  ) {
    return {
      matched: true,
      message: STORE_INFO.returns,
      products: [],
    };
  }

  if (
    query.includes("cod") ||
    query.includes("cash on delivery") ||
    query.includes("cash payment")
  ) {
    return {
      matched: true,
      message: STORE_INFO.cod,
      products: [],
    };
  }

  if (
    query.includes("ship") ||
    query.includes("delivery") ||
    query.includes("dispatch") ||
    query.includes("courier") ||
    query.includes("how long to deliver")
  ) {
    return {
      matched: true,
      message: STORE_INFO.shipping,
      products: [],
    };
  }

  if (
    query.includes("authentic") ||
    query.includes("hallmark") ||
    query.includes("real silk") ||
    query.includes("pure zari") ||
    query.includes("artisan")
  ) {
    return {
      matched: true,
      message: STORE_INFO.craftsmanship,
      products: [],
    };
  }

  if (
    query.includes("bespoke") ||
    query.includes("custom fit") ||
    query.includes("tailoring") ||
    query.includes("alteration") ||
    query.includes("measurements")
  ) {
    return {
      matched: true,
      message:
        "We offer complimentary bespoke tailoring consultations for all couture commissions. You may schedule a virtual fitting with our master cutting artisan or request a private concierge consultation anywhere all over India.",
      products: [],
    };
  }

  // 2. FESTIVAL & NAVRATRI CHIP INTENTS
  if (
    query.includes("navratri") ||
    query.includes("durga puja") ||
    query.includes("jewel-toned") ||
    query.includes("festive nights")
  ) {
    const products = await searchProducts({
      query: "silk",
      inStockOnly: true,
    });
    const ids = products.slice(0, 4).map((p) => p.id);

    return {
      matched: true,
      message:
        "For Navratri and Durga Puja, we curate vibrant jewel-toned Katan silks and raw silk silhouettes adorned with hand-embellished zari that flow effortlessly from prayer rituals to evening Garba.",
      products: ids,
    };
  }

  if (query.includes("diwali") || query.includes("deepavali")) {
    const products = await searchProducts({
      query: "tissue",
      inStockOnly: true,
    });
    const ids = products.slice(0, 4).map((p) => p.id);

    return {
      matched: true,
      message:
        "Our Diwali Edit highlights radiant gold tissue Banarasi drapes, antique brocades, and luminous silk kurtas hand-embroidered with micro-sequin illumination.",
      products: ids,
    };
  }

  if (query.includes("karva chauth") || query.includes("sindoor")) {
    const products = await searchProducts({
      color: "crimson",
      inStockOnly: true,
    });
    const ids = products.slice(0, 4).map((p) => p.id);

    return {
      matched: true,
      message:
        "For Karva Chauth, our atelier presents heritage crimson and wine bridal Katan silks, woven with auspicious floral jaal and hallmarked gold zari borders.",
      products: ids,
    };
  }

  // 3. BUDGET / PRICE BAND INTENTS (e.g. "under 45000", "under ₹50,000")
  const priceMatch = query.match(/(?:under|below|less than)\s*(?:₹|rs\.?|inr)?\s*([0-9,]+)/i);
  if (priceMatch && priceMatch[1]) {
    const extractedMaxPrice = parseInt(priceMatch[1].replace(/,/g, ""), 10);
    if (!isNaN(extractedMaxPrice) && extractedMaxPrice > 0) {
      const products = await searchProducts({
        maxPrice: extractedMaxPrice,
        inStockOnly: true,
      });
      const ids = products.slice(0, 4).map((p) => p.id);

      if (ids.length > 0) {
        return {
          matched: true,
          message: `Here are our finest handcrafted atelier creations comfortably within ₹${extractedMaxPrice.toLocaleString(
            "en-IN"
          )}, tailored in certified mulberry and chanderi silks.`,
          products: ids,
        };
      }
    }
  }

  // 4. PASTEL & ORGANZA INTENTS
  if (query.includes("pastel") || query.includes("organza") || query.includes("ivory") || query.includes("blush")) {
    const products = await searchProducts({
      query: "organza",
      inStockOnly: true,
    });
    const ids = products.slice(0, 4).map((p) => p.id);

    return {
      matched: true,
      message:
        "Our pastel edit features whisper-light organza and chanderi silks in ivory, powder blue, and soft blush, finished with delicate pearl and gota-patti embroidery.",
      products: ids.length > 0 ? ids : (await searchProducts({ query: "silk", inStockOnly: true })).slice(0, 4).map(p => p.id),
    };
  }

  // 5. WEDDING & BRIDAL INTENTS
  if (query.includes("bridal") || query.includes("wedding") || query.includes("groom") || query.includes("reception")) {
    const products = await searchProducts({
      category: "lehengas-couture",
      inStockOnly: true,
    });
    const ids = products.slice(0, 4).map((p) => p.id);

    return {
      matched: true,
      message:
        "For wedding celebrations, we recommend our regal imperial lehengas and hand-tailored silk sherwanis, woven over 200+ artisan hours by master clusters all over India.",
      products: ids,
    };
  }

  // 6. STYLE PERSONA INTENT ("What's my style?", "What is my style persona?")
  if (query.includes("my style") || query.includes("persona") || query.includes("style twin")) {
    const persona = computeStylePersona(sessionSignals);
    if (persona) {
      return {
        matched: true,
        message: `Based on your atelier taste, your style twin is **${persona.name}** (${persona.badge}). ${persona.description}`,
        products: [],
        persona: {
          id: persona.id,
          name: persona.name,
          badge: persona.badge,
          tagline: persona.tagline,
        },
      };
    } else {
      return {
        matched: true,
        message:
          "Browse a few silk silhouettes or tell me your favorite shades and occasions, and I will unveil your curated Zaria Style Persona.",
        products: [],
      };
    }
  }

  // No specific prebuilt rule matched
  return null;
}

/**
 * Intelligent Smart Fallback
 * When Gemini API is unavailable, unconfigured, or quota exhausted,
 * this function parses natural language keywords to search real database products
 * and returns an editorial concierge reply instead of an error message.
 */
export async function executeSmartFallback(userText: string): Promise<PrebuiltAnswerResult> {
  const query = userText.toLowerCase().trim();

  // Extract keywords
  let category: string | undefined = undefined;
  if (query.includes("saree") || query.includes("drape")) category = "heritage-sarees";
  else if (query.includes("lehenga") || query.includes("couture")) category = "lehengas-couture";
  else if (query.includes("anarkali") || query.includes("ensemble")) category = "anarkalis-ensembles";
  else if (query.includes("kurta") || query.includes("pret") || query.includes("sharara")) category = "festive-pret";
  else if (query.includes("men") || query.includes("sherwani") || query.includes("bandhgala")) category = "regal-menswear";

  // Search real Prisma database
  const products = await searchProducts({
    query: category ? undefined : query,
    category,
    inStockOnly: true,
  });

  const ids = products.slice(0, 4).map((p) => p.id);

  if (ids.length > 0) {
    const categoryName = products[0].category || "Atelier";
    return {
      matched: true,
      message: `I have curated these verified ${categoryName} pieces from our active vault that beautifully match your inquiry.`,
      products: ids,
    };
  }

  // If still zero, broaden to featured in-stock silks
  const fallbackProducts = await searchProducts({ inStockOnly: true });
  return {
    matched: true,
    message:
      "I couldn't find an exact match for those specific criteria, but here are our signature in-stock silk heirlooms currently available in our atelier vault.",
    products: fallbackProducts.slice(0, 4).map((p) => p.id),
  };
}
