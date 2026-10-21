"use client";

import { AnimatePresence, motion } from "motion/react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { sceneState } from "@/lib/scene";

const KONAMI = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];
const GIVE = "/give";

// Pseudo-random but stable layout for the falling voxels
const drops = Array.from({ length: 36 }, (_, i) => ({
  left: (Math.sin(i * 91.7) * 0.5 + 0.5) * 100,
  delay: (i % 9) * 0.07,
  size: 10 + (i % 4) * 6,
  accent: i % 5 === 0,
  spin: (i % 2 ? 1 : -1) * (90 + (i % 3) * 90),
}));

// Konami code or typing "/give" scatters the 3D voxels and rains blocks
export function EasterEgg() {
  const t = useTranslations("easter");
  const [run, setRun] = useState(0);

  useEffect(() => {
    let konami = 0;
    let typed = "";
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("input, textarea, [contenteditable]")) return;
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      konami = key === KONAMI[konami] ? konami + 1 : key === KONAMI[0] ? 1 : 0;
      typed = (typed + (e.key.length === 1 ? e.key : "")).slice(-GIVE.length);
      if (konami === KONAMI.length || typed === GIVE) {
        konami = 0;
        typed = "";
        sceneState.burstAt = performance.now();
        setRun((r) => r + 1);
      }
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!run) return;
    const id = setTimeout(() => setRun(0), 4000);
    return () => clearTimeout(id);
  }, [run]);

  return (
    <AnimatePresence>
      {run > 0 && (
        <motion.div key={run} className="pointer-events-none fixed inset-0 z-50 overflow-hidden" exit={{ opacity: 0 }}>
          {drops.map((d, i) => (
            <motion.span
              key={i}
              className={`absolute top-0 ${d.accent ? "bg-accent" : "bg-fg"}`}
              style={{ left: `${d.left}%`, width: d.size, height: d.size }}
              initial={{ y: -40, rotate: 0, opacity: 1 }}
              animate={{ y: "105vh", rotate: d.spin, opacity: [1, 1, 0] }}
              transition={{ duration: 2.4, delay: d.delay, ease: [0.4, 0, 0.9, 0.6] }}
            />
          ))}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-6 left-4 bg-black/70 px-3 py-1.5 font-mono text-sm text-[#e8e8e8] md:left-8"
          >
            <span className="text-accent">[Petaloff]</span> {t("given")}
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
