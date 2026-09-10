import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      xs: "480px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    extend: {
      colors: {
        oxblood: {
          DEFAULT: "#4A0E17",
          light: "#661823",
          dark: "#30080E",
          deep: "#210408",
        },
        emerald: {
          DEFAULT: "#0B3B24",
          light: "#145636",
          dark: "#062215",
        },
        indigo: {
          DEFAULT: "#181528",
          deep: "#0D0A17",
        },
        gold: {
          DEFAULT: "#C9A050",
          light: "#DFC07B",
          dark: "#9E782F",
          antique: "#B38F3F",
          foil: "#E6CA85",
        },
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
        },
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Playfair Display", "serif"],
        display: ["var(--font-display)", "Cinzel", "serif"],
        sans: ["var(--font-sans)", "Plus Jakarta Sans", "sans-serif"],
      },
      animation: {
        "shimmer-foil": "foil 6s linear infinite",
        "fade-in": "fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "slide-up": "slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "pulse-subtle": "pulseSubtle 3s ease-in-out infinite",
      },
      keyframes: {
        foil: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseSubtle: {
          "0%, 100%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.04)", opacity: "0.9" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
