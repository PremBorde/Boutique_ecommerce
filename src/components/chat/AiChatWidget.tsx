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
      {/* Floating Branded Launcher Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <motion.button
          id="ai-chat-launcher"
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="group relative flex items-center gap-2.5 px-4 py-3.5 bg-oxblood text-gold-foil border border-gold shadow-[0_10px_30px_rgba(74,14,23,0.45)] hover:shadow-[0_15px_40px_rgba(201,160,80,0.4)] transition-all overflow-hidden"
          aria-label="Open AI Shopping Assistant"
        >
          {/* Subtle breathing glow */}
          <span className="absolute -inset-1 rounded-full bg-gold/20 animate-ping opacity-40 group-hover:opacity-60" />

          <Sparkles className="w-4 h-4 text-gold-light animate-pulse" />
          <span className="font-serif text-xs uppercase tracking-[0.2em] font-semibold">
            Atelier Stylist
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald shrink-0" title="Online" />
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
              {/* Header */}
              <div className="p-4 bg-oxblood text-ivory flex items-center justify-between border-b border-gold/30">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gold/20 border border-gold flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-gold-light" />
                  </div>
                  <div>
                    <h3 className="font-serif text-sm text-gold-foil font-semibold tracking-wider">
                      Zaria Atelier Stylist
                    </h3>
                    <p className="text-[10px] text-ivory/60 uppercase tracking-widest">
                      Gemini 2.0 Flash · Live Catalogue Verified
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
