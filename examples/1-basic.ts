/**
 * 1-basic.ts
 *
 * 基础用法 — 5 节点 + 4 边的简单蛛网
 */

import { KernelDetector, forceDirectedLayout, detectLoops, convexHull } from '../core';

const nodes = [
  { id: 'a', label: '迷茫', ringLevel: 0 },
  { id: 'b', label: '目标', ringLevel: 1 },
  { id: 'c', label: '行动', ringLevel: 1 },
  { id: 'd', label: '反馈', ringLevel: 1 },
  { id: 'e', label: '情绪', ringLevel: 1 },
];

const edges = [
  { from: 'a', to: 'b', sharedDimensions: ['E', 'A'] },
  { from: 'a', to: 'c', sharedDimensions: ['E', 'A'] },
  { from: 'a', to: 'd', sharedDimensions: ['E', 'A'] },
  { from: 'a', to: 'e', sharedDimensions: ['E', 'A'] },
];

// 1. 力导向布局
const positioned = forceDirectedLayout(nodes, edges);
console.log('Positioned nodes:', positioned);

// 2. 闭环检测
const loops = detectLoops(nodes, edges);
console.log('Loops:', loops);

// 3. 凸包
const hull = convexHull(positioned.map(p => ({ x: p.x, y: p.y })));
console.log('Hull:', hull);

// 4. 核检测
const detector = new KernelDetector();
const behavior = {
  hoverDurations: { a: 5000 },
  clickDelays: { a: 2000 },
  viewCounts: { a: 5 },
  recentMentions: ['迷茫'],
  journalTopics: [],
};
const candidates = detector.detect(nodes, edges, behavior);
console.log('Kernel candidates:', candidates);
