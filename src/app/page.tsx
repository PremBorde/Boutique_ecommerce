import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-regal-texture px-6 text-center">
      <p className="text-xs uppercase tracking-[0.35em] text-gold-antique mb-4 font-semibold">
        The Atelier
      </p>
      <h1 className="text-5xl md:text-7xl font-serif text-oxblood mb-4">
        Zaria <span className="gold-foil-text font-display">Atelier</span>
      </h1>
      <p className="max-w-xl text-noir/70 text-sm md:text-base leading-relaxed mb-8">
        Threaded in Gold, Cut in Silk. Hand-embroidered heritage craft reimagined through an editorial lens.
      </p>
      <div className="flex gap-4">
        <Button variant="oxblood">Explore Collection</Button>
        <Button variant="outline">The Craft Story</Button>
      </div>
    </main>
  );
}
