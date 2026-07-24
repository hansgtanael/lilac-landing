"use client";

import { useReducedMotion as useMotionReducedMotion } from "motion/react";

/**
 * Thin wrapper over Motion's useReducedMotion that normalizes the nullable
 * return to a strict boolean. Returns true when the user has asked the OS to
 * minimize motion, so every animated component can branch on a single value.
 */
export function useReducedMotion(): boolean {
  return useMotionReducedMotion() ?? false;
}
