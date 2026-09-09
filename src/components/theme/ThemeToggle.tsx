"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "./ThemeProvider";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { resolvedTheme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={`w-8 h-8 rounded-full border border-gold/20 flex items-center justify-center opacity-40 ${className}`}
        aria-hidden="true"
      />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative w-8 h-8 rounded-full border border-gold/30 hover:border-gold/60 flex items-center justify-center text-noir/80 dark:text-gold-light hover:text-oxblood dark:hover:text-gold transition-colors duration-300 bg-ivory/50 dark:bg-noir-surface/60 backdrop-blur-xs ${className}`}
      aria-label={isDark ? "Switch to Ivory Light Mode" : "Switch to Nocturne Dark Mode"}
      title={isDark ? "Switch to Ivory Mode" : "Switch to Nocturne Mode"}
    >
      {isDark ? (
        <Sun className="w-3.5 h-3.5 transition-transform duration-300 rotate-0 hover:rotate-45 text-gold-light" />
      ) : (
        <Moon className="w-3.5 h-3.5 transition-transform duration-300 -rotate-12 hover:rotate-0 text-oxblood/80" />
      )}
    </button>
  );
}
