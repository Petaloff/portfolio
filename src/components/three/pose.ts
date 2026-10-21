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

// The home page sections in order; the head swaps margins from one to the
// next, counting only those on the page (activity needs GitHub data)
const ORDER = ["about", "projects", "activity", "stack", "minecraft", "blog", "contact"];
export function headSide(section: string) {
  const shown = ORDER.filter((id) => id === section || document.getElementById(id));
  return Math.max(0, shown.indexOf(section)) % 2 === 0 ? 1 : -1;
}

// The cloud floats gently up and down, and the figure in it with it
export const cloudBob = (t: number, height: number) => Math.sin(t * 1.3) * height * 0.06;

// What the margin shows: nothing in the hero, the head beside "about me",
// then the thinking head for the rest of the page
export function headPhase(section: string): "hero" | "about" | "thinking" {
  if (scrollY / innerHeight < 0.6 || section === "") return "hero";
  return section === "about" ? "about" : "thinking";
}
