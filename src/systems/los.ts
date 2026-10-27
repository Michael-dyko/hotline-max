import type { Rect } from "../data/levels";

function pointInRect(x: number, y: number, rect: Rect): boolean {
  return (
    x >= rect.x &&
    y >= rect.y &&
    x <= rect.x + rect.width &&
    y <= rect.y + rect.height
  );
}

export function hasLineOfSight(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  solids: Rect[],
  step: number,
): boolean {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const distance = Math.hypot(dx, dy);
  if (distance < 1) {
    return true;
  }

  const samples = Math.max(1, Math.ceil(distance / step));
  for (let i = 1; i < samples; i += 1) {
    const t = i / samples;
    const x = x1 + dx * t;
    const y = y1 + dy * t;
    for (const rect of solids) {
      if (pointInRect(x, y, rect)) {
        return false;
      }
    }
  }

  return true;
}
