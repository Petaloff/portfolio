import { useSyncExternalStore } from "react";

// Pointer position in normalised device coordinates, read by the voxel scene every frame
export const sceneState = {
  pointer: { x: 0, y: 0 },
  // performance.now() of the last easter-egg burst; the voxels scatter and reassemble
  burstAt: -Infinity,
  // id of the home page section in the middle of the screen
  section: "",
};

// The scenes render on demand, so anything that changes sceneState from outside
// wakes them up through here
const wakers = new Set<() => void>();
export function onSceneWake(fn: () => void) {
  wakers.add(fn);
  return () => {
    wakers.delete(fn);
  };
}
export function wakeScenes() {
  wakers.forEach((fn) => fn());
}

export function burst() {
  sceneState.burstAt = performance.now();
  wakeScenes();
}

// How many 3D pieces on the current page draw into the shared overlay canvas.
// The canvas only exists while at least one of them is mounted
let overlayViews = 0;
const overlayListeners = new Set<() => void>();
const notifyOverlay = () => overlayListeners.forEach((fn) => fn());

export function claimOverlay() {
  overlayViews++;
  notifyOverlay();
  return () => {
    overlayViews--;
    notifyOverlay();
  };
}

export function useOverlayViews() {
  return useSyncExternalStore(
    (fn) => {
      overlayListeners.add(fn);
      return () => {
        overlayListeners.delete(fn);
      };
    },
    () => overlayViews,
    () => 0,
  );
}
