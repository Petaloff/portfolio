// Shared, non-reactive state read by the voxel scene every frame

export type Formation = "name" | "about" | "projects" | "stack" | "blog" | "contact";

export const sceneState = {
  formation: "name" as Formation,
  pointer: { x: 0, y: 0 },
};
