/**
 * Hand-curated complementary pairings for luxury Indian boutique wear.
 * Strictly configured mapping to guarantee high-fashion styling authenticity without AI hallucination.
 */
export const COMPLEMENTARY_CATEGORIES: Record<string, { complementarySlugs: string[]; stylingAdvice: string }> = {
  "heritage-sarees": {
    complementarySlugs: ["festive-pret", "anarkalis-ensembles"],
    stylingAdvice: "Pair with hand-embroidered blouses or contrasting tissue stoles to elevate the drape.",
  },
  "lehengas-couture": {
    complementarySlugs: ["heritage-sarees", "festive-pret"],
    stylingAdvice: "Complement with a gossamer organza veil or heirloom silk potli for celebratory soirées.",
  },
  "anarkalis-ensembles": {
    complementarySlugs: ["heritage-sarees", "festive-pret"],
    stylingAdvice: "Elevate with a handcrafted Banarasi dupatta or metallic mojris.",
  },
  "festive-pret": {
    complementarySlugs: ["heritage-sarees", "anarkalis-ensembles"],
    stylingAdvice: "Layer with subtle gold-accented overlays or heritage silk jackets.",
  },
  "regal-menswear": {
    complementarySlugs: ["festive-pret", "heritage-sarees"],
    stylingAdvice: "Style with a handspun raw silk pocket square or gold-plated buttons.",
  },
};

export function getComplementarySlugs(categorySlugOrName: string): string[] {
  const norm = categorySlugOrName.toLowerCase().replace(/[^a-z0-9]/g, "-");
  for (const [key, val] of Object.entries(COMPLEMENTARY_CATEGORIES)) {
    if (norm.includes(key) || key.includes(norm)) {
      return val.complementarySlugs;
    }
  }
  return ["festive-pret", "heritage-sarees"];
}
