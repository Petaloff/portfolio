"use client";

import { useSyncExternalStore } from "react";

// Tiny localStorage-backed stores shared by client components

function createStore<T extends string>(key: string, resolve: (saved: string | null) => T, server: T) {
  const listeners = new Set<() => void>();
  let value: T | null = null;

  const read = () => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  };

  return {
    get(): T {
      if (value === null) value = resolve(read());
      return value;
    },
    set(next: T) {
      value = next;
      try {
        localStorage.setItem(key, next);
      } catch {}
      listeners.forEach((l) => l());
    },
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    server,
  };
}

function useStore<T extends string>(store: ReturnType<typeof createStore<T>>) {
  return useSyncExternalStore(store.subscribe, store.get, () => store.server);
}

export type RenderMode = "full" | "lite";

function detectMode(): RenderMode {
  const fine = matchMedia("(pointer: fine)").matches;
  const wide = innerWidth >= 768;
  const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
  let webgl = false;
  try {
    webgl = !!document.createElement("canvas").getContext("webgl2");
  } catch {}
  // Touch tablets get 3D too when they look strong enough; the scenes swap
  // the cursor for the gyroscope there
  const cores = navigator.hardwareConcurrency ?? 4;
  const pointer = fine || cores >= 4;
  return pointer && wide && !calm && memory >= 4 && webgl ? "full" : "lite";
}

export const modeStore = createStore<RenderMode>(
  "render-mode",
  (saved) => (saved === "full" || saved === "lite" ? saved : detectMode()),
  "lite",
);
export const useRenderMode = () => useStore(modeStore);

export type Consent = "granted" | "denied" | "unset";

export const consentStore = createStore<Consent>(
  "analytics-consent",
  (saved) => (saved === "granted" || saved === "denied" ? saved : "unset"),
  "denied",
);
export const useConsent = () => useStore(consentStore);
