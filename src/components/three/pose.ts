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
