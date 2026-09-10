"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, VolumeX, Volume2 } from "lucide-react";
import { useCompanionStore } from "@/lib/companion/store";

interface CompanionAvatarProps {
  onOpenChat: (prefillPrompt?: string) => void;
}

export function CompanionAvatar({ onOpenChat }: CompanionAvatarProps) {
  const {
    activeOpinion,
    isBubbleVisible,
    promptSeed,
    isDisabled,
    dismissBubble,
    toggleDisabled,
  } = useCompanionStore();

  // Name label introduction on initial page load, collapses after 4.5 seconds
  const [showIntroLabel, setShowIntroLabel] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    // Check reduced motion preference
    if (typeof window !== "undefined") {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      setReducedMotion(mq.matches);
      const listener = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
      mq.addEventListener("change", listener);
      return () => mq.removeEventListener("change", listener);
    }
  }, []);

  useEffect(() => {
    // Collapse name label after brief introductory greeting
    const timer = setTimeout(() => {
      setShowIntroLabel(false);
    }, 4500);
    return () => clearTimeout(timer);
  }, []);

  const handleClick = () => {
    onOpenChat(promptSeed || undefined);
    dismissBubble();
  };

  return (
    <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end pointer-events-none select-none">
      {/* ── 1. Anchored Speech Bubble (Expanded from Avatar with Tail) ── */}
      <AnimatePresence>
        {isBubbleVisible && activeOpinion && !isDisabled && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-auto relative mb-3 max-w-[290px] sm:max-w-[320px] bg-[#FAF7F2] dark:bg-[#1C1619] border border-[#C9A050]/55 p-3.5 rounded-xl shadow-[0_12px_32px_rgba(74,14,23,0.18)] dark:shadow-[0_12px_32px_rgba(0,0,0,0.5)] cursor-pointer group"
            onClick={handleClick}
          >
            {/* Top Row: Brand Flavour + Dismiss Control */}
            <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-[#C9A050]/20 mb-1.5">
              <div className="flex items-center gap-1.5 text-[9.5px] uppercase tracking-[0.2em] font-semibold text-oxblood dark:text-gold-foil">
                <Sparkles className="w-3 h-3 text-[#C9A050]" />
                <span>Atelier Note</span>
              </div>

              <div className="flex items-center gap-1">
                {/* Setting toggle to disable ambient opinions */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleDisabled();
                  }}
                  title={isDisabled ? "Enable companion notes" : "Mute companion notes"}
                  className="w-5 h-5 flex items-center justify-center text-noir/40 hover:text-noir dark:text-ivory/40 dark:hover:text-ivory rounded transition-colors"
                  aria-label="Mute ambient notes"
                >
                  <VolumeX className="w-3 h-3" />
                </button>

                {/* Dismiss Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    dismissBubble();
                  }}
                  title="Dismiss note"
                  className="w-5 h-5 flex items-center justify-center text-noir/40 hover:text-oxblood dark:text-ivory/40 dark:hover:text-gold rounded transition-colors"
                  aria-label="Dismiss note"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Opinion Body */}
            <p className="font-serif text-[12px] sm:text-[12.5px] text-noir/90 dark:text-ivory/90 leading-relaxed italic">
              &ldquo;{activeOpinion}&rdquo;
            </p>

            {/* Action Prompt Cue */}
            <div className="mt-2 pt-1.5 flex items-center justify-between text-[9.5px] uppercase tracking-wider font-semibold text-gold-dark dark:text-gold-light group-hover:text-oxblood dark:group-hover:text-gold transition-colors">
              <span>Ask Atelier Concierge</span>
              <span className="group-hover:translate-x-0.5 transition-transform">→</span>
            </div>

            {/* CSS Speech Bubble Tail pointing downward to Avatar */}
            <div className="absolute -bottom-2 right-6 w-3.5 h-3.5 bg-[#FAF7F2] dark:bg-[#1C1619] border-r border-b border-[#C9A050]/55 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 2. Introductory Name Label (Shown once, then auto-collapses) ── */}
      <AnimatePresence>
        {showIntroLabel && !isBubbleVisible && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="pointer-events-auto mb-2 px-3 py-1 bg-[#FAF7F2]/95 dark:bg-[#1A1518]/95 border border-[#C9A050]/60 shadow-md rounded-md cursor-pointer"
            onClick={handleClick}
          >
            <span className="font-sans text-[9.5px] uppercase tracking-[0.25em] text-oxblood dark:text-gold-light font-semibold whitespace-nowrap">
              Atelier Concierge
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 3. The One Cohesive Companion Character Avatar ── */}
      <motion.button
        id="ai-chat-launcher"
        onClick={handleClick}
        aria-label="Open Zaria Atelier Concierge"
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        animate={
          reducedMotion
            ? undefined
            : {
                scale: [1, 1.025, 1],
                y: [0, -2.5, 0],
              }
        }
        transition={
          reducedMotion
            ? undefined
            : {
                repeat: Infinity,
                duration: 2.8,
                ease: "easeInOut",
              }
        }
        className="pointer-events-auto relative flex items-center justify-center w-[54px] h-[54px] sm:w-[58px] sm:h-[58px] rounded-full bg-gradient-to-br from-[#5C111C] via-[#4A0E17] to-[#230408] border border-[#C9A050] text-[#FAF7F2] shadow-[0_8px_30px_rgba(74,14,23,0.38)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A050] cursor-pointer group"
      >
        {/* Breathing ambient halo */}
        <span className="absolute -inset-1 rounded-full bg-[#C9A050]/20 blur-xs pointer-events-none" />

        {/* Illustrated Royal Motif Mark (Peacock Feather & Embroidered Lotus Emblem) */}
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-7 h-7 sm:w-8 sm:h-8 text-[#E6CA85] group-hover:text-gold-light transition-colors relative z-10"
          aria-hidden="true"
        >
          {/* Outer Ornamental Petals */}
          <path
            d="M16 3C16 3 19 8.5 19 12C19 13.6569 17.6569 15 16 15C14.3431 15 13 13.6569 13 12C13 8.5 16 3 16 3Z"
            fill="currentColor"
            fillOpacity="0.85"
          />
          <path
            d="M16 15C16 15 22 13 25 16C26.5 17.5 26 19.5 24.5 20.5C23 21.5 20.5 20.5 19 18.5C18 17 16 15 16 15Z"
            fill="currentColor"
            fillOpacity="0.7"
          />
          <path
            d="M16 15C16 15 10 13 7 16C5.5 17.5 6 19.5 7.5 20.5C9 21.5 11.5 20.5 13 18.5C14 17 16 15 16 15Z"
            fill="currentColor"
            fillOpacity="0.7"
          />
          {/* Base Regal Arch & Pedestal */}
          <path
            d="M11 26C13.5 24 18.5 24 21 26"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          {/* Central Royal Jewel Dot */}
          <circle cx="16" cy="19" r="1.8" fill="#FFF" />
          <circle cx="16" cy="19" r="2.8" stroke="currentColor" strokeWidth="0.8" />
        </svg>

        {/* Small Companion Presence Indicator Dot */}
        <span className="absolute top-0 right-0 w-3 h-3 rounded-full bg-[#C9A050] border-2 border-[#4A0E17]" />
      </motion.button>
    </div>
  );
}
