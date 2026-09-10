"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ProductCard } from "@/components/storefront/ProductCard";
import { getActiveFestival } from "@/lib/ai/festivals";
import { useCart } from "@/hooks/useCart";
import { X, Send, Sparkles, AlertCircle, RefreshCw } from "lucide-react";

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

  // Scroll to bottom on message update
  useEffect(() => {
    if (isOpen && messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages, isOpen, loading]);

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
      {/* ── Floating Launcher Button (Hidden when Bag Drawer or Chat is Open) ── */}
      <AnimatePresence>
        {!isDrawerOpen && !isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end gap-2"
          >
            <motion.div
              initial={{ opacity: 0, y: 4, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.95 }}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#FAF7F2] dark:bg-[#161214] border border-[#C9A050]/60 shadow-[0_4px_16px_rgba(74,14,23,0.12)] cursor-pointer select-none rounded-md"
              onClick={() => setIsOpen(true)}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C9A050] animate-pulse" />
              <span className="font-sans text-[9px] uppercase tracking-[0.25em] text-[#4A0E17] dark:text-gold-light font-semibold whitespace-nowrap">
                Atelier Concierge
              </span>
            </motion.div>

            <motion.button
              id="ai-chat-launcher"
              onClick={() => setIsOpen(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Open Zaria Concierge Chat"
              className="relative flex items-center justify-center w-[52px] h-[52px] sm:w-[58px] sm:h-[58px] rounded-full bg-gradient-to-br from-[#58111A] via-[#4A0E17] to-[#250409] border border-[#C9A050]/70 text-[#F7F4EB] shadow-[0_8px_28px_rgba(74,14,23,0.35)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A050]"
            >
              {/* Ambient idle glow */}
              <span className="absolute -inset-1.5 rounded-full bg-[#C9A050]/20 blur-sm pointer-events-none animate-pulse" />

              <div className="relative z-10 flex flex-col items-center justify-center">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="10.5" stroke="#C9A050" strokeWidth="0.8" opacity="0.6" />
                  <path
                    d="M12 4 L13.1 10.9 L20 12 L13.1 13.1 L12 20 L10.9 13.1 L4 12 L10.9 10.9 Z"
                    fill="#DFC07B"
                  />
                  <circle cx="12" cy="12" r="1.5" fill="#FAF7F2" />
                </svg>
              </div>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Slide-in Panel (Desktop / Tablet) / Bottom Sheet (Mobile) ── */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for mobile */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 sm:hidden"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              id="ai-chat-panel"
              data-lenis-prevent="true"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-x-0 bottom-0 sm:inset-x-auto sm:bottom-6 sm:right-6 z-50 w-full sm:w-[400px] md:w-[420px] h-[82dvh] sm:h-[540px] md:h-[560px] max-h-[85dvh] sm:max-h-[calc(100vh-5rem)] flex flex-col bg-[#FAF7F2] dark:bg-[#141012] rounded-t-3xl sm:rounded-2xl border-t sm:border border-[#C9A050]/40 shadow-[0_-8px_32px_rgba(0,0,0,0.3)] sm:shadow-[0_16px_50px_rgba(40,8,14,0.45)] overflow-hidden"
            >
              {/* Header */}
              <div className="flex flex-col bg-gradient-to-r from-[#4A0E17] via-[#38070F] to-[#250409] text-[#FAF7F2] border-b border-[#C9A050]/30 select-none shrink-0">
                {/* Mobile Pull/Drag Indicator */}
                <div className="w-10 h-1 bg-[#C9A050]/40 rounded-full mx-auto mt-2.5 mb-1 sm:hidden" />

                <div className="flex items-center justify-between px-4 py-3.5">
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

                    <button
                      onClick={() => setIsOpen(false)}
                      className="p-1.5 rounded-full text-[#DFC07B] hover:text-[#FAF7F2] hover:bg-white/10 active:bg-white/20 transition-colors"
                      aria-label="Close chat"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Message List */}
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

                    {/* Inline Products Grid */}
                    {msg.resolvedProducts && msg.resolvedProducts.length > 0 && (
                      <div className="mt-2.5 w-full space-y-2">
                        <span className="text-[10px] uppercase tracking-[0.2em] text-[#9E7A2F] dark:text-[#DFC07B] font-medium block">
                          Verified Atelier Curations ({msg.resolvedProducts.length})
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {msg.resolvedProducts.map((prod) => (
                            <div key={prod.id} className="w-full">
                              <ProductCard product={prod} />
                            </div>
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

              {/* Suggested Prompts / Chips (Dynamic Festival-aware) */}
              <div className="px-3 py-2 border-t border-[#C9A050]/20 bg-[#F4EFE6]/90 dark:bg-[#1A1417]/90 backdrop-blur-xs shrink-0">
                <div
                  className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5"
                  style={{ WebkitOverflowScrolling: "touch" }}
                >
                  {suggestedPrompts.map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      disabled={loading}
                      onClick={() => handleSendMessage(chip.prompt)}
                      className={`whitespace-nowrap px-3 py-1.5 rounded-full text-[11px] tracking-wide transition-all border shrink-0 active:scale-95 disabled:opacity-50 ${
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

              {/* Input Area */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="p-3 sm:p-3.5 bg-white dark:bg-[#161214] border-t border-[#C9A050]/30 flex items-center gap-2 shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about silk fabrics, sizes, policies, or styling..."
                  disabled={loading}
                  className="flex-1 bg-[#FAF7F2] dark:bg-[#20181B] px-3.5 py-2.5 text-xs sm:text-[13px] text-[#250409] dark:text-[#FAF7F2] placeholder-[#250409]/45 dark:placeholder-[#FAF7F2]/45 rounded-xl border border-[#C9A050]/40 focus:border-[#C9A050] focus:ring-1 focus:ring-[#C9A050]/50 focus:outline-none transition-all shadow-inner"
                />

                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  aria-label="Send message"
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-[#58111A] to-[#35070D] text-[#DFC07B] hover:brightness-110 active:scale-95 disabled:opacity-40 transition-all shrink-0 border border-[#C9A050]/60 shadow-xs cursor-pointer disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
