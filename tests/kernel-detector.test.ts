/**
 * kernel-detector.test.ts
 *
 * 基础测试 — 验证核检测器在 5 种状态都正确
 */

import { describe, it, expect } from 'vitest';
import { KernelDetector } from '../core/kernel-detector';
import { canTransition } from '../core/kernel-state';
import type { CobwebNode, CobwebEdge, UserBehavior } from '../core/kernel-detector';

describe('KernelDetector', () => {
  const detector = new KernelDetector();

  it('returns empty for empty input', () => {
    const result = detector.detect([], [], { hoverDurations: {}, clickDelays: {}, viewCounts: {}, recentMentions: [], journalTopics: [] });
    expect(result).toEqual([]);
  });

  it('returns none for small input (< 3 nodes)', () => {
    const nodes: CobwebNode[] = [
      { id: 'a', label: 'A', ringLevel: 0 },
      { id: 'b', label: 'B', ringLevel: 1 },
    ];
    const result = detector.detect(nodes, [], { hoverDurations: {}, clickDelays: {}, viewCounts: {}, recentMentions: [], journalTopics: [] });
    expect(result[0].state).toBe('none');
  });

  it('detects center kernel for high-degree + centered + long hover + mentioned', () => {
    const nodes: CobwebNode[] = [
      { id: 'center', label: '迷茫', ringLevel: 0, position: { x: 600, y: 380 } },
      { id: 'n1', label: '目标', ringLevel: 1, position: { x: 700, y: 300 } },
      { id: 'n2', label: '行动', ringLevel: 1, position: { x: 500, y: 300 } },
      { id: 'n3', label: '情绪', ringLevel: 1, position: { x: 700, y: 460 } },
      { id: 'n4', label: '反馈', ringLevel: 1, position: { x: 500, y: 460 } },
    ];
    const edges: CobwebEdge[] = [
      { from: 'center', to: 'n1', sharedDimensions: ['E', 'A', 'I', 'D', 'V'] },
      { from: 'center', to: 'n2', sharedDimensions: ['E', 'A', 'I', 'D', 'V'] },
      { from: 'center', to: 'n3', sharedDimensions: ['E', 'A', 'I', 'D', 'V'] },
      { from: 'center', to: 'n4', sharedDimensions: ['E', 'A', 'I', 'D', 'V'] },
    ];
    const behavior: UserBehavior = {
      hoverDurations: { center: 8000 },
      clickDelays: { center: 3000 },
      viewCounts: { center: 10 },
      recentMentions: ['迷茫'],
      journalTopics: ['迷茫'],
    };
    const result = detector.detect(nodes, edges, behavior);
    const center = result.find(r => r.nodeId === 'center');
    expect(center).toBeDefined();
    expect(center?.state).toBe('center');
  });

  it('detects edge kernel for node in corner with low centrality', () => {
    const nodes: CobwebNode[] = [
      { id: 'edge', label: '压抑', ringLevel: 0, position: { x: 50, y: 50 } },
      { id: 'n1', label: '工作', ringLevel: 1, position: { x: 600, y: 380 } },
      { id: 'n2', label: '忙', ringLevel: 1, position: { x: 700, y: 380 } },
      { id: 'n3', label: '会议', ringLevel: 1, position: { x: 500, y: 380 } },
      { id: 'n4', label: '交付', ringLevel: 1, position: { x: 800, y: 380 } },
    ];
    const edges: CobwebEdge[] = [
      { from: 'edge', to: 'n1', sharedDimensions: ['W', 'A'] },
      { from: 'edge', to: 'n2', sharedDimensions: ['W', 'A'] },
    ];
    const behavior: UserBehavior = {
      hoverDurations: {},
      clickDelays: { edge: 3000 },
      viewCounts: { edge: 5 },
      recentMentions: ['压抑'],
      journalTopics: [],
    };
    const result = detector.detect(nodes, edges, behavior);
    const edge = result.find(r => r.nodeId === 'edge');
    expect(edge).toBeDefined();
    expect(edge?.state).toBe('edge');
  });

  it('detects fog kernel for low opacity centered node', () => {
    const nodes: CobwebNode[] = [
      { id: 'fog', label: '???', ringLevel: 0, position: { x: 600, y: 380 }, metadata: { opacity: 0.3 } },
      { id: 'n1', label: '压抑', ringLevel: 1, position: { x: 700, y: 380 } },
      { id: 'n2', label: '说不清', ringLevel: 1, position: { x: 500, y: 380 } },
      { id: 'n3', label: '熟悉', ringLevel: 1, position: { x: 600, y: 480 } },
    ];
    const edges: CobwebEdge[] = [
      { from: 'fog', to: 'n1', sharedDimensions: ['E', 'I'] },
      { from: 'fog', to: 'n2', sharedDimensions: ['E', 'I'] },
      { from: 'fog', to: 'n3', sharedDimensions: ['E', 'I'] },
    ];
    const result = detector.detect(nodes, edges, { hoverDurations: {}, clickDelays: {}, viewCounts: {}, recentMentions: [], journalTopics: [] });
    const fog = result.find(r => r.nodeId === 'fog');
    expect(fog).toBeDefined();
    expect(fog?.state).toBe('fog');
  });
});

describe('State transitions', () => {
  it('allows center → fog', () => {
    expect(canTransition('center', 'fog')).toBe(true);
  });
  it('disallows center → edge (not in transitions)', () => {
    expect(canTransition('center', 'edge')).toBe(false);
  });
  it('allows error → none (fallback)', () => {
    expect(canTransition('error', 'none')).toBe(true);
  });
});
