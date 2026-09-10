"use client";

import { usePathname } from "next/navigation";
import { ChatPanel } from "@/components/ai/ChatPanel";

export function AiChatWidget() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  return <ChatPanel />;
}
