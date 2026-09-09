"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { X, Send, ShoppingBag } from "lucide-react";

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

export function AiChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
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
      const newToken = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
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
          content:
            "The connection was momentarily interrupted. Please ask again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ── Collapsed Trigger ─────────────────────────────── */}
      <div
        className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Tooltip — visible on hover, hidden when panel is open */}
        <AnimatePresence>
          {hovered && !isOpen && (
            <motion.div
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ duration: 0.18 }}
              className="mb-1 mr-1 bg-ivory border border-gold/50 px-3 py-1.5 shadow-sm pointer-events-none"
            >
              <span className="font-sans text-[9px] uppercase tracking-[0.28em] text-oxblood font-semibold whitespace-nowrap">
                Zaria Concierge
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Circular Trigger Button */}
        <motion.button
          id="ai-chat-launcher"
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.15 }}
          aria-label="Open Zaria Concierge"
          className="w-14 h-14 md:w-[54px] md:h-[54px] rounded-full bg-oxblood border border-gold/50 shadow-[0_4px_18px_rgba(74,14,23,0.28)] hover:shadow-[0_6px_24px_rgba(74,14,23,0.38)] flex items-center justify-center transition-shadow duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
        >
          {isOpen ? (
            <X className="w-4 h-4 text-gold-light" strokeWidth={1.5} />
          ) : (
            /* Elegant ✦ monogram */
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              aria-hidden="true"
            >
              <path
                d="M12 2 L13.2 10.8 L22 12 L13.2 13.2 L12 22 L10.8 13.2 L2 12 L10.8 10.8 Z"
                fill="#DFC07B"
                opacity="0.9"
              />
            </svg>
          )}
        </motion.button>
      </div>

      {/* ── Chat Panel ────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Mobile Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="md:hidden fixed inset-0 bg-noir/40 z-40 backdrop-blur-[2px]"
            />

            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="fixed bottom-0 right-0 md:bottom-24 md:right-6 w-full md:w-[420px] h-[88vh] md:h-[580px] bg-[#FAF7F2] border-t md:border border-gold/30 shadow-[0_12px_48px_rgba(74,14,23,0.14)] z-50 flex flex-col overflow-hidden"
            >
              {/* Panel Header */}
              <div className="px-5 py-4 border-b border-gold/20 flex items-start justify-between bg-[#FAF7F2]">
                <div>
                  <h3 className="font-serif text-sm text-oxblood font-semibold tracking-[0.08em]">
                    Zaria Concierge
                  </h3>
                  <p className="text-[10px] text-noir/40 uppercase tracking-[0.22em] mt-0.5 font-sans">
                    Personal Atelier Assistance
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="mt-0.5 w-6 h-6 flex items-center justify-center text-noir/30 hover:text-oxblood transition-colors"
                  aria-label="Close"
                >
                  <X className="w-3.5 h-3.5" strokeWidth={1.5} />
                </button>
              </div>

              {/* Thin gold hairline divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex flex-col ${
                      m.role === "user" ? "items-end" : "items-start"
                    }`}
                  >
                    {/* Role label */}
                    <span className="text-[9px] uppercase tracking-[0.2em] text-noir/30 mb-1 font-sans">
                      {m.role === "user" ? "You" : "Concierge"}
                    </span>

                    <div
                      className={`max-w-[86%] px-3.5 py-2.5 text-xs leading-relaxed font-sans ${
                        m.role === "user"
                          ? "bg-oxblood text-ivory/90"
                          : "bg-white text-noir/75 border border-gold/20"
                      }`}
                    >
                      <p className="whitespace-pre-line">{m.content}</p>
                    </div>

                    {/* Inline product cards */}
                    {m.products && m.products.length > 0 && (
                      <div className="mt-3 w-full space-y-2">
                        <p className="text-[9px] uppercase tracking-[0.2em] text-gold-dark font-semibold font-sans">
                          Selected Pieces
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
                              className="bg-white border border-gold/20 p-2.5 flex items-center gap-3 hover:border-gold/50 transition-colors"
                            >
                              <div className="relative w-12 h-16 bg-noir/5 shrink-0 overflow-hidden border border-gold/15">
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
                                  className="font-serif text-[11px] font-semibold text-oxblood hover:text-gold-dark transition-colors truncate block"
                                >
                                  {p.name}
                                </Link>
                                <p className="text-[9px] text-noir/40 truncate font-sans mt-0.5">
                                  {p.category?.name || "Couture"}
                                </p>
                                <p className="font-serif text-[11px] font-semibold text-gold-dark mt-0.5">
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
                                    className="w-7 h-7 border border-gold/30 hover:bg-oxblood hover:border-oxblood hover:text-ivory text-oxblood flex items-center justify-center transition-colors"
                                  >
                                    <ShoppingBag className="w-3 h-3" strokeWidth={1.5} />
                                  </button>
                                ) : (
                                  <span className="text-[9px] uppercase text-noir/30 font-sans tracking-wide">
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

                {/* Thinking indicator */}
                {loading && (
                  <div className="flex items-start">
                    <div className="bg-white border border-gold/20 px-4 py-2.5 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-gold-dark animate-bounce" />
                      <span className="w-1.5 h-1.5 rounded-full bg-gold-dark animate-bounce [animation-delay:0.15s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-gold-dark animate-bounce [animation-delay:0.3s]" />
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Suggested Prompts */}
              {messages.length <= 2 && (
                <div className="px-5 py-3 border-t border-gold/15 bg-[#FAF7F2]">
                  <p className="text-[8.5px] uppercase tracking-[0.22em] text-noir/30 mb-2 font-sans">
                    Suggested
                  </p>
                  <div className="flex gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
                    {SUGGESTED_PROMPTS.map((prompt, i) => (
                      <button
                        key={i}
                        onClick={() => handleSend(prompt)}
                        className="text-[9px] whitespace-nowrap px-2.5 py-1 bg-white border border-gold/25 hover:border-oxblood/40 hover:bg-oxblood/5 text-noir/60 hover:text-oxblood transition-colors shrink-0 font-sans tracking-wide"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input Bar */}
              <div className="px-4 py-3 border-t border-gold/20 bg-white">
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
                    className="flex-1 h-9 px-3 text-[11px] bg-[#FAF7F2] border border-gold/25 focus:border-oxblood/50 outline-none transition-all placeholder:text-noir/30 font-sans"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || loading}
                    className="h-9 w-9 flex items-center justify-center bg-oxblood text-gold-light disabled:opacity-30 hover:bg-oxblood/90 transition-colors shrink-0"
                    aria-label="Send"
                  >
                    <Send className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
