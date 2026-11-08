export type Viewport = { width: number; height: number };
export type Geometry = { x: number; y: number; width: number; height: number };

export function clampMove(
  initial: Geometry,
  delta: { x: number; y: number },
  viewport: Viewport
): Geometry {
  const minVisibleX = 132;
  const titleHeight = 48;
  const x = Math.min(viewport.width - minVisibleX, Math.max(8 - initial.width + minVisibleX, initial.x + delta.x));
  const y = Math.min(viewport.height - titleHeight, Math.max(52, initial.y + delta.y));
  return { ...initial, x, y };
}

export function clampResize(
  initial: Geometry,
  delta: { x: number; y: number },
  viewport: Viewport,
  minimum = { width: 420, height: 280 }
): Geometry {
  const maxWidth = Math.max(minimum.width, viewport.width - initial.x - 12);
  const maxHeight = Math.max(minimum.height, viewport.height - initial.y - 92);
  const width = Math.min(maxWidth, Math.max(minimum.width, initial.width + delta.x));
  const height = Math.min(maxHeight, Math.max(minimum.height, initial.height + delta.y));
  return { ...initial, width, height };
}

export function clampToViewport(geometry: Geometry, viewport: Viewport): Geometry {
  const width = Math.min(geometry.width, Math.max(360, viewport.width - 16));
  const height = Math.min(geometry.height, Math.max(260, viewport.height - 100));
  const x = Math.min(Math.max(8, geometry.x), Math.max(8, viewport.width - width - 8));
  const y = Math.min(Math.max(52, geometry.y), Math.max(52, viewport.height - height - 82));
  return { x, y, width, height };
}
