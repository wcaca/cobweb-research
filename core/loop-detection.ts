/**
 * loop-detection.ts
 *
 * 闭环检测 — 找所有长度 >= 3 的环, 用强连通分量算法。
 *
 * @see METHODOLOGY.md §5
 */

import type { CobwebNode, CobwebEdge } from './kernel-detector';

export interface Loop {
  id: string;
  nodeIds: string[];
  /** 完整度 0-100, 表示环覆盖了多少相关的维度 */
  completeness: number;
  /** 维度覆盖 0-100 */
  dimensionCoverage: number;
  /** 是否闭合 (>= 3 节点且互相强连接) */
  isClosed: boolean;
}

/**
 * 找所有长度 3-6 的环 (DFS 限制深度, 避免指数爆炸)
 */
export function detectLoops(
  nodes: CobwebNode[],
  edges: CobwebEdge[],
  maxDepth = 6,
): Loop[] {
  const adj: Record<string, Set<string>> = {};
  for (const n of nodes) adj[n.id] = new Set();
  for (const e of edges) {
    adj[e.from]?.add(e.to);
    adj[e.to]?.add(e.from);
  }

  const loops: Loop[] = [];
  const seen = new Set<string>();

  for (const start of nodes) {
    const path: string[] = [start.id];
    const visited = new Set<string>([start.id]);
    dfs(start.id, path, visited, adj, loops, seen, maxDepth);
  }
  return loops;
}

function dfs(
  current: string,
  path: string[],
  visited: Set<string>,
  adj: Record<string, Set<string>>,
  loops: Loop[],
  seen: Set<string>,
  maxDepth: number,
) {
  if (path.length > maxDepth) return;
  const start = path[0];
  for (const next of (adj[current] ?? new Set())) {
    if (next === start && path.length >= 3) {
      // 找到一个环
      const key = [...path].sort().join(',');
      if (seen.has(key)) continue;
      seen.add(key);
      loops.push({
        id: `loop-${key.slice(0, 16)}`,
        nodeIds: [...path],
        completeness: 100,
        dimensionCoverage: 100,
        isClosed: true,
      });
      continue;
    }
    if (visited.has(next)) continue;
    visited.add(next);
    path.push(next);
    dfs(next, path, visited, adj, loops, seen, maxDepth);
    path.pop();
    visited.delete(next);
  }
}
