/** Coordinates in the frame's 1080 × 1440 design space. */
export function getFramePhotoArea(frameId?: string) {
  return { x: 60, y: frameId === 'frame-3' ? 150 : 90, size: 960 };
}
