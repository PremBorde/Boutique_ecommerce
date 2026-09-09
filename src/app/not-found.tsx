import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 text-center bg-ivory">
      <p className="text-xs uppercase tracking-[0.4em] text-gold-dark font-semibold mb-3">
        404 · Vault Archival Notice
      </p>
      <h1 className="text-4xl md:text-5xl font-serif text-oxblood mb-4">
        Creations Not Found
      </h1>
      <p className="text-sm text-noir/70 max-w-md mb-8 font-sans">
        The heirloom silhouette you are searching for is currently not in our catalog or has been moved to our private archives.
      </p>
      <Link href="/shop">
        <Button variant="oxblood" className="gap-2 px-6 text-xs tracking-widest">
          <ArrowLeft className="w-3.5 h-3.5" /> Return to Creations
        </Button>
      </Link>
    </div>
  );
}
