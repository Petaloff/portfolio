"use client";

import { animate, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";

// Number that counts up from zero the first time it scrolls into view
export function CountUp({ value, locale }: { value: number; locale: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reduce = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || !inView || reduce) return;
    const controls = animate(0, value, {
      duration: 1.4,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => (el.textContent = Math.round(v).toLocaleString(locale)),
    });
    return () => controls.stop();
  }, [inView, reduce, value, locale]);

  // Server HTML carries the real number, so crawlers and no-JS visitors see it
  return <span ref={ref}>{value.toLocaleString(locale)}</span>;
}
