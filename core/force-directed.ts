/**
 * force-directed.ts
 *
 * 力导向布局算法 — 让连接强的节点自然聚集。
 *
 * @see METHODOLOGY.md §3
 */

import type { CobwebNode, CobwebEdge } from './kernel-detector';

export interface PositionedNode {
  id: string;
  x: number;
  y: number;
}

export interface LayoutConfig {
  /** 画布宽 */
  width: number;
  /** 画布高 */
  height: number;
  /** 模拟步数 (默认 380) */
  steps: number;
  /** 节点互推力 (默认 22000) */
  repulsion: number;
  /** 弹簧刚度 (默认 0.04) */
  springK: number;
  /** 阻尼 (默认 0.78) */
  damping: number;
  /** 向心力 (默认 0.0012) */
  centerK: number;
  /** Ring level 基础距离 (默认 110 + 180*ring) */
  ringBase: number;
  /** Ring level 距离增量 (默认 180) */
  ringStep: number;
  /** 期望距离: 130 + ringGap*35 - shared*7 */
  desiredBase: number;
  desiredRingGap: number;
  desiredShared: number;
  desiredMin: number;
  /** 边界 padding */
  padding: number;
}

export const DEFAULT_LAYOUT_CONFIG: LayoutConfig = {
  width: 1200,
  height: 760,
  steps: 380,
  repulsion: 22000,
  springK: 0.04,
  damping: 0.78,
  centerK: 0.0012,
  ringBase: 110,
  ringStep: 180,
  desiredBase: 130,
  desiredRingGap: 35,
  desiredShared: 7,
  desiredMin: 85,
  padding: 60,
};

interface SimNode {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  ringLevel: number;
}

export function forceDirectedLayout(
  nodes: CobwebNode[],
  edges: CobwebEdge[],
  config: Partial<LayoutConfig> = {},
): PositionedNode[] {
  const cfg = { ...DEFAULT_LAYOUT_CONFIG, ...config };
  if (nodes.length === 0) return [];

  // 1. 初值: ring 锁定圆环
  const pos: Record<string, SimNode> = {};
  const byRing: Record<number, CobwebNode[]> = {};
  for (const n of nodes) {
    (byRing[n.ringLevel] ??= []).push(n);
  }
  for (const [ring, arr] of Object.entries(byRing)) {
    const r = cfg.ringBase + Number(ring) * cfg.ringStep;
    arr.forEach((n, i) => {
      const angle = (i / arr.length) * Math.PI * 2 + Number(ring) * 0.4;
      pos[n.id] = {
        id: n.id,
        x: cfg.width / 2 + r * Math.cos(angle),
        y: cfg.height / 2 + r * Math.sin(angle),
        vx: 0, vy: 0,
        ringLevel: n.ringLevel,
      };
    });
  }

  // 2. 期望距离
  const desiredDist = (a: SimNode, b: SimNode, shared: number): number => {
    const ringGap = Math.abs(a.ringLevel - b.ringLevel);
    return Math.max(
      cfg.desiredMin,
      cfg.desiredBase + ringGap * cfg.desiredRingGap - shared * cfg.desiredShared,
    );
  };

  // 3. 模拟
  const ids = nodes.map(n => n.id);
  for (let step = 0; step < cfg.steps; step++) {
    // 互推
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const a = pos[ids[i]];
        const b = pos[ids[j]];
        let dx = a.x - b.x;
        let dy = a.y - b.y;
        let dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 1) {
          dist = 1; dx = Math.random() - 0.5; dy = Math.random() - 0.5;
        }
        const force = cfg.repulsion / (dist * dist);
        const nx = (dx / dist) * force;
        const ny = (dy / dist) * force;
        a.vx += nx; a.vy += ny;
        b.vx -= nx; b.vy -= ny;
      }
    }
    // 弹簧
    for (const e of edges) {
      const a = pos[e.from];
      const b = pos[e.to];
      if (!a || !b) continue;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const target = desiredDist(a, b, e.sharedDimensions.length);
      const diff = dist - target;
      const fx = (dx / dist) * diff * cfg.springK;
      const fy = (dy / dist) * diff * cfg.springK;
      a.vx += fx; a.vy += fy;
      b.vx -= fx; b.vy -= fy;
    }
    // 向心
    for (const id of ids) {
      const p = pos[id];
      p.vx += (cfg.width / 2 - p.x) * cfg.centerK;
      p.vy += (cfg.height / 2 - p.y) * cfg.centerK;
    }
    // 应用 + 阻尼 + 边界
    for (const id of ids) {
      const p = pos[id];
      p.vx *= cfg.damping;
      p.vy *= cfg.damping;
      p.x += p.vx;
      p.y += p.vy;
      p.x = Math.max(cfg.padding, Math.min(cfg.width - cfg.padding, p.x));
      p.y = Math.max(cfg.padding, Math.min(cfg.height - cfg.padding, p.y));
    }
  }

  // 4. 缩放到画布
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const id of ids) {
    const p = pos[id];
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }
  const w = (maxX - minX) || 1;
  const h = (maxY - minY) || 1;
  const scale = Math.min(
    (cfg.width - cfg.padding * 2) / w,
    (cfg.height - cfg.padding * 2) / h,
  );
  const offX = (cfg.width - w * scale) / 2 - minX * scale;
  const offY = (cfg.height - h * scale) / 2 - minY * scale;
  return ids.map(id => ({
    id,
    x: pos[id].x * scale + offX,
    y: pos[id].y * scale + offY,
  }));
}
