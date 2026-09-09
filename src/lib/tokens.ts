/**
 * Zaria Atelier — Design Tokens & Creative Direction
 * "Threaded in Gold, Cut in Silk"
 * 
 * Defines the core design system tokens for luxury Indian couture:
 * - Jewel tones (Oxblood, Emerald, Velvet Indigo)
 * - Warm antique metallic accents (Gold foil, Antique brass)
 * - Editorial serif & humanist typography
 * - Tactile motion durations & luxury easings
 */

export const tokens = {
  brand: {
    name: "Zaria Atelier",
    tagline: "Threaded in Gold, Cut in Silk",
    founded: "2026",
    origin: "Jaipur & Varanasi",
    currency: "INR",
    currencySymbol: "₹",
  },
  colors: {
    // Primary Jewel Tones
    oxblood: {
      deep: "#210408",
      dark: "#30080E",
      DEFAULT: "#4A0E17",
      light: "#661823",
      glow: "rgba(74, 14, 23, 0.4)",
    },
    emerald: {
      dark: "#062215",
      DEFAULT: "#0B3B24",
      light: "#145636",
      glow: "rgba(11, 59, 36, 0.4)",
    },
    indigo: {
      deep: "#0D0A17",
      DEFAULT: "#181528",
      light: "#26223D",
    },
    // Metallics & Accents
    gold: {
      antique: "#B38F3F",
      DEFAULT: "#C9A050",
      light: "#DFC07B",
      foil: "#E6CA85",
      glow: "rgba(201, 160, 80, 0.35)",
    },
    // Neutrals & Surfaces
    ivory: {
      DEFAULT: "#FAF7F2",
      warm: "#F4EFE6",
      muted: "#E7DFD1",
      border: "#DCD2C1",
    },
    noir: {
      DEFAULT: "#141113",
      charcoal: "#1F1A1E",
      surface: "#1A1619",
      subtle: "#2A2429",
    },
  },
  typography: {
    serif: "'Playfair Display', Georgia, serif",
    display: "'Cinzel', 'Playfair Display', serif",
    sans: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  motion: {
    durations: {
      fast: 0.2,
      normal: 0.45,
      slow: 0.85,
      ritual: 1.6,
    },
    easings: {
      luxury: [0.16, 1, 0.3, 1] as const, // standard editorial ease
      entrance: [0.22, 1, 0.36, 1] as const,
      smooth: [0.4, 0, 0.2, 1] as const,
    },
  },
  radii: {
    none: "0px",
    xs: "2px",
    sm: "4px",
    md: "8px",
    lg: "16px",
    full: "9999px",
  },
  shadows: {
    subtle: "0 2px 10px rgba(0, 0, 0, 0.08)",
    card: "0 10px 30px -10px rgba(20, 17, 19, 0.15)",
    cardHover: "0 20px 40px -15px rgba(74, 14, 23, 0.22)",
    goldGlow: "0 0 25px rgba(201, 160, 80, 0.25)",
    modal: "0 25px 50px -12px rgba(13, 10, 23, 0.45)",
  },
} as const;

export type DesignTokens = typeof tokens;
