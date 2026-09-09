import type { Metadata, Viewport } from "next";
import { Playfair_Display, Cinzel, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Zaria Atelier | Indian Luxury Pret & Couture",
  description:
    "Hand-embroidered heritage craft, small-batch silk cuts, and timeless Indian silhouettes reimagined through an editorial luxury lens.",
  keywords: [
    "Indian couture",
    "Luxury Pret",
    "Handcrafted Lehengas",
    "Zari embroidery",
    "Raw Silk Sarees",
    "Zaria Atelier",
  ],
};

export const viewport: Viewport = {
  themeColor: "#4A0E17",
};

import { Providers } from "./providers";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { Navbar } from "@/components/storefront/Navbar";
import { Footer } from "@/components/storefront/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { AiChatWidget } from "@/components/chat/AiChatWidget";
import { SmoothScrollProvider } from "@/components/animations/SmoothScrollProvider";
import { CustomCursor } from "@/components/animations/CustomCursor";

const themeInitScript = `
(function() {
  try {
    var key = 'zaria-theme-mode';
    var theme = localStorage.getItem(key);
    var isDark = theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${playfair.variable} ${cinzel.variable} ${jakarta.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="bg-ivory dark:bg-[#0C0A0B] text-noir dark:text-ivory transition-colors duration-300 antialiased selection:bg-oxblood selection:text-gold-light flex flex-col min-h-screen">
        <ThemeProvider>
          <Providers>
            <SmoothScrollProvider>
              <CustomCursor />
              <Navbar />
              <CartDrawer />
              <AiChatWidget />
              <div className="flex-1">{children}</div>
              <Footer />
            </SmoothScrollProvider>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
