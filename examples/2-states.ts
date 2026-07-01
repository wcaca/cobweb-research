/**
 * 2-states.ts
 *
 * 5 种核状态的模拟 — 同一个拓扑, 不同行为输入
 */

import { KernelDetector } from '../core';
import type { CobwebNode, CobwebEdge, UserBehavior } from '../core';

const baseNodes: CobwebNode[] = [
  { id: 'core', label: '迷茫', ringLevel: 0, position: { x: 600, y: 380 } },
  { id: 'p1', label: '目标', ringLevel: 1, position: { x: 700, y: 300 } },
  { id: 'p2', label: '行动', ringLevel: 1, position: { x: 500, y: 300 } },
  { id: 'p3', label: '反馈', ringLevel: 1, position: { x: 700, y: 460 } },
  { id: 'p4', label: '情绪', ringLevel: 1, position: { x: 500, y: 460 } },
];
const baseEdges: CobwebEdge[] = [
  { from: 'core', to: 'p1', sharedDimensions: ['E', 'A', 'I', 'D', 'V'] },
  { from: 'core', to: 'p2', sharedDimensions: ['E', 'A', 'I', 'D', 'V'] },
  { from: 'core', to: 'p3', sharedDimensions: ['E', 'A', 'I', 'D', 'V'] },
  { from: 'core', to: 'p4', sharedDimensions: ['E', 'A', 'I', 'D', 'V'] },
];

const baseBehavior: UserBehavior = {
  hoverDurations: {},
  clickDelays: {},
  viewCounts: {},
  recentMentions: [],
  journalTopics: [],
};

const detector = new KernelDetector();

// State 1: 中心
console.log('--- 中心核 (center) ---');
const centerNodes = baseNodes.map(n => ({ ...n, position: n.position ?? { x: 600, y: 380 } }));
const c1 = detector.detect(centerNodes, baseEdges, {
  ...baseBehavior,
  hoverDurations: { core: 5000 },
  recentMentions: ['迷茫'],
});
console.log(c1);

// State 2: 边缘
console.log('\n--- 边缘核 (edge) ---');
const edgeNodes: CobwebNode[] = [
  { ...baseNodes[0], position: { x: 50, y: 50 } },
  { ...baseNodes[1], position: { x: 600, y: 380 } },
  { ...baseNodes[2], position: { x: 700, y: 380 } },
  { ...baseNodes[3], position: { x: 800, y: 380 } },
  { ...baseNodes[4], position: { x: 900, y: 380 } },
];
const c2 = detector.detect(edgeNodes, [{ from: 'core', to: 'p1', sharedDimensions: ['W'] }], {
  ...baseBehavior,
  clickDelays: { core: 2500 },
});
console.log(c2);

// State 3: 模糊
console.log('\n--- 模糊核 (fog) ---');
const fogNodes: CobwebNode[] = baseNodes.map(n => ({
  ...n,
  metadata: { opacity: 0.3 },
}));
const c3 = detector.detect(fogNodes, baseEdges, baseBehavior);
console.log(c3);
