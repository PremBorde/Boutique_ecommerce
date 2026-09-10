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

  const isDark = mounted ? resolvedTheme === "dark" : false;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      disabled={!mounted}
      className={`relative w-8 h-8 rounded-full border border-gold/30 hover:border-gold/60 flex items-center justify-center text-noir/80 dark:text-gold-light hover:text-oxblood dark:hover:text-gold transition-colors duration-300 bg-ivory/50 dark:bg-noir-surface/60 backdrop-blur-xs ${className} ${!mounted ? "opacity-60 cursor-default" : ""}`}
      aria-label={mounted && isDark ? "Switch to Ivory Light Mode" : "Switch to Nocturne Dark Mode"}
      title={mounted && isDark ? "Switch to Ivory Mode" : "Switch to Nocturne Mode"}
    >
      {mounted && isDark ? (
        <Sun className="w-3.5 h-3.5 transition-transform duration-300 rotate-0 hover:rotate-45 text-gold-light" />
      ) : (
        <Moon className="w-3.5 h-3.5 transition-transform duration-300 -rotate-12 hover:rotate-0 text-oxblood/80 dark:text-gold-light" />
      )}
    </button>
  );
}
