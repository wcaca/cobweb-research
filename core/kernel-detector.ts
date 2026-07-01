/**
 * kernel-detector.ts
 *
 * 核状态检测器 — 实时判断用户当前核的状态。
 * 输入: nodes + edges + 用户行为
 * 输出: KernelCandidate[] (1 个或多个)
 *
 * @see METHODOLOGY.md §2
 */

import type {
  KernelCandidate, KernelSignal, KernelState, KernelDetectorConfig,
} from './kernel-state';
import { DEFAULT_CONFIG } from './kernel-state';

export interface CobwebNode {
  id: string;
  label: string;
  position?: { x: number; y: number } | null;
  ringLevel: number;
  dimensions?: Array<{ key: string; score: number }>;
  metadata?: { opacity?: number };
}

export interface CobwebEdge {
  from: string;
  to: string;
  sharedDimensions: string[];
}

export interface UserBehavior {
  hoverDurations: Record<string, number>;
  clickDelays: Record<string, number>;
  viewCounts: Record<string, number>;
  recentMentions: string[];
  journalTopics: string[];
  history?: Array<{
    date: string;
    candidates: Array<{ nodeId: string; state: KernelState; confidence: number }>;
  }>;
}

function degreeOf(nodeId: string, edges: CobwebEdge[]): number {
  return edges.filter(e => e.from === nodeId || e.to === nodeId).length;
}

function centralityOf(node: CobwebNode, canvasSize = 1200): number {
  if (!node.position) return 0.5;
  const cx = canvasSize / 2;
  const cy = canvasSize / 2;
  const dx = node.position.x - cx;
  const dy = node.position.y - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const maxDist = canvasSize * 0.7;
  return 1 - Math.min(dist / maxDist, 1);
}

function fogginessOf(node: CobwebNode): number {
  if (!node.position) return 1;
  const opacity = node.metadata?.opacity ?? 1;
  return 1 - opacity;
}

export class KernelDetector {
  private config: KernelDetectorConfig;
  constructor(config: Partial<KernelDetectorConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  detect(
    nodes: CobwebNode[],
    edges: CobwebEdge[],
    behavior: UserBehavior,
  ): KernelCandidate[] {
    if (nodes.length === 0) return [];
    if (nodes.length < 3) {
      return [{
        nodeId: nodes[0].id, state: 'none', confidence: 0.5,
        signals: [], inferredAt: new Date(),
      }];
    }

    const candidates: KernelCandidate[] = [];
    for (const node of nodes) {
      const signals = this.computeSignals(node, edges, behavior);
      const totalScore = this.weightedScore(signals);
      if (totalScore > 0.5) {
        const state = this.classifyState(node, signals);
        if (state !== 'none') {
          candidates.push({
            nodeId: node.id, state,
            confidence: Math.min(totalScore, 1),
            signals, inferredAt: new Date(),
          });
        }
      }
    }

    if (candidates.length >= 2) {
      const top2 = candidates.slice(0, 2);
      if (
        top2[0].state === top2[1].state &&
        top2[0].state !== 'dual' &&
        top2[0].state !== 'drifting' &&
        top2[1].confidence > this.config.dualScoreThreshold
      ) {
        candidates.push({
          nodeId: `${top2[0].nodeId}+${top2[1].nodeId}`,
          state: 'dual',
          confidence: (top2[0].confidence + top2[1].confidence) / 2,
          signals: [...top2[0].signals, ...top2[1].signals],
          inferredAt: new Date(),
        });
      }
    }

    if (behavior.history && behavior.history.length >= 3) {
      const drift = this.detectDrift(behavior.history, candidates);
      if (drift) candidates.unshift(drift);
    }

    return candidates;
  }

  private computeSignals(
    node: CobwebNode, edges: CobwebEdge[], behavior: UserBehavior,
  ): KernelSignal[] {
    const signals: KernelSignal[] = [];
    const deg = degreeOf(node.id, edges);
    const cent = centralityOf(node);
    const fog = fogginessOf(node);
    const hover = behavior.hoverDurations[node.id] ?? 0;
    const clickDelay = behavior.clickDelays[node.id] ?? 0;
    const mentioned = behavior.recentMentions.some(m =>
      node.label.includes(m) || m.includes(node.label)
    );

    signals.push({
      source: 'degree', raw: deg,
      score: Math.min(deg / 10, 1),
      description: `节点 ${node.label} 有 ${deg} 个连接`,
    });
    signals.push({
      source: 'position', raw: cent, score: cent,
      description: cent > 0.7 ? '靠近画布中心' : cent < 0.3 ? '在画布边缘' : '中间位置',
    });
    if (hover > 0) {
      signals.push({
        source: 'hover', raw: hover,
        score: Math.min(hover / 5000, 1),
        description: `停留 ${hover}ms`,
      });
    }
    if (clickDelay > 1000) {
      signals.push({
        source: 'click_delay', raw: clickDelay,
        score: Math.min(clickDelay / 3000, 1),
        description: `点击迟疑 ${clickDelay}ms`,
      });
    }
    if (mentioned) {
      signals.push({
        source: 'mention', raw: node.label, score: 0.8,
        description: `最近提到 "${node.label}"`,
      });
    }
    return signals;
  }

  private weightedScore(signals: KernelSignal[]): number {
    const w = this.config.weights;
    const bySource = new Map<string, number>();
    for (const s of signals) {
      bySource.set(s.source, Math.max(bySource.get(s.source) ?? 0, s.score));
    }
    return (
      (bySource.get('degree') ?? 0) * w.degree +
      (bySource.get('position') ?? 0) * w.centrality +
      (bySource.get('hover') ?? 0) * w.hover +
      (bySource.get('click_delay') ?? 0) * w.click_delay +
      (bySource.get('mention') ?? 0) * w.mention
    );
  }

  private classifyState(node: CobwebNode, signals: KernelSignal[]): KernelState {
    const cent = centralityOf(node);
    const fog = fogginessOf(node);
    const degreeSignal = signals.find(s => s.source === 'degree')?.score ?? 0;
    if (fog > 0.5 && degreeSignal > 0.3) return 'fog';
    if (cent < 0.3 && degreeSignal > 0.4) return 'edge';
    if (cent > 0.6 && degreeSignal > 0.5) return 'center';
    return 'none';
  }

  private detectDrift(
    history: NonNullable<UserBehavior['history']>,
    current: KernelCandidate[],
  ): KernelCandidate | null {
    if (history.length < 3 || current.length === 0) return null;
    const currentTop = current[0];
    const last3 = history.slice(-3);
    const confidences: number[] = [];
    for (const snap of last3) {
      const match = snap.candidates.find(c => c.nodeId === currentTop.nodeId);
      if (match) confidences.push(match.confidence);
    }
    if (confidences.length < 2) return null;
    const min = Math.min(...confidences);
    const max = Math.max(...confidences);
    if (max - min > 0.3) {
      return {
        nodeId: currentTop.nodeId, state: 'drifting',
        confidence: (max + min) / 2,
        signals: currentTop.signals, inferredAt: new Date(),
      };
    }
    return null;
  }
}
