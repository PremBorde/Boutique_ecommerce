/**
 * Gemini AI Model Configuration
 * Centralized model designation. Swapping models is a one-line change.
 */

// Primary model: gemini-2.0-flash (swap to "gemini-1.5-flash" if quota/availability limits are reached)
export const GEMINI_MODEL_NAME = "gemini-2.0-flash";

export const GEMINI_FALLBACK_MODEL_NAME = "gemini-1.5-flash";

export const AI_CONFIG = {
  model: GEMINI_MODEL_NAME,
  fallbackModel: GEMINI_FALLBACK_MODEL_NAME,
  temperature: 0.2, // Low temperature for high factual grounding
  maxOutputTokens: 1024,
  maxToolLoops: 5,
  maxSurfacedProducts: 6,
};
