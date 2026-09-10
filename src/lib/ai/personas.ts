export interface StylePersona {
  id: string;
  name: string;
  tagline: string;
  description: string;
  badge: string;
  favoredCategories: string[];
  favoredColors: string[];
  minPriceTarget?: number;
  maxPriceTarget?: number;
  biasKeywords: string[];
}

export const STYLE_PERSONAS: StylePersona[] = [
  {
    id: "modern-maharani",
    name: "The Modern Maharani",
    tagline: "Regal silhouettes with heirloom zari and jewel tones.",
    description: "Drawn to majestic banarasi silks, crimson velvets, and opulent royal bridal craftsmanship.",
    badge: "👑 Modern Maharani",
    favoredCategories: ["Heritage Sarees", "Lehengas & Couture", "heritage-sarees", "lehengas-couture"],
    favoredColors: ["crimson", "wine", "gold", "maroon", "emerald", "ruby"],
    minPriceTarget: 50000,
    biasKeywords: ["zari", "katan", "banarasi", "bridal"],
  },
  {
    id: "minimalist-muse",
    name: "The Minimalist Muse",
    tagline: "Effortless, understated luxury in ivory and muted pastels.",
    description: "Prefers fluid organza, breathable chanderi silks, and clean monochromatic drape aesthetics.",
    badge: "✨ Minimalist Muse",
    favoredCategories: ["Anarkalis & Ensembles", "Festive Prêt", "anarkalis-ensembles", "festive-pret"],
    favoredColors: ["ivory", "pearl", "sage", "blush", "powder blue", "cream"],
    maxPriceTarget: 35000,
    biasKeywords: ["organza", "raw silk", "subtle", "pastel"],
  },
  {
    id: "soiree-connoisseur",
    name: "The Soirée Connoisseur",
    tagline: "Dramatic cocktail glam with contemporary gold and rose accents.",
    description: "Loves statement silhouettes that capture evening light with metallic tissue and cutwork embroidery.",
    badge: "🍸 Soirée Connoisseur",
    favoredCategories: ["Festive Prêt", "Heritage Sarees", "festive-pret", "heritage-sarees"],
    favoredColors: ["rose gold", "midnight blue", "black", "champagne", "emerald"],
    biasKeywords: ["metallic", "tissue", "evening", "cocktail"],
  },
  {
    id: "patron-of-heritage",
    name: "Patron of Heritage",
    tagline: "Deep appreciation for authentic weaver traditions and handspun weaves.",
    description: "Seeks genuine Shikargah motifs, Katan silk purity, and master artisan heirloom certificates.",
    badge: "🏛️ Patron of Heritage",
    favoredCategories: ["Heritage Sarees", "Regal Menswear", "heritage-sarees", "regal-menswear"],
    favoredColors: ["antique gold", "mustard", "deep emerald", "copper", "wine"],
    biasKeywords: ["shikargah", "artisan", "handwoven", "jaipur"],
  },
  {
    id: "regal-cavalier",
    name: "The Regal Cavalier",
    tagline: "Distinguished bespoke menswear with architectural tailoring.",
    description: "Appreciates hand-tailored Bandhgalas, raw silk bundi vests, and royal ivory sherwanis.",
    badge: "⚔️ Regal Cavalier",
    favoredCategories: ["Regal Menswear", "regal-menswear"],
    favoredColors: ["ivory", "onyx black", "navy", "royal gold"],
    biasKeywords: ["bandhgala", "sherwani", "kurta", "men"],
  },
];

export interface SessionSignal {
  category?: string;
  color?: string;
  query?: string;
  price?: number;
}

/**
 * Deterministic scoring function for Style Persona.
 * Calculates tag overlap with zero LLM calls.
 */
export function computeStylePersona(signals: SessionSignal[]): StylePersona | null {
  if (!signals || signals.length < 2) return null;

  const scores: Record<string, number> = {};
  STYLE_PERSONAS.forEach((p) => {
    scores[p.id] = 0;
  });

  signals.forEach((sig) => {
    const sigCategory = sig.category?.toLowerCase();
    const sigColor = sig.color?.toLowerCase();
    const sigQuery = sig.query?.toLowerCase();
    const sigPrice = sig.price;

    STYLE_PERSONAS.forEach((persona) => {
      // Category match (+3 points)
      if (
        sigCategory &&
        persona.favoredCategories.some((c) => sigCategory.includes(c.toLowerCase()))
      ) {
        scores[persona.id] += 3;
      }

      // Color match (+2 points)
      if (
        sigColor &&
        persona.favoredColors.some((c) => sigColor.includes(c.toLowerCase()) || c.toLowerCase().includes(sigColor))
      ) {
        scores[persona.id] += 2;
      }

      // Query keywords (+2 points)
      if (sigQuery) {
        persona.biasKeywords.forEach((kw) => {
          if (sigQuery.includes(kw)) scores[persona.id] += 2;
        });
      }

      // Price band compatibility (+1 point)
      if (sigPrice) {
        if (persona.minPriceTarget && sigPrice >= persona.minPriceTarget) {
          scores[persona.id] += 2;
        }
        if (persona.maxPriceTarget && sigPrice <= persona.maxPriceTarget) {
          scores[persona.id] += 1;
        }
      }
    });
  });

  let bestMatch: StylePersona = STYLE_PERSONAS[0];
  let maxScore = -1;

  for (const persona of STYLE_PERSONAS) {
    if (scores[persona.id] > maxScore) {
      maxScore = scores[persona.id];
      bestMatch = persona;
    }
  }

  return maxScore >= 3 ? bestMatch : null;
}
