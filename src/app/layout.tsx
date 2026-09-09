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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${cinzel.variable} ${jakarta.variable}`}
    >
      <body className="bg-ivory text-noir antialiased selection:bg-oxblood selection:text-gold-light">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
