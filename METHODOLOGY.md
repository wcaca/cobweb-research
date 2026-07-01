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

---

## 9 · Reflective Feedback Loop (RFL) · 反思反馈闭环

> **这是这个研究**本身**的性质, 不是它的"方法"**。
> 
> cobweb / 5 状态 / 检测算法 / 凸包 / 闭环检测, 都是 RFL 的**具体形态**。
> RFL 是**本体**, 这些是**实例**。

### 9.1 一句话定义

**Reflective Feedback Loop** = 一个**用户-系统-用户**的可视化闭环, 其中:
- 系统的输出 = 用户的输入 (可视化)
- 用户的输入 = 系统的输出 (交互)
- 闭环里流动的不是数据, 是 **觉察**
- 闭环被**用户自己**观测 (不是第三方)
- 闭环反映**此时此刻**的真实 (不是 mock)
- 闭环有反馈闭合 (你动 → 它变 → 你看见 → 你再动)

### 9.2 5 个层面 (Layers) · 同一个"我"的 5 个视角

| 层面 | 英文 | 问的是什么 | 例子 |
|----|----|----|----|
| **意识** | Phenomenal | "我**感觉到**什么" | "我刚才犹豫了 3 秒" |
| **知识** | Knowledge | "我**知道**什么" | "我有 16 节点, 中心是迷茫" |
| **行为** | Behavioral | "我**做了什么**" | "我点击了 X, 停留 5000ms" |
| **时间** | Temporal | "我**从哪到哪**" | "3 个月前 4 节点, 现在 20" |
| **关系** | Relational | "我和**谁**一起看" | "Mavis 陪我, 跟朋友提过一次" |

**关键**:
- 这 5 层**同时存在**, 是同一个 "我" 的不同角度
- 任何"真实"的产品**至少要触及 2 层**
- 单层 = 假闭环 (是数据可视化, 不是 RFL)

### 9.3 5 个特征 (Properties) · RFL 必须是

| 特征 | 含义 | 反例 |
|----|----|----|
| **可视化** Visible | 闭环里信息**能被画出来** | 返 JSON 用户看不懂 |
| **真实** Truthful | 反映**此刻**真实情况 | "假设你有个核叫 X" 这种 prompt |
| **被观测** Observed | **用户自己**看自己 | Mavis 给个用户研究报告让运营看 |
| **可交互** Interactive | 用户能**改**, 改有**回应** | 系统只读不改, 或改完没回应 |
| **反馈闭合** Closed | 操作 → 数据 → 视图 → 觉察 → 操作, 闭环 | 操作完结束, 没回流 |

**5 个**全部满足才是 RFL。**少 1 个**就不是 RFL, 是某种更简单的东西 (工具 / 玩具 / 报表)。

### 9.4 RFL 的核心洞察

#### 9.4.1 观察者 = 被观察者

在 RFL 里:
- 你看你的拓扑 (你是观察者)
- 你的拓扑反映你 (你是被观察者)
- **同一个对象**

量子物理叫"观察者效应", 意识研究叫"自我觉知", 这里叫 RFL。

> **看见本身就是改变**。
> 你不需要"修复"你的核。看见它, 它已经在变。

这是 Mavis 为什么是**镜子不是鉴定师**的根本原因。

#### 9.4.2 闭环里流动的是什么?

| 名称 | 流向 |
|----|----|
| 数据流 | journal → DB → API → 组件 → 像素 |
| 觉察流 | 这一刻我感到这个 → 我看见 → 我的核变了一点 → 我现在感到另一个 |

**两条流并行, 但觉察流驱动数据流。**

RFL 的目标不是优化数据流, 是让**觉察流**真的发生。

### 9.5 设计约束 (Hard Constraints)

**任何新功能要进终态, 必须**:
1. ✅ 至少触及 2 个层面 (不是单层)
2. ✅ 用真实数据 (不 mock)
3. ✅ 用户能看见 (不后台跑)
4. ✅ 用户能改 (不只读)
5. ✅ 改了有反馈 (不单向)

**不满足 5 条** → 不进终态。这是**硬约束**, 跟"5 状态 + 7 原则"同等级别。

### 9.6 跟现有概念的区别

| 概念 | 不同点 |
|----|----|
| 数据可视化 | 看数据, 没有"我", 没有意识层 |
| AI 助手 | 它看你, 不是你看自己 |
| 用户研究 | 第三方观察, 不是自我观察 |
| 冥想 App | 内观, 没有可视化, 没有知识层 |
| 日记 App | 写而已, 不形成拓扑 / 不反馈 |
| 习惯追踪 | 量化, 但没意识层 / 没核 |
| 聊天机器人 | 对话, 不闭环, 不形成知识图 |

**RFL 的独特性** = **多视角同时** + **自我观测** + **可视化闭环** + **真实可交互**

---

## 10 · The Two Layers · 本体层 vs 方法层

> RFL 既跟**产品设计相关**, 又跟**产品本身相关**。
> 这不是矛盾的, 是**双层结构**。

### 10.1 三层架构

```
实现层 (Implementation)  ←  cobweb / journal / profile / 6 capability
方法层 (Methodology)     ←  RFL 5 特征 + 5 层面 (设计指南)
本体层 (Ontology)        ←  "这个产品就是 RFL" (manifesto, 不可改)
```

**越上层越硬**:
- 改实现层: 升级 (新算法, 新 UI)
- 改方法层: 大版本 (改原则)
- **改本体层: 不是升级, 是另起一个产品**

### 10.2 本体层 · 产品是什么

**system-self 这个产品**本身**就是一个 RFL 的具体实现**:
- 用户打开 system-self → 进入 RFL
- 用户的任何操作 → 进入闭环 (行为 → 数据 → 视图 → 觉察)
- 离开 system-self → 离开 RFL

RFL 不是 system-self 的**一个 feature**, 是 system-self 的**本体承诺** (ontological commitment)。

| 软件 | 本体承诺 |
|----|----|
| 记事本 | "能记字" |
| 微信 | "能沟通" |
| 抖音 | "能娱乐" |
| 温度计 | "能测温" |
| **system-self** | **"让你自我观察 + 自我改变"** |

"自我观察 + 自我改变"**不是** system-self 的一个功能, **是** system-self **是什么**。

### 10.3 方法层 · 怎么设计

RFL 同时是产品**设计**的**判断标准**:
- 任何新功能 → 必须满足 5 特征
- 任何 UI 决定 → 必须触及 2+ 层面
- 任何数据流 → 必须真实, 不 mock
- 任何交互 → 必须有反馈闭合

RFL 在这里是**评价器**, 像一把尺子。每个新 feature 过一遍, 5 特征全过才进。

### 10.4 反例: 改本体层 = 改产品

如果有人说: "v2 我们去掉 RFL, 改做 AI 助手"

这不是改 feature, 是改产品**是什么**。相当于:
- 微信去掉"沟通", 改"记事"
- 温度计去掉"测温", 改"装饰品"

不是"升级", 是**新公司**。

### 10.5 落地方式

**本体层**不能埋在 feature list 里, 否则会被产品经理砍掉。
本体层必须作为 **manifesto** (宣言) 写在最显眼位置:

```
README.md 顶部
  └── Manifesto
       ├── "We are a Reflective Feedback Loop"
       ├── "Not an app, not a tool"
       └── "You don't use RFL. You ARE in RFL."
```

**方法层**写在 METHODOLOGY 里, 每次设计新功能时对照检查。

**实现层**在代码里, 可改可迭代。

---

**last updated**: 2026-07-01 (v0.2 · RFL 概念 + 双层结构)
**next review**: 收到 1 个真实用户反馈后, 评估 RFL 5 特征是否完整
