export interface FestivalConfig {
  name: string;
  start: string; // YYYY-MM-DD
  end: string;   // YYYY-MM-DD
  theme: string;
  chipLabel: string;
  suggestedPrompt: string;
}

/**
 * Hand-curated lunar/festive calendar configuration.
 * Hardcoded to ensure cultural accuracy without LLM hallucination.
 * Updated yearly for astronomical accuracy.
 */
export const FESTIVALS: FestivalConfig[] = [
  {
    name: "Navratri & Durga Puja",
    start: "2026-09-15",
    end: "2026-10-02",
    theme: "vibrant, raw silk, auspicious jewel tones, festive",
    chipLabel: "Navratri Nights ✨",
    suggestedPrompt: "Show me vibrant jewel-toned silks for Navratri and Durga Puja celebrations",
  },
  {
    name: "Karva Chauth",
    start: "2026-10-15",
    end: "2026-10-30",
    theme: "crimson, sindoori red, bridal zari, wine",
    chipLabel: "The Karva Chauth Edit 🌙",
    suggestedPrompt: "I'm looking for crimson or wine heirloom sarees with gold zari border",
  },
  {
    name: "Diwali Celebration",
    start: "2026-11-01",
    end: "2026-11-15",
    theme: "gold, brocade, celebratory, festive light",
    chipLabel: "The Diwali Edit 🪔",
    suggestedPrompt: "Curate celebratory gold and tissue outfits under ₹60,000 for Diwali soirées",
  },
  {
    name: "Winter Royal Wedding Season",
    start: "2026-11-16",
    end: "2027-02-28",
    theme: "bridal, heavy zari, katan silk, sherwani, velvet",
    chipLabel: "The Bridal & Couture Edit 👑",
    suggestedPrompt: "Recommend royal heirloom pieces for a winter palace wedding",
  },
];

/**
 * Determines if today or a given date falls within or within 10 days leading up to a festival window.
 * Plain date logic — zero AI hallucination.
 */
export function getActiveFestival(currentDate: Date = new Date()): FestivalConfig | null {
  const nowTime = currentDate.getTime();
  const TEN_DAYS_MS = 10 * 24 * 60 * 60 * 1000;

  for (const fest of FESTIVALS) {
    const startTime = new Date(fest.start + "T00:00:00").getTime();
    const endTime = new Date(fest.end + "T23:59:59").getTime();

    // Active if within window or within 10 days lead-up
    if (nowTime >= startTime - TEN_DAYS_MS && nowTime <= endTime) {
      return fest;
    }
  }

  // Fallback seasonal edit if outside specific festival windows
  return {
    name: "Atelier Autumn / Festive",
    start: "2026-09-01",
    end: "2026-10-31",
    theme: "heritage silk, zari, festive",
    chipLabel: "Festive Heirloom Edit ✨",
    suggestedPrompt: "Show me handwoven silk heirlooms under ₹45,000",
  };
}
