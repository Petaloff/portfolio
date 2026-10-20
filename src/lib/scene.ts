// Shared state for the voxel scene: read every frame, plus a small
// subscription so DOM wrappers can react to formation changes

export type Formation = "name" | "about" | "projects" | "stack" | "blog" | "contact";

const listeners = new Set<() => void>();

export const sceneState = {
  formation: "name" as Formation,
  pointer: { x: 0, y: 0 },
  // How far the active section has scrolled through the viewport centre, 0..1
  progress: 0,
};

export function setFormation(formation: Formation) {
  if (sceneState.formation === formation) return;
  sceneState.formation = formation;
  listeners.forEach((l) => l());
}

export function subscribeFormation(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// Letters of the name each side section spells out as it scrolls past, so
// reading down the page goes P-E-T, A-L-O, F-F
export const sectionLetters: Partial<Record<Formation, string>> = {
  about: "PET",
  stack: "ALO",
  contact: "FF",
};

// Sections whose content spans the full width; the scene fades back there
export const backdropFormations: Formation[] = ["projects", "blog"];
