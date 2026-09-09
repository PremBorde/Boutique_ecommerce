"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  MessageSquare,
  X,
  Send,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Bot,
} from "lucide-react";

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
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Namaste. I am your personal Atelier Stylist at Zaria. Allow me to guide you through our limited-batch hand-embroidered silks, advise on drape and fit, or verify live vault stock.",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [sessionToken, setSessionToken] = useState<string>("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { addItem, openDrawer } = useCart();

  useEffect(() => {
    // Initialize or restore session token from localStorage
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
        body: JSON.stringify({
          message: text.trim(),
          sessionToken,
        }),
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
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: "assistant",
          content:
            "The atelier connection was momentarily interrupted. Please ask again in a moment.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* 3D Holographic AI Avatar Launcher */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-center gap-2">
        {/* Tooltip label — shown when not open */}
        <AnimatePresence>
          {!isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.9 }}
              transition={{ delay: 1.2, duration: 0.4 }}
              className="pointer-events-none text-center"
            >
              <span className="text-[9px] font-mono uppercase tracking-[0.25em] text-gold/80 bg-noir/80 backdrop-blur-sm px-2.5 py-1 border border-gold/30 shadow-md">
                Atelier AI
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* The 3D Avatar Button */}
        <motion.button
          id="ai-chat-launcher"
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.06, y: -4 }}
          whileTap={{ scale: 0.94 }}
          animate={isOpen ? { scale: 1 } : {
            y: [0, -5, 0],
            transition: { repeat: Infinity, duration: 3, ease: "easeInOut" }
          }}
          aria-label="Open AI Shopping Assistant"
          className="relative w-[72px] h-[72px] rounded-full focus:outline-none group"
          style={{ filter: "drop-shadow(0 12px 28px rgba(201,160,80,0.55))" }}
        >
          {/* Outer Pulsing Halo Ring */}
          <span
            className="absolute -inset-2 rounded-full bg-gold/20 animate-ping opacity-50"
            style={{ animationDuration: "2.4s" }}
          />

          {/* Orbital particle ring */}
          <span
            className="absolute inset-[-6px] rounded-full border border-dashed border-gold/40"
            style={{
              animation: "spin 8s linear infinite",
            }}
          />

          {/* Glowing backdrop disc */}
          <span className="absolute inset-0 rounded-full bg-gradient-radial from-[#3B0A12] via-[#1a0808] to-[#0D0000] border-2 border-gold/60 shadow-[inset_0_2px_8px_rgba(245,208,97,0.3),0_0_20px_rgba(201,160,80,0.5)]" />

          {/* 3D Face / Bust SVG Avatar */}
          <span className="absolute inset-0 flex items-center justify-center">
            <svg
              viewBox="0 0 72 72"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full"
            >
              {/* Glow filter */}
              <defs>
                <radialGradient id="faceGrad" cx="50%" cy="42%" r="45%">
                  <stop offset="0%" stopColor="#F5D061" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#DFC07B" stopOpacity="0" />
                </radialGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="1.8" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Ambient face glow disc */}
              <ellipse cx="36" cy="30" rx="18" ry="20" fill="url(#faceGrad)" />

              {/* Neck */}
              <rect x="30.5" y="46" width="11" height="8" rx="2" fill="#DFC07B" opacity="0.7" filter="url(#glow)" />

              {/* Shoulder arc */}
              <path
                d="M14 64 C14 54, 24 50, 36 50 C48 50, 58 54, 58 64"
                stroke="#DFC07B"
                strokeWidth="1.5"
                fill="#1a0808"
                filter="url(#glow)"
              />

              {/* Head */}
              <ellipse
                cx="36" cy="28" rx="14" ry="16"
                fill="#2A0A10"
                stroke="#DFC07B"
                strokeWidth="1.2"
                filter="url(#glow)"
              />

              {/* Hair highlight */}
              <path
                d="M22 22 Q28 12 36 12 Q44 12 50 22"
                stroke="#F5D061"
                strokeWidth="1.5"
                fill="none"
                strokeLinecap="round"
                filter="url(#glow)"
              />

              {/* Eyes */}
              <ellipse cx="29.5" cy="27" rx="2.2" ry="1.6" fill="#F5D061" filter="url(#glow)" />
              <ellipse cx="42.5" cy="27" rx="2.2" ry="1.6" fill="#F5D061" filter="url(#glow)" />
              {/* Pupil */}
              <circle cx="29.5" cy="27" r="1" fill="#0D0000" />
              <circle cx="42.5" cy="27" r="1" fill="#0D0000" />

              {/* Nose subtle line */}
              <path d="M35 30 L34 34 L38 34" stroke="#B38F3F" strokeWidth="0.8" fill="none" strokeLinecap="round" />

              {/* Lips */}
              <path
                d="M31 38 Q36 41 41 38"
                stroke="#DFC07B"
                strokeWidth="1.2"
                fill="none"
                strokeLinecap="round"
                filter="url(#glow)"
              />

              {/* Crown / Maang tikka ornament */}
              <line x1="36" y1="12" x2="36" y2="8" stroke="#F5D061" strokeWidth="1" filter="url(#glow)" />
              <circle cx="36" cy="7" r="2.2" fill="#F5D061" filter="url(#glow)" />
              <circle cx="36" cy="7" r="1" fill="#4A0E17" />

              {/* Ear ornaments */}
              <circle cx="22" cy="30" r="2" fill="#DFC07B" opacity="0.8" filter="url(#glow)" />
              <circle cx="50" cy="30" r="2" fill="#DFC07B" opacity="0.8" filter="url(#glow)" />

              {/* AI sparkle badge bottom-right */}
              <circle cx="56" cy="52" r="7" fill="#0B3B24" stroke="#DFC07B" strokeWidth="1" />
              <text x="56" y="55.5" textAnchor="middle" fontSize="7" fill="#F5D061" fontFamily="serif">AI</text>
            </svg>
          </span>

          {/* Online indicator dot */}
          <span className="absolute bottom-1 right-1 w-3 h-3 rounded-full bg-emerald border-2 border-[#1a0808] shadow-[0_0_6px_#0B3B24]" />
        </motion.button>
      </div>

      {/* Slide-in Assistant Panel / Mobile Bottom Sheet */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Mobile Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="md:hidden fixed inset-0 bg-noir/70 z-50 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.98 }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="fixed bottom-0 right-0 md:bottom-22 md:right-6 w-full md:w-[460px] h-[85vh] md:h-[620px] bg-ivory border-t md:border border-gold/40 shadow-2xl z-50 flex flex-col overflow-hidden"
            >
              {/* Header with mini avatar */}
              <div className="px-4 py-3 bg-gradient-to-r from-[#2A0A10] to-[#1a0808] text-ivory flex items-center justify-between border-b border-gold/30">
                <div className="flex items-center gap-3">
                  {/* Mini 3D avatar in header */}
                  <div className="relative w-10 h-10 rounded-full shrink-0"
                    style={{ filter: "drop-shadow(0 4px 8px rgba(201,160,80,0.5))" }}
                  >
                    <span className="absolute inset-0 rounded-full bg-gradient-to-b from-[#3B0A12] to-[#1a0808] border border-gold/60" />
                    <svg viewBox="0 0 72 72" fill="none" className="absolute inset-0 w-full h-full">
                      <defs>
                        <filter id="glowH">
                          <feGaussianBlur stdDeviation="1.5" result="b" />
                          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
                        </filter>
                      </defs>
                      <ellipse cx="36" cy="28" rx="14" ry="16" fill="#2A0A10" stroke="#DFC07B" strokeWidth="1.2" filter="url(#glowH)" />
                      <path d="M22 22 Q28 12 36 12 Q44 12 50 22" stroke="#F5D061" strokeWidth="1.5" fill="none" strokeLinecap="round" filter="url(#glowH)" />
                      <ellipse cx="29.5" cy="27" rx="2.2" ry="1.6" fill="#F5D061" filter="url(#glowH)" />
                      <ellipse cx="42.5" cy="27" rx="2.2" ry="1.6" fill="#F5D061" filter="url(#glowH)" />
                      <circle cx="29.5" cy="27" r="1" fill="#0D0000" />
                      <circle cx="42.5" cy="27" r="1" fill="#0D0000" />
                      <path d="M31 38 Q36 41 41 38" stroke="#DFC07B" strokeWidth="1.2" fill="none" strokeLinecap="round" filter="url(#glowH)" />
                      <line x1="36" y1="12" x2="36" y2="8" stroke="#F5D061" strokeWidth="1" filter="url(#glowH)" />
                      <circle cx="36" cy="7" r="2.2" fill="#F5D061" filter="url(#glowH)" />
                      <rect x="30.5" y="46" width="11" height="8" rx="2" fill="#DFC07B" opacity="0.7" filter="url(#glowH)" />
                      <path d="M14 64 C14 54, 24 50, 36 50 C48 50, 58 54, 58 64" stroke="#DFC07B" strokeWidth="1.5" fill="#1a0808" filter="url(#glowH)" />
                    </svg>
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald border border-[#1a0808]" />
                  </div>
                  <div>
                    <h3 className="font-serif text-sm text-gold-foil font-semibold tracking-wider">
                      Zaria Atelier Stylist
                    </h3>
                    <p className="text-[10px] text-ivory/50 uppercase tracking-widest">
                      Gemini 2.0 Flash · Live Catalogue
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-ivory/60 hover:text-ivory hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Messages Scroll Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex flex-col ${
                      m.role === "user" ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] p-3.5 leading-relaxed ${
                        m.role === "user"
                          ? "bg-oxblood text-ivory font-medium border border-oxblood shadow-xs"
                          : "bg-white text-noir/85 border border-gold/25 shadow-xs"
                      }`}
                    >
                      <p className="whitespace-pre-line">{m.content}</p>
                    </div>

                    {/* Inline Product Cards returned from Tool Execution */}
                    {m.products && m.products.length > 0 && (
                      <div className="mt-3 w-full space-y-2.5">
                        <p className="text-[10px] uppercase tracking-widest text-gold-dark font-semibold">
                          Recommended Pieces:
                        </p>
                        <div className="grid grid-cols-1 gap-2.5">
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
                                className="bg-white border border-gold/30 p-2.5 flex items-center gap-3 hover:border-gold transition-colors shadow-xs"
                              >
                                <div className="relative w-14 h-18 bg-noir/5 shrink-0 overflow-hidden border border-gold/20">
                                  <Image
                                    src={firstImage}
                                    alt={p.name}
                                    fill
                                    sizes="56px"
                                    className="object-cover"
                                  />
                                </div>

                                <div className="flex-1 min-w-0">
                                  <Link
                                    href={`/product/${p.slug}`}
                                    onClick={() => setIsOpen(false)}
                                    className="font-serif text-xs font-semibold text-oxblood hover:text-gold transition-colors truncate block"
                                  >
                                    {p.name}
                                  </Link>
                                  <p className="text-[10px] text-noir/50 truncate">
                                    {p.category?.name || "Couture"}
                                  </p>
                                  <p className="font-serif text-xs font-semibold text-gold-dark mt-0.5">
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
                                          maxStock: firstVariant.inventory?.quantity || 5,
                                        });
                                        openDrawer();
                                      }}
                                      title="Add to Bag"
                                      className="w-8 h-8 rounded-full bg-gold/10 hover:bg-oxblood hover:text-gold-light text-oxblood border border-gold/30 flex items-center justify-center transition-colors"
                                    >
                                      <ShoppingBag className="w-3.5 h-3.5" />
                                    </button>
                                  ) : (
                                    <span className="text-[9px] uppercase text-noir/40">
                                      Sold Out
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Thinking / Typing State */}
                {loading && (
                  <div className="flex items-center gap-2 p-3 bg-white/80 border border-gold/20 max-w-[70%]">
                    <div className="w-2 h-2 rounded-full bg-gold animate-bounce" />
                    <div className="w-2 h-2 rounded-full bg-oxblood animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 rounded-full bg-emerald animate-bounce [animation-delay:0.4s]" />
                    <span className="text-[11px] font-serif text-noir/60 italic ml-1">
                      Consulting atelier vault...
                    </span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Suggested Prompts Strip */}
              {messages.length <= 2 && (
                <div className="px-4 py-2 border-t border-gold/15 bg-white/40">
                  <p className="text-[9px] uppercase tracking-widest text-noir/40 mb-1.5 font-medium">
                    Suggested Consultations:
                  </p>
                  <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                    {SUGGESTED_PROMPTS.map((prompt, i) => (
                      <button
                        key={i}
                        onClick={() => handleSend(prompt)}
                        className="text-[10px] whitespace-nowrap px-2.5 py-1 bg-white border border-gold/30 hover:border-oxblood hover:bg-gold/10 text-noir/80 transition-colors shrink-0"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input Bar */}
              <div className="p-3 border-t border-gold/30 bg-white">
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
                    placeholder="Ask our royal stylist..."
                    className="flex-1 h-10 px-3 text-xs bg-ivory/50 border border-gold/30 focus:border-oxblood outline-none transition-all placeholder:text-noir/40"
                  />
                  <Button
                    type="submit"
                    disabled={!input.trim() || loading}
                    variant="oxblood"
                    size="sm"
                    className="h-10 px-3.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </Button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
