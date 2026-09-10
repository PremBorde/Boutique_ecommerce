"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { getActiveFestival } from "@/lib/ai/festivals";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/lib/utils";
import { X, Send, MessageSquare, AlertCircle, RefreshCw, ArrowRight } from "lucide-react";
import { CompanionAvatar } from "@/components/companion/CompanionAvatar";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  productIds?: string[];
  resolvedProducts?: any[];
  isLoadingProducts?: boolean;
}

interface PersonaBadgeData {
  id: string;
  name: string;
  badge: string;
  tagline: string;
}

/**
 * Compact horizontal product card specifically optimized for inside the mobile AI chat.
 * Layout: product image | product name | price | availability/variants | CTA link
 */
function ChatProductCard({ product }: { product: any }) {
  const primaryImage =
    product.images?.find((img: any) => img.isPrimary)?.url ||
    product.images?.[0]?.url ||
    "/placeholder.jpg";

  const totalStock = (product.variants || []).reduce(
    (sum: number, v: any) => sum + (v.inventory?.quantity || 0),
    0
  );
  const isOutOfStock = (product.variants || []).length > 0 && totalStock === 0;

  const colorVariantsCount = new Set(
    (product.variants || []).map((v: any) => v.colorHex || v.color)
  ).size;

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group flex items-center gap-3 bg-white dark:bg-[#1E171A] border border-[#C9A050]/35 hover:border-[#C9A050] p-2.5 rounded-xl shadow-xs transition-all w-[265px] sm:w-[285px] shrink-0 snap-start text-left hover:shadow-md cursor-pointer"
    >
      {/* Product Image */}
      <div className="relative w-16 h-20 sm:w-18 sm:h-22 rounded-lg overflow-hidden bg-noir/5 dark:bg-noir/40 shrink-0 border border-[#C9A050]/20">
        <Image
          src={primaryImage}
          alt={product.name}
          fill
          sizes="80px"
          className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />
      </div>

      {/* Product Details */}
      <div className="flex-1 min-w-0 flex flex-col justify-between h-full py-0.5">
        <div>
          <h4 className="font-serif text-xs sm:text-[13px] font-medium text-[#4A0E17] dark:text-[#FAF7F2] truncate group-hover:text-gold transition-colors">
            {product.name}
          </h4>
          <p className="font-serif text-xs sm:text-[13px] font-semibold text-[#4A0E17] dark:text-gold-foil mt-0.5">
            {formatPrice(product.basePrice)}
          </p>
        </div>

        <div className="mt-1 pt-1 border-t border-[#C9A050]/15 flex items-center justify-between">
          <span className="text-[9.5px] uppercase tracking-wider text-noir/50 dark:text-ivory/50 truncate">
            {isOutOfStock ? (
              <span className="text-[#4A0E17]/80 dark:text-gold-light/80 font-medium">Bespoke</span>
            ) : colorVariantsCount > 1 ? (
              `${colorVariantsCount} shades`
            ) : (
              "Vault In Stock"
            )}
          </span>

          <span className="inline-flex items-center gap-0.5 text-[9.5px] uppercase tracking-wider font-semibold text-gold-dark dark:text-gold-light group-hover:text-oxblood dark:group-hover:text-gold transition-colors">
            View <ArrowRight className="w-2.5 h-2.5 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export function ChatPanel() {
  const isDrawerOpen = useCart((state) => state.isDrawerOpen);
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activePersona, setActivePersona] = useState<PersonaBadgeData | null>(null);
  const [sessionId, setSessionId] = useState<string>("");
  const [errorState, setErrorState] = useState<string | null>(null);

  const activeFestival = getActiveFestival();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Namaste. I am your in-house style guide at Zaria Atelier. I can assist with verified vault stock, drape nuances, bespoke fit queries, or authentic store policies.",
    },
  ]);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize or restore session token
  useEffect(() => {
    let sid = localStorage.getItem("zaria_chat_session_id");
    if (!sid) {
      sid = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem("zaria_chat_session_id", sid);
    }
    setSessionId(sid);

    // Restore saved persona if present
    const savedPersona = localStorage.getItem("zaria_user_persona");
    if (savedPersona) {
      try {
        setActivePersona(JSON.parse(savedPersona));
      } catch {}
    }
  }, []);

  // Listen for ambient hover companion triggers
  useEffect(() => {
    const handleAskConcierge = (e: Event) => {
      const customEvent = e as CustomEvent<{ prompt: string }>;
      if (customEvent.detail?.prompt) {
        setIsOpen(true);
        setTimeout(() => {
          handleSendMessage(customEvent.detail.prompt);
        }, 150);
      }
    };

    window.addEventListener("zaria:ask-concierge", handleAskConcierge);
    return () => window.removeEventListener("zaria:ask-concierge", handleAskConcierge);
  }, [sessionId]);

  // Auto-scroll messages container to bottom on update
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Lock background body scroll on mobile when chat panel is open
  useEffect(() => {
    if (isOpen && typeof window !== "undefined") {
      const prevOverflow = document.body.style.overflow;
      const prevTouchAction = document.body.style.touchAction;
      if (window.innerWidth < 640) {
        document.body.style.overflow = "hidden";
        document.body.style.touchAction = "none";
      }
      return () => {
        document.body.style.overflow = prevOverflow;
        document.body.style.touchAction = prevTouchAction;
      };
    }
  }, [isOpen]);

  // Close chat if bag/cart drawer opens so they don't collide
  useEffect(() => {
    if (isDrawerOpen) {
      setIsOpen(false);
    }
  }, [isDrawerOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 250);
    }
  }, [isOpen]);

  const fetchResolvedProducts = async (ids: string[]): Promise<any[]> => {
    if (!ids || ids.length === 0) return [];
    try {
      const res = await fetch(`/api/products?ids=${ids.join(",")}`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.products || [];
    } catch {
      return [];
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend !== undefined ? textToSend : input).trim();
    if (!text || loading) return;

    setErrorState(null);
    setInput("");

    const userMessageId = `user_${Date.now()}`;
    const userMessage: Message = {
      id: userMessageId,
      role: "user",
      content: text,
    };

    const currentHistory = [...messages, userMessage];
    setMessages(currentHistory);
    setLoading(true);

    try {
      // Build history payload for server-side function calling route
      const payloadMessages = currentHistory
        .filter((m) => m.id !== "welcome")
        .map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        }));

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: payloadMessages,
          sessionId,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP Error ${res.status}`);
      }

      const data = await res.json();
      const productIds: string[] = data.products || [];

      // Update persona if newly computed
      if (data.persona) {
        setActivePersona(data.persona);
        localStorage.setItem("zaria_user_persona", JSON.stringify(data.persona));
      }

      const assistantMessageId = `ai_${Date.now()}`;
      const assistantMessage: Message = {
        id: assistantMessageId,
        role: "assistant",
        content: data.message || "I have gathered these verified selections from our atelier.",
        productIds,
        isLoadingProducts: productIds.length > 0,
        resolvedProducts: [],
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // If verified product IDs returned, fetch full products for real ProductCard rendering
      if (productIds.length > 0) {
        fetchResolvedProducts(productIds).then((fetchedProducts) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? {
                    ...msg,
                    isLoadingProducts: false,
                    resolvedProducts: fetchedProducts,
                  }
                : msg
            )
          );
        });
      }
    } catch (err: any) {
      console.error("Chat communication error:", err);
      setErrorState("Our atelier line was briefly interrupted. Please try asking again.");
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: "assistant",
          content:
            "I apologize, our connection to the atelier vault was momentarily interrupted. Please ask again or browse our curated collection.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const suggestedPrompts = [
    ...(activeFestival
      ? [
          {
            label: activeFestival.chipLabel,
            prompt: activeFestival.suggestedPrompt,
            highlight: true,
          },
        ]
      : []),
    {
      label: "Festive under ₹45,000",
      prompt: "Show me handwoven festive ensembles under ₹45,000",
    },
    {
      label: "What's your return policy?",
      prompt: "What is your return and exchange policy?",
    },
    {
      label: "Show me pastel outfits",
      prompt: "Show me ivory and pastel organza garments in stock",
    },
    {
      label: "Do you offer COD?",
      prompt: "Is Cash on Delivery available?",
    },
  ];

  return (
    <>
      {/* ── Cohesive Companion Character Avatar Trigger (Replaces disconnected launcher) ── */}
      {!isDrawerOpen && !isOpen && (
        <CompanionAvatar
          onOpenChat={(prefill) => {
            setIsOpen(true);
            if (prefill) {
              setInput(prefill);
            }
          }}
        />
      )}

      {/* ── Slide-in Panel (Desktop / Tablet) / Bottom Sheet (Mobile) ── */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for mobile (leaves top 18-22% visible) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/45 backdrop-blur-xs z-50 sm:hidden"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              id="ai-chat-panel"
              data-lenis-prevent="true"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-x-0 bottom-0 sm:inset-x-auto sm:bottom-6 sm:right-6 z-50 w-full sm:w-[420px] md:w-[440px] h-[78dvh] sm:h-[560px] md:h-[580px] max-h-[82dvh] sm:max-h-[calc(100vh-5rem)] flex flex-col bg-[#FAF7F2] dark:bg-[#141012] rounded-t-3xl sm:rounded-2xl border-t sm:border border-[#C9A050]/40 shadow-[0_-12px_40px_rgba(0,0,0,0.35)] sm:shadow-[0_16px_50px_rgba(40,8,14,0.45)] overflow-hidden"
            >
              {/* Header */}
              <div className="flex flex-col bg-gradient-to-r from-[#4A0E17] via-[#38070F] to-[#250409] text-[#FAF7F2] border-b border-[#C9A050]/30 select-none shrink-0">
                {/* Mobile Gold Pull/Drag Indicator */}
                <div className="w-10 h-1 bg-[#C9A050]/50 rounded-full mx-auto mt-2.5 mb-1 sm:hidden" />

                <div className="flex items-center justify-between px-4 py-2.5 sm:py-3.5">
                  <div className="flex items-center min-w-0">
                    <h2 className="font-serif text-base font-semibold tracking-wider text-[#F7F4EB] truncate">
                      Zaria Atelier Concierge
                    </h2>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    {/* Persona Badge */}
                    {activePersona && (
                      <div
                        title={activePersona.tagline}
                        className="hidden md:flex items-center px-2 py-0.5 rounded-full bg-[#35070D] border border-[#C9A050]/60 text-[#DFC07B] text-[10px] font-sans tracking-wide"
                      >
                        {activePersona.badge}
                      </div>
                    )}

                    {/* Comfortable Touch-Target Close Button (min 44x44px touch) */}
                    <button
                      onClick={() => setIsOpen(false)}
                      className="w-11 h-11 sm:w-8 sm:h-8 flex items-center justify-center rounded-full text-[#DFC07B] hover:text-[#FAF7F2] hover:bg-white/10 active:bg-white/20 transition-colors cursor-pointer"
                      aria-label="Close concierge chat"
                    >
                      <X className="w-5 h-5 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Message List - Independently Scrollable */}
              <div
                ref={messagesContainerRef}
                data-lenis-prevent="true"
                onWheel={(e) => e.stopPropagation()}
                onTouchMove={(e) => e.stopPropagation()}
                className="flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-3 overscroll-contain"
                style={{
                  WebkitOverflowScrolling: "touch",
                }}
              >
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.role === "user" ? "items-end" : "items-start"
                    }`}
                  >
                    {/* Message Bubble */}
                    <div
                      className={`max-w-[88%] sm:max-w-[82%] px-3.5 py-2.5 text-xs sm:text-[13px] leading-relaxed break-words shadow-xs ${
                        msg.role === "user"
                          ? "bg-[#4A0E17] text-[#FAF7F2] border border-[#C9A050]/40 rounded-2xl rounded-tr-xs"
                          : "bg-white dark:bg-[#1E171A] text-[#250409] dark:text-[#FAF7F2] border border-[#C9A050]/25 rounded-2xl rounded-tl-xs"
                      }`}
                    >
                      {msg.content}
                    </div>

                    {/* Horizontal Compact Product Cards */}
                    {msg.resolvedProducts && msg.resolvedProducts.length > 0 && (
                      <div className="mt-2.5 w-full space-y-1.5">
                        <span className="text-[10px] uppercase tracking-[0.2em] text-[#9E7A2F] dark:text-[#DFC07B] font-medium block">
                          Verified Atelier Curations ({msg.resolvedProducts.length})
                        </span>
                        <div
                          className="flex gap-2.5 overflow-x-auto snap-x no-scrollbar pb-1.5 pt-0.5 touch-pan-x"
                          style={{ WebkitOverflowScrolling: "touch" }}
                        >
                          {msg.resolvedProducts.map((prod) => (
                            <ChatProductCard key={prod.id} product={prod} />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Product Cards Loading Shimmer */}
                    {msg.isLoadingProducts && (
                      <div className="mt-2 flex items-center gap-2 text-[10px] text-[#9E7A2F] italic">
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        <span>Retrieving verified atelier garment records...</span>
                      </div>
                    )}
                  </div>
                ))}

                {/* Loading state indicator */}
                {loading && (
                  <div className="flex items-start gap-2">
                    <div className="bg-white dark:bg-[#1E171A] border border-[#C9A050]/30 px-3.5 py-2 rounded-2xl flex items-center gap-1.5 shadow-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C9A050] animate-bounce" />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C9A050] animate-bounce [animation-delay:0.15s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C9A050] animate-bounce [animation-delay:0.3s]" />
                      <span className="text-[10px] text-[#7A5B18] dark:text-[#DFC07B] ml-1.5 italic">
                        Checking vault & policies...
                      </span>
                    </div>
                  </div>
                )}

                {errorState && (
                  <div className="flex items-center gap-1.5 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-[10px]">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errorState}</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Suggested Prompts / Chips (Horizontally scrollable, single row, no scrollbar) */}
              <div className="px-3 py-2 border-t border-[#C9A050]/20 bg-[#F4EFE6]/90 dark:bg-[#1A1417]/90 backdrop-blur-xs shrink-0">
                <div
                  className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 touch-pan-x flex-nowrap"
                  style={{ WebkitOverflowScrolling: "touch" }}
                >
                  {suggestedPrompts.map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      disabled={loading}
                      onClick={() => handleSendMessage(chip.prompt)}
                      className={`whitespace-nowrap shrink-0 px-3 py-1.5 rounded-full text-[11px] tracking-wide transition-all border active:scale-95 disabled:opacity-50 cursor-pointer ${
                        (chip as any).highlight
                          ? "bg-[#4A0E17] text-[#DFC07B] border-[#C9A050] font-medium shadow-xs hover:bg-[#35070D]"
                          : "bg-white dark:bg-[#20181B] text-[#4A0E17] dark:text-[#DFC07B] border-[#C9A050]/35 hover:border-[#C9A050] hover:bg-[#FAF7F2] dark:hover:bg-[#271E22]"
                      }`}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Area - Fixed/Sticky Single-row Layout at Bottom with Safe Area */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="p-2.5 sm:p-3.5 bg-white dark:bg-[#161214] border-t border-[#C9A050]/30 flex items-center gap-2 shrink-0 pb-[max(0.85rem,env(safe-area-inset-bottom))]"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onFocus={() => {
                    setTimeout(() => {
                      if (messagesContainerRef.current) {
                        messagesContainerRef.current.scrollTop =
                          messagesContainerRef.current.scrollHeight;
                      }
                    }, 300);
                  }}
                  placeholder="Ask about silks, sizing, or styling..."
                  disabled={loading}
                  className="flex-1 bg-[#FAF7F2] dark:bg-[#20181B] px-3.5 py-2.5 sm:py-2 text-base sm:text-xs md:text-[13px] text-[#250409] dark:text-[#FAF7F2] placeholder-[#250409]/45 dark:placeholder-[#FAF7F2]/45 rounded-xl border border-[#C9A050]/40 focus:border-[#C9A050] focus:ring-1 focus:ring-[#C9A050]/50 focus:outline-none transition-all shadow-inner"
                />

                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  aria-label="Send message"
                  className="w-11 h-11 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-[#58111A] to-[#35070D] text-[#DFC07B] hover:brightness-110 active:scale-95 disabled:opacity-40 transition-all shrink-0 border border-[#C9A050]/60 shadow-xs cursor-pointer disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
