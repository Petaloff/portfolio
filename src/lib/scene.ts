// Shared state for the voxel scene: read every frame, plus a small
// subscription so DOM wrappers can react to formation changes

export type Formation = "name" | "about" | "projects" | "stack" | "blog" | "contact";

const listeners = new Set<() => void>();

export const sceneState = {
  formation: "name" as Formation,
  pointer: { x: 0, y: 0 },
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

// Sections whose content spans the full width; the scene fades back there
export const backdropFormations: Formation[] = ["projects", "blog"];
