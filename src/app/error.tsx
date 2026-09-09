"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RefreshCw, Home, AlertCircle } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Storefront error caught:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 text-center bg-ivory">
      <div className="w-16 h-16 rounded-full bg-oxblood/10 border border-oxblood/30 flex items-center justify-center mb-6">
        <AlertCircle className="w-8 h-8 text-oxblood" />
      </div>

      <p className="text-[10px] uppercase tracking-[0.35em] text-gold-dark font-semibold mb-2">
        The Atelier Experience
      </p>

      <h1 className="text-3xl md:text-4xl font-serif text-oxblood mb-4">
        Something Interrupted the Atelier
      </h1>

      <p className="text-sm text-noir/70 max-w-md mb-8 font-sans leading-relaxed">
        We encountered a momentary issue rendering this craft showcase. Please try refreshing or return to the main salon.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <Button
          onClick={() => reset()}
          variant="oxblood"
          className="gap-2 px-6 text-xs tracking-widest"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Retry Creation
        </Button>
        <Link href="/">
          <Button
            variant="outline"
            className="gap-2 px-6 text-xs tracking-widest border-gold/40 text-oxblood"
          >
            <Home className="w-3.5 h-3.5" /> Return to Salon
          </Button>
        </Link>
      </div>

      {process.env.NODE_ENV === "development" && error.message && (
        <pre className="mt-8 p-4 bg-noir/5 text-left text-xs font-mono text-oxblood/80 max-w-xl overflow-x-auto rounded border border-gold/20">
          {error.message}
        </pre>
      )}
    </div>
  );
}
