# METHODOLOGY · 方法论

> 蛛网图谱的整套方法论。
> 这是一份**活的文档**, 每次 commit 都有可能更新。

---

## 0 · 核心命题 (Core Thesis)

### 0.1 核是觉察, 不是结构

| 错误假设 | 正确假设 |
|----|----|
| 核 = 节点的位置 (中心/边缘) | 核 = 用户**此刻注意到的那个** |
| 核 = 节点的大小 (degree 最大) | 核 = 用户**正在觉察**的那个 |
| 核 = 节点的颜色 (Ring 0 紫色) | 核 = 用户**此刻能说出名字**的那个 |
| 核是固定的 | 核会**漂移**, 反复, 模糊, 分裂 |

### 0.2 AI 是镜子, 不是鉴定师

- **不说**: "你的核是 X"
- **不说**: "你应该打开 X"
- **不说**: "让我帮你看清楚 X"
- **只说**: "你刚才犹豫了 3 秒才点开它"
- **只说**: "你不用现在说出名字, 雾化本身就是个阶段"
- **只说**: "你愿意展开它, 还是先看别的?"

### 0.3 任何节点都可能是核

核不是预设的结构属性, 是动态的认知状态。这意味着:
- 同一个网络拓扑, 不同用户看到不同的核
- 同一个用户的同一张图, 不同时间看到不同的核
- AI 不能 "标" 出核, 只能 "陪" 用户看见核

---

## 1 · 5 种核的状态 (Kernel States)

### 1.1 状态机

```
                    ┌──── 漂移中 ────┐
                    │                │
                    ▼                │
    ┌──── center ───┐                │
    │  (中心核)     │                │
    └───────┬───────┘                │
            │                        │
   ┌────────┴────────┐               │
   ▼                 ▼               │
┌──────┐       ┌──────┐         ┌──────┐
│ fog  │  ←→  │ edge │   →   │drifting│
│(模糊)│       │(边缘)│         │ (漂移)│
└──┬───┘       └──┬───┘         └──────┘
   │              │
   ▼              ▼
┌──────────────────────┐
│       dual           │
│    (双核 - 不确定)    │
└──────────┬───────────┘
           │
           ▼
        ┌──────┐
        │ none │
        │(无核)│
        └──────┘
```

### 1.2 状态定义

#### 1.2.1 `center` (中心核 · 已觉察)
- 节点 degree 最高 + 位置中心 + 用户停留最长
- 视觉: 大节点在画布中心, 深填充
- Mavis 不主动说 (这是你自然长出来的)

#### 1.2.2 `edge` (边缘核 · 被压抑)
- 位置在角落 + 距离 > 平均 2x + 1-2 弱连接
- 视觉: 大节点在角落, dashed 弱边
- Mavis: "你刚才犹豫了 3 秒才点开它"

#### 1.2.3 `fog` (模糊核 · 浮现中)
- 中心位置有节点但透明度 < 0.5 + 周围 3+ 节点指向
- 视觉: 中心节点用 blur 滤镜 + opacity 0.3-0.5
- Mavis: "你不用现在说出名字, 雾化本身就是个阶段"

#### 1.2.4 `dual` (双核 · 不确定)
- 2 个节点都满足中心条件 + cluster 重叠度 < 30%
- 视觉: 2 个半透明核重叠, 中间虚线连接
- Mavis: "双核不一定是问题, 可能它们是一回事"

#### 1.2.5 `drifting` (漂移核 · 转移中)
- 同一节点 center-confidence 在 5 帧里变化 > 30%
- 视觉: 5 帧时间线, 节点位置/大小在变化
- Mavis: "你的核, 这 2 个月, 走了一条路"

#### 1.2.6 `none` (无核 · 未觉察)
- 没有明显中心节点 + 所有 degree 接近
- 视觉: 节点大小均匀
- Mavis: "你今天不需要有核"

---

## 2 · 检测算法 (Detection)

### 2.1 输入

```typescript
interface DetectionInput {
  nodes: Node[]
  edges: Edge[]
  behavior: UserBehavior
}
```

### 2.2 评分公式

```
score = degree*0.25 + centrality*0.15 + hover*0.25 + clickDelay*0.20 + mention*0.15
```

### 2.3 状态判定

```typescript
if (fog > 0.5 && degreeSignal > 0.3) → 'fog'
if (cent < 0.3 && degreeSignal > 0.4) → 'edge'
if (cent > 0.6 && degreeSignal > 0.5) → 'center'
if (top2 same state & high conf)    → 'dual'
if (history confidence delta > 0.3) → 'drifting'
otherwise                           → 'none'
```

---

## 3 · 力导向布局 (Force-Directed)

### 公式

```typescript
for step in 1..380:
  for each pair (a, b):
    applyRepulsion(REPULSION=22000)
  for each edge (a, b):
    applySpring(target = 130 + 35*ringGap - 7*shared)
  applyCenterGravity(0.0012)
  applyDamping(0.78)
```

### 收敛后缩放

- 找 bounding box, scale 到 1200x760 画布
- 留 60 边界

---

## 4 · 凸包 (Convex Hull)

### gift wrapping

```typescript
function convexHull(points) {
  start = points.sortBy(y).first
  hull = [start]
  current = start
  while true:
    next = points except current 中最 clockwise 的点
    if next == start: break
    hull.push(next)
    current = next
  return hull
}
```

### 用途

- 凸包 = cluster 的"外壳"
- padding 让 hull 包住节点 + badge
- 让用户**一眼看出** group 边界

---

## 5 · 闭环检测 (Loop Detection)

### 强连通分量 (Tarjan / Kosaraju)

```typescript
function detectLoops(nodes, edges) {
  // 找所有长度 >= 3 的环
  // 给每个环打分 (completeness, dimensionCoverage)
  // 标记 isClosed
}
```

### 视觉

- 多边形 (用环上的节点位置) — `polygon` SVG
- 半透明填充 + dashed 描边
- 中心 label: `⊗ 闭环N节点`

---

## 6 · 时间轴 (Time Axis)

### 数据结构

```typescript
interface TimelineSnapshot {
  date: string
  nodeCount: number
  edgeCount: number
  loopCount: number
  closedLoopCount: number
  topNode: { id: string, label: string, degree: number }
}
```

### 渲染

- 渐变线 (从绿到金)
- 7 个时间点 (每月 1 + 15)
- "now" 点强调 (橙色 + scale 1.2)

---

## 7 · 失败 fallback

| 失败 | fallback |
|----|----|
| AI 不返数据 | 显示 "无核" 状态 |
| 节点数据 < 3 | 强制 `none` |
| 行为数据缺失 | 跳过行为权重, 只用结构 |
| 凸包计算失败 | 不画 hull, 改画多边形 |
| 力导向不收敛 (1000 步) | 截断, 用当前状态 |

### 8 个 renderer

每个 state → 1 个 renderer, 失败 → 下一个状态, 永远不报错。

---

## 8 · 未来扩展

| 想法 | 状态 |
|----|----|
| 任意核 (no-structure) | idea |
| 核的元认知 (用户对核的态度) | idea |
| 多用户对比 | idea |
| 核的 3D 化 (z 轴 = 时间) | research |
| 声音化的核 | research |
| 核的 NLP 抽取 | research |
| 核的群体涌现 | future |

---

**last updated**: 2026-07-01 (v0.1 · 5 states · 7 principles · 4 algorithms)
**next review**: 收集 5 个真实用户行为后, 调整检测权重
