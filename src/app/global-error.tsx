"use client";

import React from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-[#FAF7F2] text-[#141113] min-h-screen flex flex-col items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full text-center">
          <h1 className="text-3xl font-serif text-[#4A0E17] mb-3">
            Atelier Interruption
          </h1>
          <p className="text-sm text-[#141113]/70 mb-6">
            A system error occurred in the atelier layout.
          </p>
          <button
            onClick={() => reset()}
            className="px-6 py-2.5 bg-[#4A0E17] text-[#FAF7F2] text-xs uppercase tracking-widest font-semibold hover:bg-[#63131F] transition-colors"
          >
            Reload Atelier
          </button>
          {process.env.NODE_ENV === "development" && (
            <p className="mt-4 text-xs font-mono text-red-600">
              {error.message}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
