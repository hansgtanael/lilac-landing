"use client";

import { useEffect, useState } from "react";

/** SSR-safe media-query hook. Returns false on the server and the first client
 *  render (so hydration matches), reads the real value immediately on mount,
 *  then debounces subsequent crossings so dragging a window back and forth
 *  across the breakpoint doesn't thrash-remount whatever reads it. */
export function useMediaQuery(query: string, debounceMs = 250) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    setMatches(mq.matches); // immediate on mount — no debounce for the first paint
    let timer: ReturnType<typeof setTimeout>;
    const onChange = () => {
      clearTimeout(timer);
      timer = setTimeout(() => setMatches(mq.matches), debounceMs);
    };
    mq.addEventListener("change", onChange);
    return () => {
      clearTimeout(timer);
      mq.removeEventListener("change", onChange);
    };
  }, [query, debounceMs]);
  return matches;
}
