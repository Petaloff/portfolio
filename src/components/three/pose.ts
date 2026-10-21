import { sceneState } from "@/lib/scene";

// The page content column (max-w-6xl); side figures sit in the margin beside it
const CONTENT_WIDTH = 1152;

export const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

// Where a figure beside the content goes, in world units. Wide screens have
// room in the margin; elsewhere it stays behind the windows, dimmed so the
// text keeps reading well
export function sidePose(viewport: { width: number }, size: { width: number }) {
  const px = viewport.width / size.width;
  const margin = (size.width - Math.min(size.width, CONTENT_WIDTH)) / 2;
  const roomy = margin >= 240;
  return {
    px,
    margin,
    roomy,
    x: (roomy ? size.width / 2 - margin / 2 : size.width * 0.36) * px,
    width: (roomy ? margin * 0.7 : size.width * 0.18) * px,
  };
}

// Scale that fits a turning solid of this size into the side slot
export function fitSide(
  layout: { width: number; height: number; depth: number },
  slot: number,
  height: number,
  roomy: boolean,
) {
  return Math.min(slot / Math.hypot(layout.width, layout.depth), (height * (roomy ? 0.4 : 0.3)) / layout.height);
}

// The head's thought cloud: pixel rows extruded into a flat voxel puff, like a Minecraft cloud
export const CLOUD = [
  "      ######        ",
  "    ##########  ##  ",
  "   ################ ",
  " ###################",
  "####################",
  "####################",
  "####################",
  " ################## ",
  "  ######## #######  ",
  "    ####     ###    ",
];
const CLOUD_ASPECT = CLOUD.length / CLOUD[0].length;

// Below the "about me" section the head sinks a little and thinks: a cloud
// above it holds the current section's figure. side is 1 for the right margin
// and -1 for the left one. Sizes and centres in world units
export function thoughtPose(viewport: { width: number; height: number }, size: { width: number }, side = 1) {
  const slot = sidePose(viewport, size);
  const vh = viewport.height;
  const width = Math.min(slot.width, vh * 0.5);
  const height = width * CLOUD_ASPECT;
  const x = slot.x * side;
  return {
    ...slot,
    x,
    cloud: { x, y: vh * 0.14, width, height },
    // Room for the figure inside the cloud, clear of its bumpy edge
    inner: { width: width * 0.62, height: height * 0.58 },
    head: { x: x + width * 0.12 * side, y: -vh * 0.22, width: Math.min(slot.width * 0.55, vh * 0.26) },
  };
}

// The intro: the name a little above the middle of the screen, the head under it.
// Centres and sizes in world units
export function introPose(viewport: { width: number; height: number }) {
  const vh = viewport.height;
  return {
    name: { y: vh * 0.16, width: viewport.width * 0.8, height: vh * 0.26 },
    head: { y: -vh * 0.19, height: vh * 0.28 },
  };
}

// The home page sections in order; the head swaps margins from one to the
// next, counting only those on the page (activity needs GitHub data). It
// stands on the right beside the hero, so "about me" starts on the left
const ORDER = ["about", "projects", "activity", "stack", "minecraft", "blog", "contact"];
export function headSide(section: string) {
  const shown = ORDER.filter((id) => id === section || document.getElementById(id));
  return Math.max(0, shown.indexOf(section)) % 2 === 0 ? -1 : 1;
}

// Shared between the head, its cloud and the figure in it: the cloud only pops
// up once the head has landed, and the figure only forms once the cloud is up
// (cloud runs from 0, gone, to 1, fully shown)
// side is the margin the cloud is drawn in, which lags the head while it bursts
export const headState = { flying: false, cloud: 0, side: 1 };

// The cloud floats gently up and down, and the figure in it with it
export const cloudBob = (t: number, height: number) => Math.sin(t * 1.3) * height * 0.06;

// Where the head is: under the name in the intro, beside the hero text, beside
// "about me", then thinking for the rest of the page
export function headPhase(section: string): "intro" | "hero" | "about" | "thinking" {
  if (sceneState.intro) return "intro";
  if (scrollY / innerHeight < 0.6 || section === "") return "hero";
  return section === "about" ? "about" : "thinking";
}

// A critically damped spring: unlike plain damping it starts from rest and
// keeps its velocity through a change of target, so flights ease in and out
// without jerks. omega sets the speed (settles in about 5 / omega seconds)
export type Spring = { x: number; v: number };
export function spring(s: Spring, target: number, omega: number, dt: number) {
  const d = s.x - target;
  const e = Math.exp(-omega * dt);
  const k = s.v + omega * d;
  s.x = target + (d + k * dt) * e;
  s.v = (s.v - omega * k * dt) * e;
  return s.x;
}
