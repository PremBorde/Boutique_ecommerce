"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/hooks/useCart";
import { X, Send, ShoppingBag } from "lucide-react";
import { useEffect } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  products?: any[];
}

const SUGGESTED_PROMPTS = [
  "Show me festive lehengas in crimson wine",
  "Do you have handwoven Banarasi sarees under ₹15,000?",
  "What is your return & shipping policy?",
  "Recommend a regal ensemble for a Jaipur wedding",
];

/* ── Small ornamental ✦ SVG ── */
function StarSeal({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Outer thin ring */}
      <circle cx="12" cy="12" r="10.5" stroke="#C9A050" strokeWidth="0.6" opacity="0.55" />
      {/* Four-point star */}
      <path
        d="M12 3.5 L13.05 10.95 L20.5 12 L13.05 13.05 L12 20.5 L10.95 13.05 L3.5 12 L10.95 10.95 Z"
        fill="#DFC07B"
      />
      {/* Tiny centre dot */}
      <circle cx="12" cy="12" r="1.4" fill="#FAF7F2" opacity="0.7" />
    </svg>
  );
}

export function AiChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Namaste. I am your personal Concierge at Zaria Atelier. Allow me to guide you through our limited-batch hand-embroidered silks, advise on drape and fit, or verify live vault availability.",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [sessionToken, setSessionToken] = useState<string>("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { addItem, openDrawer } = useCart();

  useEffect(() => {
    const stored = localStorage.getItem("zaria_chat_token");
    if (stored) {
      setSessionToken(stored);
    } else {
      const newToken = `session_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 9)}`;
      localStorage.setItem("zaria_chat_token", newToken);
      setSessionToken(newToken);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, loading]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      role: "user",
      content: text.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text.trim(), sessionToken }),
      });
      const data = await res.json();

      const assistantMessage: Message = {
        id: `ai_${Date.now()}`,
        role: "assistant",
        content: data.message || "I have curated these pieces for you.",
        products: data.products || [],
      };

      if (data.sessionToken && data.sessionToken !== sessionToken) {
        setSessionToken(data.sessionToken);
        localStorage.setItem("zaria_chat_token", data.sessionToken);
      }

      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: "assistant",
          content: "The connection was momentarily interrupted. Please ask again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ══════════════════════════════════════════════════
          FLOATING LAUNCHER — Three Visual Layers
      ══════════════════════════════════════════════════ */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2.5">

        {/* ── LAYER 3: Compact brand label (always visible, compact) ── */}
        <AnimatePresence>
          {!isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF7F2] border border-[#C9A050]/50 shadow-[0_2px_12px_rgba(74,14,23,0.10)] cursor-pointer select-none"
              onClick={() => setIsOpen(true)}
            >
              {/* Tiny ✦ brand mark */}
              <svg width="8" height="8" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                <path
                  d="M5 0.5 L5.7 4.3 L9.5 5 L5.7 5.7 L5 9.5 L4.3 5.7 L0.5 5 L4.3 4.3 Z"
                  fill="#B38F3F"
                />
              </svg>
              <span className="font-sans text-[8px] uppercase tracking-[0.32em] text-[#4A0E17] font-semibold whitespace-nowrap hidden sm:inline">
                Atelier Concierge
              </span>
              <span className="font-sans text-[8px] uppercase tracking-[0.28em] text-[#4A0E17] font-semibold whitespace-nowrap sm:hidden">
                Concierge
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── LAYER 1 (glow) + LAYER 2 (button) together ── */}
        <motion.button
          id="ai-chat-launcher"
          onClick={() => setIsOpen(!isOpen)}
          initial={false}
          whileHover="hovered"
          whileTap={{ scale: 0.96 }}
          aria-label="Open Zaria Concierge"
          className="relative focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A050]/60 rounded-full"
          style={{ isolation: "isolate" }}
        >
          {/* LAYER 1 — Soft champagne ambient glow (candlelight) */}
          <motion.span
            className="absolute -inset-[18px] rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, rgba(201,160,80,0.18) 0%, rgba(201,160,80,0.07) 50%, transparent 72%)",
            }}
            variants={{
              hovered: {
                opacity: 1.6,
                scale: 1.08,
              },
            }}
            transition={{ duration: 0.25 }}
          />

          {/* LAYER 2 — Luxury circular button */}
          <motion.span
            className="relative flex items-center justify-center w-[58px] h-[58px] sm:w-[62px] sm:h-[62px] rounded-full"
            variants={{
              hovered: { scale: 1.04 },
            }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            style={{
              /* Outer faint ornamental ring */
              boxShadow:
                "0 0 0 1px rgba(201,160,80,0.25), 0 0 0 5px rgba(201,160,80,0.08), 0 6px 22px rgba(74,14,23,0.30), 0 2px 8px rgba(74,14,23,0.18)",
              background: "linear-gradient(145deg, #5C1020 0%, #3B0A12 55%, #4A0E17 100%)",
              border: "1.5px solid rgba(201,160,80,0.65)",
            }}
          >
            {/* Second inner ornamental ring — very subtle */}
            <span
              className="absolute inset-[5px] rounded-full pointer-events-none"
              style={{
                border: "0.75px solid rgba(201,160,80,0.22)",
              }}
            />

            {/* Icon — close X when open, ✦ seal when closed */}
            <AnimatePresence mode="wait" initial={false}>
              {isOpen ? (
                <motion.span
                  key="close"
                  initial={{ opacity: 0, rotate: -45, scale: 0.7 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: 45, scale: 0.7 }}
                  transition={{ duration: 0.18 }}
                  className="flex items-center justify-center"
                >
                  <X className="w-4 h-4 text-[#DFC07B]" strokeWidth={1.5} />
                </motion.span>
              ) : (
                <motion.span
                  key="star"
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  transition={{ duration: 0.18 }}
                  className="flex items-center justify-center"
                >
                  <StarSeal size={22} />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.span>
        </motion.button>
      </div>

      {/* ══════════════════════════════════════════════════
          CHAT PANEL — Private Luxury Concierge
      ══════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Mobile backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsOpen(false)}
              className="md:hidden fixed inset-0 bg-noir/30 z-40 backdrop-blur-[2px]"
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.97 }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              className="fixed bottom-0 right-0 md:bottom-[88px] md:right-6 w-full md:w-[420px] h-[88vh] md:h-[580px] z-50 flex flex-col overflow-hidden md:rounded-sm"
              style={{
                background: "#FAF7F2",
                border: "1px solid rgba(201,160,80,0.30)",
                boxShadow:
                  "0 20px 60px rgba(74,14,23,0.16), 0 4px 16px rgba(74,14,23,0.10)",
              }}
            >
              {/* ── Header ── */}
              <div
                className="px-5 py-4 flex items-start justify-between shrink-0"
                style={{
                  borderBottom: "1px solid rgba(201,160,80,0.22)",
                  background:
                    "linear-gradient(to bottom, rgba(74,14,23,0.03) 0%, transparent 100%)",
                }}
              >
                <div className="flex items-center gap-3">
                  {/* Decorative seal mark */}
                  <span className="flex items-center justify-center w-8 h-8 rounded-full shrink-0"
                    style={{
                      border: "1px solid rgba(201,160,80,0.40)",
                      background: "linear-gradient(145deg, #5C1020, #3B0A12)",
                    }}
                  >
                    <StarSeal size={14} />
                  </span>
                  <div>
                    <h3 className="font-serif text-[13px] text-oxblood font-semibold tracking-[0.06em]">
                      Zaria Concierge
                    </h3>
                    <p className="font-sans text-[9px] uppercase tracking-[0.24em] text-noir/38 mt-0.5">
                      Personal Atelier Assistance
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="mt-0.5 w-6 h-6 flex items-center justify-center text-noir/25 hover:text-oxblood/70 transition-colors"
                  aria-label="Close"
                >
                  <X className="w-3.5 h-3.5" strokeWidth={1.5} />
                </button>
              </div>

              {/* Thin gold hairline */}
              <div
                className="h-px shrink-0"
                style={{
                  background:
                    "linear-gradient(to right, transparent, rgba(201,160,80,0.35), transparent)",
                }}
              />

              {/* ── Messages ── */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 no-scrollbar">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
                  >
                    <span className="font-sans text-[8.5px] uppercase tracking-[0.2em] text-noir/28 mb-1">
                      {m.role === "user" ? "You" : "Concierge"}
                    </span>

                    <div
                      className="max-w-[88%] px-3.5 py-2.5 text-[11.5px] leading-relaxed font-sans"
                      style={
                        m.role === "user"
                          ? {
                              background:
                                "linear-gradient(135deg, #5C1020 0%, #4A0E17 100%)",
                              color: "rgba(250,247,242,0.88)",
                            }
                          : {
                              background: "#FFFFFF",
                              color: "rgba(20,17,19,0.72)",
                              border: "1px solid rgba(201,160,80,0.20)",
                            }
                      }
                    >
                      <p className="whitespace-pre-line">{m.content}</p>
                    </div>

                    {/* Product cards */}
                    {m.products && m.products.length > 0 && (
                      <div className="mt-3 w-full space-y-2">
                        <p className="font-sans text-[8.5px] uppercase tracking-[0.2em] text-[#B38F3F] font-semibold">
                          ✦ Selected Pieces
                        </p>
                        {m.products.map((p) => {
                          const firstImage =
                            p.images?.[0]?.url ||
                            "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b";
                          const firstVariant = p.variants?.[0];
                          const inStock = (p.variants || []).some(
                            (v: any) => (v.inventory?.quantity ?? 0) > 0
                          );

                          return (
                            <div
                              key={p.id}
                              className="bg-white flex items-center gap-3 p-2.5 hover:border-[rgba(201,160,80,0.5)] transition-colors"
                              style={{ border: "1px solid rgba(201,160,80,0.18)" }}
                            >
                              <div className="relative w-12 h-16 shrink-0 overflow-hidden"
                                style={{ border: "1px solid rgba(201,160,80,0.15)" }}>
                                <Image
                                  src={firstImage}
                                  alt={p.name}
                                  fill
                                  sizes="48px"
                                  className="object-cover"
                                />
                              </div>

                              <div className="flex-1 min-w-0">
                                <Link
                                  href={`/product/${p.slug}`}
                                  onClick={() => setIsOpen(false)}
                                  className="font-serif text-[11px] font-semibold text-oxblood hover:text-[#B38F3F] transition-colors truncate block"
                                >
                                  {p.name}
                                </Link>
                                <p className="font-sans text-[9px] text-noir/38 truncate mt-0.5">
                                  {p.category?.name || "Couture"}
                                </p>
                                <p className="font-serif text-[11px] font-semibold text-[#B38F3F] mt-0.5">
                                  {formatPrice(p.basePrice)}
                                </p>
                              </div>

                              <div className="shrink-0">
                                {inStock && firstVariant ? (
                                  <button
                                    onClick={() => {
                                      addItem({
                                        variantId: firstVariant.id,
                                        productId: p.id,
                                        name: p.name,
                                        slug: p.slug,
                                        color: firstVariant.color,
                                        size: firstVariant.size,
                                        price: Number(p.basePrice),
                                        image: firstImage,
                                        quantity: 1,
                                        maxStock:
                                          firstVariant.inventory?.quantity || 5,
                                      });
                                      openDrawer();
                                    }}
                                    title="Add to Bag"
                                    className="w-7 h-7 flex items-center justify-center text-oxblood hover:bg-oxblood hover:text-[#DFC07B] transition-colors"
                                    style={{ border: "1px solid rgba(201,160,80,0.30)" }}
                                  >
                                    <ShoppingBag className="w-3 h-3" strokeWidth={1.5} />
                                  </button>
                                ) : (
                                  <span className="font-sans text-[8.5px] uppercase text-noir/28 tracking-wide">
                                    Sold
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}

                {/* Typing indicator */}
                {loading && (
                  <div className="flex items-start">
                    <div
                      className="px-4 py-2.5 flex items-center gap-1.5 bg-white"
                      style={{ border: "1px solid rgba(201,160,80,0.18)" }}
                    >
                      {[0, 0.15, 0.3].map((delay, i) => (
                        <span
                          key={i}
                          className="w-1.5 h-1.5 rounded-full bg-[#C9A050] animate-bounce"
                          style={{ animationDelay: `${delay}s` }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* ── Suggested Prompts ── */}
              {messages.length <= 2 && (
                <div
                  className="px-5 py-3 shrink-0"
                  style={{ borderTop: "1px solid rgba(201,160,80,0.15)" }}
                >
                  <p className="font-sans text-[8px] uppercase tracking-[0.22em] text-noir/28 mb-2">
                    Suggested
                  </p>
                  <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                    {SUGGESTED_PROMPTS.map((prompt, i) => (
                      <button
                        key={i}
                        onClick={() => handleSend(prompt)}
                        className="font-sans text-[9px] whitespace-nowrap px-2.5 py-1 text-noir/55 hover:text-oxblood hover:bg-oxblood/5 transition-colors shrink-0"
                        style={{
                          border: "1px solid rgba(201,160,80,0.22)",
                          background: "white",
                          letterSpacing: "0.02em",
                        }}
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Input Bar ── */}
              <div
                className="px-4 py-3 shrink-0"
                style={{
                  borderTop: "1px solid rgba(201,160,80,0.22)",
                  background: "white",
                }}
              >
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask your concierge…"
                    className="flex-1 h-9 px-3 font-sans text-[11px] outline-none placeholder:text-noir/28 text-noir/75 transition-all bg-[#FAF7F2]"
                    style={{ border: "1px solid rgba(201,160,80,0.28)" }}
                    onFocus={(e) =>
                      (e.target.style.borderColor = "rgba(74,14,23,0.35)")
                    }
                    onBlur={(e) =>
                      (e.target.style.borderColor = "rgba(201,160,80,0.28)")
                    }
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || loading}
                    className="h-9 w-9 flex items-center justify-center text-[#DFC07B] disabled:opacity-30 hover:opacity-90 transition-opacity shrink-0"
                    style={{
                      background:
                        "linear-gradient(135deg, #5C1020 0%, #4A0E17 100%)",
                    }}
                    aria-label="Send"
                  >
                    <Send className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </button>
                </form>

                {/* Footer attribution */}
                <p className="font-sans text-[7.5px] uppercase tracking-[0.2em] text-noir/20 text-center mt-2">
                  ✦ Zaria Atelier · Powered by Gemini
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
