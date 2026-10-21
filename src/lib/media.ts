"use client";

import { useSyncExternalStore } from "react";

// Media query hooks shared by the 3D pieces. The server snapshot is the
// conservative answer (phone, reduced motion) so nothing heavy renders before hydration
function useMedia(query: string, server: boolean) {
  return useSyncExternalStore(
    (onChange) => {
      const mq = matchMedia(query);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => matchMedia(query).matches,
    () => server,
  );
}

// Phones get no WebGL at all
export const phoneQuery = "(max-width: 767px)";
export const usePhone = () => useMedia(phoneQuery, true);
export const useCalm = () => useMedia("(prefers-reduced-motion: reduce)", true);
export const useCoarse = () => useMedia("(pointer: coarse)", false);
