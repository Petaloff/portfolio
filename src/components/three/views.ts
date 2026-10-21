import { useThree } from "@react-three/fiber";
import { useEffect } from "react";

// drei Views in the overlay canvas draw at this frame priority; the canvas is
// cleared just before them
export const VIEW_INDEX = 2;

// Views only move with their DOM box when a frame is drawn. Scrolling asks for
// one, but entrance animations and layout shifts move boxes without scrolling,
// so while an element is near the screen its position is watched every animation frame
export function useFollow(el: Element | null) {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    if (!el) return;
    let raf = 0;
    let last = "";
    const watch = () => {
      const r = el.getBoundingClientRect();
      const key = `${r.left}|${r.top}|${r.width}|${r.height}`;
      if (key !== last) {
        last = key;
        invalidate();
      }
      raf = requestAnimationFrame(watch);
    };
    const io = new IntersectionObserver(
      ([entry]) => {
        cancelAnimationFrame(raf);
        if (entry.isIntersecting) watch();
      },
      { rootMargin: "100px" },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [el, invalidate]);
}
