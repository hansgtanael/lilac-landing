/** Display-font A/B flag. "lora" is the live font (Hans, 2026-07-15 — all
 *  Playfair replaced by Lora); "fraunces" re-runs the warmer serif
 *  experiment. Wired into --font-display in layout.tsx (globals.css falls
 *  back to Lora whenever this isn't "fraunces"). */
export const DISPLAY_FONT: "fraunces" | "lora" = "lora";
