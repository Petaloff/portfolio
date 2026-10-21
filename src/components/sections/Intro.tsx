"use client";

import { useEffect, useSyncExternalStore } from "react";
import { glideTo, holdScroll } from "@/components/SmoothScroll";
import { onIntro, setIntro } from "@/lib/intro";
import { usePhone } from "@/lib/media";
import { sceneState } from "@/lib/scene";
import { useRenderMode } from "@/lib/store";

const noop = () => () => {};

// How far a wheel or a swipe has to go before the intro opens or comes back,
// in pixels; quick nudges and trackpad drift stay put
const WHEEL = 80;
const SWIPE = 50;
// The page stays held while the sections come in, so the rest of a fling
// does not carry the visitor past the hero
const SETTLE = 900;
// From the hero, the first scroll down glides on to the sections
const GLIDE = 1200;

// Runs the intro of the 3D home page (see lib/intro): it holds the page still
// until the visitor scrolls a little, and brings the intro back when they
// scroll up past the top. Visits that land mid-page skip it
export function Intro({ hint }: { hint: string }) {
  const mode = useRenderMode();
  const phone = usePhone();
  const hydrated = useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
  const active = hydrated && mode === "full" && !phone;
  const on = useSyncExternalStore(
    onIntro,
    () => sceneState.intro,
    () => false,
  );

  useEffect(() => {
    if (!active) {
      setIntro(false);
      return;
    }
    let settleUntil = 0;
    let release = 0;
    let wheel = { sum: 0, at: 0 };
    let touchY = 0;
    // When the page last reached the top: a fling that lands there does not
    // run on into the intro
    let topSince = scrollY < 2 ? performance.now() : 0;

    const show = (intro: boolean) => {
      setIntro(intro);
      settleUntil = performance.now() + SETTLE;
      wheel = { sum: 0, at: 0 };
      clearTimeout(release);
      holdScroll(true);
      if (!intro) release = window.setTimeout(() => holdScroll(false), SETTLE);
    };
    const atTop = () => scrollY < 2 && performance.now() - topSince > 400;
    const settling = () => performance.now() < settleUntil;
    // The hero, once the intro has gone: a scroll down there glides on to the
    // first section rather than stopping halfway
    const firstSection = () => document.getElementById("about");
    const inHero = () => {
      const el = firstSection();
      return !!el && scrollY < Math.min(innerHeight * 0.5, el.getBoundingClientRect().top + scrollY - 72 - 40);
    };
    const glide = () => {
      const el = firstSection();
      if (!el) return;
      settleUntil = performance.now() + GLIDE + 300;
      glideTo(el, GLIDE / 1000);
    };

    const start = !location.hash && scrollY < 2;
    setIntro(start);
    holdScroll(start);

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) return;
      if (sceneState.intro) e.preventDefault();
      if (settling()) return;
      const now = performance.now();
      if (now - wheel.at > 300) wheel.sum = 0;
      wheel.at = now;
      const dy = e.deltaY * (e.deltaMode === 1 ? 16 : 1);
      if (sceneState.intro) {
        wheel.sum = dy > 0 ? wheel.sum + dy : 0;
        if (wheel.sum > WHEEL) show(false);
      } else if (atTop() && dy < 0) {
        wheel.sum -= dy;
        if (wheel.sum > WHEEL) show(true);
      } else if (dy > 4 && inHero()) {
        e.preventDefault();
        glide();
      }
    };
    const onTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0].clientY;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (sceneState.intro) e.preventDefault();
      if (settling()) return;
      const dy = touchY - e.touches[0].clientY;
      if (sceneState.intro && dy > SWIPE) show(false);
      else if (!sceneState.intro && atTop() && dy < -SWIPE * 1.5) show(true);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && e.target.closest("input, textarea, select, [contenteditable]")) return;
      if (settling()) return;
      if (sceneState.intro && ["ArrowDown", "PageDown", "End", " "].includes(e.key)) {
        e.preventDefault();
        show(false);
      } else if (!sceneState.intro && atTop() && ["ArrowUp", "PageUp", "Home"].includes(e.key)) {
        show(true);
      } else if (!sceneState.intro && inHero() && ["ArrowDown", "PageDown", " "].includes(e.key)) {
        e.preventDefault();
        glide();
      }
    };
    // Anything else that moves the page (an anchor, the scrollbar, a restored
    // position) ends the intro
    const onScroll = () => {
      if (scrollY >= 2) topSince = 0;
      else topSince ||= performance.now();
      if (sceneState.intro && scrollY >= 2) {
        setIntro(false);
        holdScroll(false);
      }
    };
    const onHash = () => {
      if (sceneState.intro) show(false);
    };

    addEventListener("wheel", onWheel, { passive: false });
    addEventListener("touchstart", onTouchStart, { passive: true });
    addEventListener("touchmove", onTouchMove, { passive: false });
    addEventListener("keydown", onKey);
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("hashchange", onHash);
    return () => {
      removeEventListener("wheel", onWheel);
      removeEventListener("touchstart", onTouchStart);
      removeEventListener("touchmove", onTouchMove);
      removeEventListener("keydown", onKey);
      removeEventListener("scroll", onScroll);
      removeEventListener("hashchange", onHash);
      clearTimeout(release);
      setIntro(false);
      holdScroll(false);
    };
  }, [active]);

  if (!active) return null;
  return (
    <p
      aria-hidden={!on}
      className={`pointer-events-none fixed inset-x-0 bottom-8 z-30 flex flex-col items-center gap-2 font-mono text-xs tracking-[0.25em] text-muted uppercase transition-opacity duration-700 ${on ? "" : "opacity-0"}`}
    >
      {hint}
      <span className="animate-bounce text-accent" aria-hidden>
        ↓
      </span>
    </p>
  );
}
