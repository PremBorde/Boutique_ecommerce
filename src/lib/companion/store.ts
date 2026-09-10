import { create } from "zustand";
import {
  CompanionProductInput,
  CompanionSignalContext,
  resolveCompanionOpinion,
} from "./opinions";

interface CompanionState {
  activeOpinion: string | null;
  activeSignal: string | null;
  promptSeed: string | null;
  lastProduct: CompanionProductInput | null;
  isBubbleVisible: boolean;
  isDisabled: boolean;
  lastSpokenTimestamp: number;

  // Actions
  triggerOpinion: (
    product: CompanionProductInput,
    context?: CompanionSignalContext
  ) => void;
  dismissBubble: () => void;
  toggleDisabled: () => void;
  clearOpinion: () => void;
}

// Minimum 4.5s debounce between unprompted commentary
const MIN_INTERVAL_MS = 4500;

export const useCompanionStore = create<CompanionState>((set, get) => ({
  activeOpinion: null,
  activeSignal: null,
  promptSeed: null,
  lastProduct: null,
  isBubbleVisible: false,
  isDisabled:
    typeof window !== "undefined"
      ? localStorage.getItem("zaria_companion_disabled") === "true"
      : false,
  lastSpokenTimestamp: 0,

  triggerOpinion: (product, context = {}) => {
    const { isDisabled, lastSpokenTimestamp, isBubbleVisible, lastProduct } =
      get();

    if (isDisabled) return;

    const now = Date.now();
    // Allow immediate trigger if this is an explicit add-to-cart action or variant selection on the same product
    const isSpecialAction =
      context.isCartAction ||
      (context.selectedColor && lastProduct?.id === product.id);

    if (!isSpecialAction && now - lastSpokenTimestamp < MIN_INTERVAL_MS) {
      // Still update the last hovered product for click-to-escalate context, but don't show a new bubble
      set({ lastProduct: product });
      return;
    }

    const { opinion, signalSource, promptSeed } = resolveCompanionOpinion(
      product,
      context
    );

    set({
      activeOpinion: opinion,
      activeSignal: signalSource,
      promptSeed,
      lastProduct: product,
      isBubbleVisible: false,
      lastSpokenTimestamp: now,
    });
  },

  dismissBubble: () => {
    set({ isBubbleVisible: false });
  },

  clearOpinion: () => {
    set({
      activeOpinion: null,
      activeSignal: null,
      isBubbleVisible: false,
    });
  },

  toggleDisabled: () => {
    const next = !get().isDisabled;
    if (typeof window !== "undefined") {
      localStorage.setItem("zaria_companion_disabled", String(next));
    }
    set({
      isDisabled: next,
      isBubbleVisible: next ? false : get().isBubbleVisible,
    });
  },
}));
