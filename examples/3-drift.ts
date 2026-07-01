/**
 * 3-drift.ts
 *
 * 漂移核示例 — 5 帧时间线, 同一节点 confidence 在变化
 */

import { KernelDetector } from '../core';
import type { KernelState } from '../core';

const detector = new KernelDetector();
const behavior: any = {
  hoverDurations: { A: 1000 },
  clickDelays: {},
  viewCounts: {},
  recentMentions: [],
  journalTopics: [],
  history: [
    { date: '4/1', candidates: [{ nodeId: 'A', state: 'center' as KernelState, confidence: 0.8 }] },
    { date: '4/15', candidates: [{ nodeId: 'A', state: 'center' as KernelState, confidence: 0.4 }] },
    { date: '5/1', candidates: [{ nodeId: 'A', state: 'center' as KernelState, confidence: 0.2 }] },
  ],
};

const result = detector.detect([], [], behavior);
console.log('Drift result:', result);
