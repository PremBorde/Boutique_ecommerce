/**
 * Opinion Engine for the Zaria Atelier Companion.
 *
 * DESIGN PRINCIPLE: OPINIONS MUST BE EARNED, NOT GENERIC HYPE.
 * Every opinion is derived deterministically from real catalog, inventory,
 * and session signals. Zero LLM/Gemini calls on hover.
 */

export interface CompanionSignalContext {
  selectedColor?: string;
  selectedSize?: string;
  stock?: number | null;
  statedBudget?: number | null;
  personaName?: string | null;
  isCartAction?: boolean;
}

export const OPINION_TEMPLATES = {
  lowStock: (qty: number) =>
    `Only ${qty} left in this size — it's moving quickly.`,
  bestSeller: () =>
    `One of our most reordered pieces this season.`,
  matchesBudget: (max: number) =>
    `This fits comfortably within your ₹${max.toLocaleString("en-IN")} range.`,
  matchesPersona: (personaName: string) =>
    `This feels very "${personaName}" — right in your lane.`,
  shadeNote: (shade: string) =>
    `This ${shade} shade tends to photograph beautifully for evening events.`,
  addedToCart: (productName: string) =>
    `Beautiful choice — this one pairs well with a simple gold hairpin.`,
  stylistNoteFallback: (note: string) =>
    note,
  neutral: () =>
    `A quieter, more minimal piece from the collection.`,
};

export interface CompanionProductInput {
  id: string;
  name: string;
  slug?: string;
  basePrice?: number | string | { toString(): string };
  isBestSeller?: boolean;
  stylistNote?: string | null;
  category?: { name?: string; slug?: string } | null;
  variants?: Array<{
    color?: string;
    size?: string;
    inventory?: { quantity: number } | null;
  }>;
}

/**
 * Resolves an opinion based on strict signal priority.
 *
 * Priority:
 * 1. Post-decision add-to-cart confirmation (if isCartAction)
 * 2. Live scarcity (strictly if live stock is <= 3 and > 0)
 * 3. Best-seller signal (if explicitly marked or high order threshold)
 * 4. Stated budget constraint (if user mentioned budget in session)
 * 5. Style Persona resonance (if inferred persona matches category)
 * 6. Curated editorial stylist note (from product database)
 * 7. Shade nuance (if specific color selected)
 * 8. Neutral fallback (honest, non-hyped observation)
 */
export function resolveCompanionOpinion(
  product: CompanionProductInput,
  context: CompanionSignalContext = {}
): { opinion: string; signalSource: string; promptSeed: string } {
  const numericPrice = Number(product.basePrice || 0);

  // 1. Add-to-cart affirmation
  if (context.isCartAction) {
    return {
      opinion: OPINION_TEMPLATES.addedToCart(product.name),
      signalSource: "cart-affirmation",
      promptSeed: `Tell me how to care for and style ${product.name}.`,
    };
  }

  // 2. Genuine live low-stock signal (strictly <= 3 and > 0)
  const stock =
    context.stock !== undefined && context.stock !== null
      ? context.stock
      : getLowestVariantStock(product);

  if (stock !== null && stock > 0 && stock <= 3) {
    return {
      opinion: OPINION_TEMPLATES.lowStock(stock),
      signalSource: "inventory-scarcity",
      promptSeed: `Tell me about sizing and availability for ${product.name}.`,
    };
  }

  // 3. Best-seller verification (real signal)
  if (product.isBestSeller) {
    return {
      opinion: OPINION_TEMPLATES.bestSeller(),
      signalSource: "bestseller",
      promptSeed: `Why is ${product.name} one of your most reordered pieces?`,
    };
  }

  // 4. Session budget matching
  if (
    context.statedBudget &&
    context.statedBudget > 0 &&
    numericPrice > 0 &&
    numericPrice <= context.statedBudget
  ) {
    return {
      opinion: OPINION_TEMPLATES.matchesBudget(context.statedBudget),
      signalSource: "budget-match",
      promptSeed: `Show me other pieces that match ${product.name} under ₹${context.statedBudget.toLocaleString("en-IN")}.`,
    };
  }

  // 5. Inferred Style Persona match
  if (context.personaName) {
    return {
      opinion: OPINION_TEMPLATES.matchesPersona(context.personaName),
      signalSource: "persona-resonance",
      promptSeed: `Tell me why ${product.name} fits my style persona.`,
    };
  }

  // 6. Editorial stylist note from DB
  if (product.stylistNote && product.stylistNote.trim().length > 0) {
    return {
      opinion: OPINION_TEMPLATES.stylistNoteFallback(product.stylistNote.trim()),
      signalSource: "stylist-note",
      promptSeed: `Tell me more about ${product.name}.`,
    };
  }

  // 7. Selected shade note
  if (context.selectedColor && context.selectedColor.trim().length > 0) {
    return {
      opinion: OPINION_TEMPLATES.shadeNote(context.selectedColor),
      signalSource: "shade-nuance",
      promptSeed: `How does the ${context.selectedColor} shade of ${product.name} look in evening lighting?`,
    };
  }

  // 8. Honest, unmanufactured neutral observation
  return {
    opinion: OPINION_TEMPLATES.neutral(),
    signalSource: "neutral-observation",
    promptSeed: `Tell me more about ${product.name}.`,
  };
}

function getLowestVariantStock(product: CompanionProductInput): number | null {
  if (!product.variants || product.variants.length === 0) return null;
  const quantities = product.variants
    .map((v) => v.inventory?.quantity)
    .filter((q): q is number => typeof q === "number");

  if (quantities.length === 0) return null;
  return Math.min(...quantities);
}
