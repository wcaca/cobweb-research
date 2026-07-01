/**
 * convex-hull.ts
 *
 * 凸包算法 — gift wrapping (适合 < 100 节点)
 *
 * @see METHODOLOGY.md §4
 */

export interface Point {
  x: number;
  y: number;
}

/**
 * 计算凸包, 返回 hull 路径 (不闭合最后一点)
 */
export function convexHull(points: Point[]): Point[] {
  if (points.length < 3) return [...points];
  // 找最左下的点
  const start = points.reduce((lowest, p) =>
    p.y < lowest.y || (p.y === lowest.y && p.x < lowest.x) ? p : lowest
  );
  const hull: Point[] = [start];
  let current = start;
  // 防止无限循环
  const maxSteps = points.length * 2;
  let steps = 0;

  while (steps < maxSteps) {
    steps++;
    const candidates = points.filter(p => p !== current);
    if (candidates.length === 0) break;
    let next = candidates[0];
    for (const candidate of candidates) {
      if (next === current) {
        next = candidate;
        continue;
      }
      const cross = crossProduct(current, next, candidate);
      if (cross < 0 || (cross === 0 && dist(current, candidate) > dist(current, next))) {
        next = candidate;
      }
    }
    if (next === start) break;
    hull.push(next);
    current = next;
  }
  return hull;
}

/**
 * 加 padding: 凸包向外扩张一定距离
 */
export function expandHull(hull: Point[], padding: number, center: Point): Point[] {
  return hull.map(p => {
    const dx = p.x - center.x;
    const dy = p.y - center.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    return {
      x: p.x + (dx / len) * padding,
      y: p.y + (dy / len) * padding,
    };
  });
}

function crossProduct(o: Point, a: Point, b: Point): number {
  return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
}

function dist(a: Point, b: Point): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}
