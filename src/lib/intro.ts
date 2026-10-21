import { sceneState, wakeScenes } from "./scene";

// The 3D home page opens on an intro: just the voxel name with the head under
// it, the page held still. A short scroll lets the sections in, scrolling back
// up past the top brings the intro back. While it is on, <html> carries
// data-intro, which hides the header and the hero text (see globals.css)

const listeners = new Set<() => void>();

export function setIntro(on: boolean) {
  // The attribute may already be there from introScript, before the flag was
  if (on) document.documentElement.dataset.intro = "";
  else delete document.documentElement.dataset.intro;
  if (sceneState.intro === on) return;
  sceneState.intro = on;
  listeners.forEach((fn) => fn());
  wakeScenes();
}

export function onIntro(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
