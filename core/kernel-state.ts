/**
 * kernel-state.ts
 *
 * 核的状态机 — 5 种状态 + none + loading + error。
 * 这是 v0.1 接口, 持续迭代。
 *
 * @see METHODOLOGY.md §1
 */

export type KernelState =
  | 'center'
  | 'edge'
  | 'fog'
  | 'dual'
  | 'drifting'
  | 'none'
  | 'loading'
  | 'error';

export interface KernelCandidate {
  nodeId: string;
  state: KernelState;
  confidence: number;
  signals: KernelSignal[];
  inferredAt: Date;
}

export interface KernelSignal {
  source: 'degree' | 'position' | 'hover' | 'click_delay' | 'mention' | 'cluster' | 'history';
  raw: number | string;
  score: number;
  description: string;
}

export interface KernelDetectorConfig {
  centerDegreeThreshold: number;
  edgeDistanceRatio: number;
  fogOpacityThreshold: number;
  dualScoreThreshold: number;
  driftingWindow: number;
  weights: {
    degree: number;
    centrality: number;
    hover: number;
    click_delay: number;
    mention: number;
  };
}

export const DEFAULT_CONFIG: KernelDetectorConfig = {
  centerDegreeThreshold: 5,
  edgeDistanceRatio: 0.3,
  fogOpacityThreshold: 0.5,
  dualScoreThreshold: 0.7,
  driftingWindow: 5,
  weights: {
    degree: 0.25,
    centrality: 0.15,
    hover: 0.25,
    click_delay: 0.20,
    mention: 0.15,
  },
};

export const STATE_TRANSITIONS: Record<KernelState, KernelState[]> = {
  center: ['fog', 'drifting', 'none'],
  edge: ['center', 'fog', 'none'],
  fog: ['center', 'edge', 'dual', 'none'],
  dual: ['center', 'edge', 'fog', 'none'],
  drifting: ['center', 'edge', 'fog', 'dual', 'none'],
  none: ['fog', 'edge', 'center'],
  loading: ['none', 'center', 'edge', 'fog', 'dual', 'drifting', 'error'],
  error: ['loading', 'none'],
};

export function canTransition(from: KernelState, to: KernelState): boolean {
  return STATE_TRANSITIONS[from]?.includes(to) ?? false;
}
