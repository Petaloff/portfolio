// Pointer position in normalised device coordinates, read by the voxel scene every frame
export const sceneState = {
  pointer: { x: 0, y: 0 },
  // performance.now() of the last easter-egg burst; the voxels scatter and reassemble
  burstAt: -Infinity,
};
