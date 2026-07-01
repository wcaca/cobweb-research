# COBWEB-V2 · 从"知识图谱"到"觉察镜"

> v1 把用户的认知画成图, v2 把用户**此刻**的觉察变成镜面。
> 
> 这是**结构性**重新设计, 不是 UI 优化。
> 
> 不动代码, 先把方向钉死。

---

## 0 · 为什么需要 v2

### 0.1 用户洞察 (2026-07-01)

用户在看完 v1 截图后指出:

> "蛛网中每个节点与其他节点的关系,还有下面的点击之后弹出相关度,
> 还有更好的方式来代替这种信息查看方式吗?
> 目前我看到线条杂乱,不能反映信息真实的层级,
> 都是已知没有未知,
> 好像一个人看到信息都不能跟自身整合起来"

这是**对一个工具的根本性质疑**, 不是 UI 抱怨。

5 个症状:
- **线条杂乱** → 算法缺"用户觉察深度"维度
- **没层级** → 节点大小用的是图算法, 不是"我"算法
- **都是已知** → 数据模型只有显式节点, 没有半觉察 / 隐式
- **不能整合** → 中心不是"我", 是"degree 最高的节点"
- **看完没感觉** → Mavis 不在"陪伴", 只在"标注"

---

## 1 · v1 的 5 个结构性缺陷

### 缺陷 1 · cobweb 是"知识图"被误当成了"自我工具"

| 当下设计 | RFL 应该 |
|----|----|
| 把用户认知的**所有节点**画出来 | 只画用户**此刻觉察**到的 |
| 节点 = DB 里的实体 | 节点 = 用户**感受到**的张力 |
| 边 = 共享维度数量 | 边 = 用户**跟它的对话密度** |

**症状**: 给用户一份"清单", 不是"觉察"。

用户不需要"看到我所有的迷茫", 用户需要"看到我的核, 然后意识到"。

### 缺陷 2 · 节点大小按 degree, 不是按"对我重不重要"

- v1: 节点越大 = 它连了越多其他节点
- 问题: 一个节点连 10 个 ≠ 它对这个人重不重要
- 真正应该: 我最近 7 天有几次**主动想**这个节点 / 这个节点触发我的**觉察**多少次

**degree 是图论概念, 不是用户概念。**

### 缺陷 3 · 拓扑里没有"我"

- 我是谁? 我在拓扑哪儿? 我是中心那颗圆? 边缘的小点?
- v1: 用户隐式存在 (cookie + 设备), 但**视觉上没位置**
- 应该: **中心永远是"你"**, 节点按"你跟它的觉察距离"排远近

**节点不是漂浮在真空里, 它们是相对"你"定位的。**

### 缺陷 4 · 没有"未知"

- v1 拓扑 = DB 里有什么画什么, **都是已知**
- 问题: 人最缺的不是"看清已知的", 是"看见**我不知道**的"
- 应该: 3 类形态:
  - 🟢 **已知节点** (我看见过, 知道)
  - 🔵 **半觉察节点** (我模糊感觉到, 但说不出名字)
  - ⚪ **隐式节点** (LLM 推算"你可能存在但你没意识到")

**现在只反映 1/3 真实认知世界**, 其它 2/3 都没呈现。

### 缺陷 5 · 没有"自我对话"

- v1 看图: 看完就看完, 不会"啊原来我..."
- 问题: 缺"看图 → 觉察 → 反馈 → 再看"的链
- 应该: Mavis 在你**停留某节点 > 5 秒**时, 轻声说:
  > "你刚才盯着 X 8 秒, 你有什么还没说的?"
  > "这是你第 14 次看这个节点, 但你从来没回应过它"

**v1 是 read-only 知识库, 不是反思闭环。**

---

## 2 · v1 vs v2 哲学对比

| 维度 | v1 (知识图) | v2 (觉察镜) |
|----|----|----|
| **中心** | degree 最高的节点 | **"你"** |
| **节点大小** | degree (= 连了几条边) | **觉察深度** (= 你跟它对话了多少) |
| **边的属性** | 共享维度数 (1-3 / 4-6 / 7+) | **对话密度** (7 天/30 天/总) |
| **显示什么** | DB 里所有节点 | **已知 + 半觉察 + 隐式** (3 类) |
| **Mavis 角色** | 标注型 (说"这是 X") | **陪伴型** (你停久了才说) |
| **时间** | 历史快照切换 | **当下 + 此刻正在发生** |
| **视觉风格** | 学术图谱 | 关系网络 |
| **数据来源** | server DB | DB + 当下 session 觉察事件 |

---

## 3 · v2 概念模型

### 3.1 中心是"你"

```
         v1                                v2

            迷茫感                               「你」
           /  |  \                            /  |  \
          /   |   \                          /   |   \
      目标  行动  情绪                    觉察  觉察  觉察
                                            (近) (中) (远)
   degree 最高的节点当中心                永远是"用户"自己
```

**始终**: 拓扑中心 = `<you>` 标识
**半透明**: 用户自己不消耗视觉空间, 但永远在场
**跟随**: 当用户关掉页, 镜子关掉; 但用户的位置在 7 天后回到这个页面时, 还能唤起上次的状态

### 3.2 节点带 5 个属性 (v1 是 2 个)

v1 属性:
- `label` (节点名)
- `dimensions` (维度评分)

v2 增加 3 个:
- **`awarenessDepth`** = 0..1
  - 0 = 没觉察到
  - 0.5 = 半觉察
  - 1 = 完全觉察
  - 计算: 用户 hover 次数 × 0.3 + journal 提及次数 × 0.4 + click 迟疑 × 0.3
- **`nodeType`** = `'known' | 'emerging' | 'implicit'`
  - known: DB 已有, 用户 hover 过 ≥1 次
  - emerging: DB 已有, 用户 hover 过 = 0 但 AI 推算"你可能正浮现它"
  - implicit: DB 还没有, LLM 推算"这个节点你应该有但还没说出来"
- **`implicitConfidence`** = 0..1 (仅 implicit 节点)
  - LLM 推算的"这个隐式节点存在的可能性"

### 3.3 边的 2 个属性 (v1 是 1 个)

v1 属性:
- `sharedDimensions` (数组: 共享哪些维度)

v2 增加 1 个:
- **`dialogueDensity`** = 0..1
  - 计算: 跟这两个节点相关的 journal 数 + 跨节点 hover 序列
  - 不是图论, 是**用户行为密度**

边的视觉属性 = `dialogueDensity`, 不是 `sharedDimensions`。
`sharedDimensions` 是**次要信息** (hover 时显示, 不抢主视觉)。

### 3.4 3 类节点的视觉

| 类型 | 视觉 | 含义 |
|----|----|----|
| 🟢 **known** | 实心节点, 大小 = awarenessDepth | 我看见过, 知道 |
| 🔵 **emerging** | 半透明 0.5 opacity, 模糊边缘 | 我模糊感觉到, 但说不出名字 |
| ⚪ **implicit** | 虚线轮廓, opacity 0.3, dashed 边 | LLM 推算"你可能存在但没意识到" |

**3 类同时存在**才能反映真实认知世界。

### 3.5 Mavis 陪伴式触发 (不是标注式)

#### 3.5.1 触发条件 (用户行为)

| 触发 | 时序 | Mavis 响应 |
|----|----|----|
| hover > 5s | 现在 | "你刚才盯着 X 8 秒, 你有什么还没说的?" |
| 反复 hover 但无回应 (>3 次) | 现在 | "这是你第 N 次看 X, 但你从来没回应过它" |
| 移动到 emerging 节点 | 现在 | "你说不清它是什么, 但你停下来了 — 要我陪你命名它?" |
| 移动到 implicit 节点 | 现在 | "这是我没告诉你的部分, 你想看看吗?" |
| 7 天后回到页面 | session | "你上次离开时停在 X, 现在你还在那个状态吗?" |

#### 3.5.2 不触发什么

- 不说: "你的核是 X"
- 不说: "你应该打开 X"
- 不说: "让我帮你看清 X"

**只在用户**自己**停下的时候, Mavis 才说话。**

### 3.6 时间 = 现在 + 此刻, 不只是历史

v1 时间轴: 拖动 slider, 切换历史快照。
v2 时间: 同时显示:
- **当下** (你今天的状态)
- **演化** (你 7 天/30 天的状态)
- **此刻正在发生** (你刚才 30 秒的停留)

具体:
- 节点的 `awarenessDepth` 随时间累积
- 当你看了 X 节点, X 节点**此刻**发光 (不是永久, 是 30s 渐隐)
- 7 天没看 X → X 节点**变暗**

**让图反映"你的当下", 不是"图的当下"。**

---

## 4 · 数据模型改动 (待 v2 实施时细化)

### 4.1 新增表 / 字段

```typescript
// 节点 awareness 维度
interface NodeAwareness {
  nodeId: string;
  userId: string;
  awarenessDepth: number;     // 0..1
  lastHoverAt: Date;
  hoverCount7d: number;
  journalMentionCount7d: number;
  clickDelaySum: number;       // 累计迟疑时长 (ms)
}

// 隐式节点
interface ImplicitNode {
  id: string;
  userId: string;
  label: string;               // LLM 推算
  implicitConfidence: number;  // 0..1
  suggestedByAiAt: Date;
  acceptedAt: Date | null;     // 用户拖到 known 节点后
}

// 觉察事件 (session 内实时)
interface AwarenessEvent {
  id: string;
  userId: string;
  sessionId: string;
  nodeId: string | null;
  eventType: 'hover' | 'click' | 'drag' | 'linger' | 'dismiss';
  durationMs: number;
  occurredAt: Date;
}
```

### 4.2 算法 (客户端)

```typescript
function computeAwarenessDepth(
  hovers: HoverEvent[],
  mentions: JournalEvent[],
  clickDelays: ClickDelay[]
): number {
  const hoverScore = clamp(hovers.length * 0.05, 0, 0.3);
  const mentionScore = clamp(mentions.length * 0.1, 0, 0.4);
  const clickScore = clamp(avgClickDelay / 5000, 0, 0.3);
  return hoverScore + mentionScore + clickScore;
}

function classifyNodeType(
  node: Node,
  hoverCount: number,
  implicitScore?: number
): 'known' | 'emerging' | 'implicit' {
  if (implicitScore && implicitScore > 0.7) return 'implicit';
  if (hoverCount > 0) return 'known';
  return 'emerging'; // DB 里有, 但用户没看过
}
```

### 4.3 算法 (服务端 - LLM 推算 implicit)

- 输入: user journal (last 30d) + known nodes
- 输出: 3-5 个 implicit 节点 (label + confidence)
- 周期: 每天 1 次 (cron)
- 用户行为可触发 (写新 journal 后立即重推)

---

## 5 · Mavis 触发器设计

### 5.1 5 类触发

```typescript
type MavisTrigger = 
  | { kind: 'linger'; nodeId: string; duration: number }      // 停留 > 5s
  | { kind: 'repeat_hover'; nodeId: string; count: number }   // 反复 hover
  | { kind: 'on_emerging'; nodeId: string }                   // 移到 emerging 节点
  | { kind: 'on_implicit'; nodeId: string }                   // 移到 implicit 节点
  | { kind: 'session_return'; lastNodeId: string; days: number }; // 跨 session

// 每个 trigger → Mavis response
const RESPONSES = {
  linger: (n, d) => `你刚才盯着 ${n.label} ${d} 秒, 你有什么还没说的?`,
  repeat_hover: (n, c) => `这是你第 ${c} 次看 ${n.label}, 但你从来没回应过它.`,
  on_emerging: (n) => `你说不清它是什么, 但你停下来了 — 要我陪你命名它?`,
  on_implicit: (n) => `这是我没告诉你的部分, 你想看看吗?`,
  session_return: (n, d) => `你 ${d} 天前停在 ${n.label}, 现在你还在那个状态吗?`,
};
```

### 5.2 不触发 = 不说话

**Mavis 默认沉默**。只有用户行为触发时才说话。

错误示范:
- ❌ 打开页面就说"今天你的核是 X"
- ❌ 进入 /cobweb 就念一段引导
- ❌ 用户没行为, Mavis 持续提示

正确示范:
- ✓ 用户停久了, Mavis 轻声一次
- ✓ 用户主动 hover implicit 节点, Mavis 才解释
- ✓ 跨 session 回来, Mavis 不超过 1 句话

### 5.3 用户可以关闭

每个 Mavis 响应有 "✕ 关闭" 选项, 关闭后本 session 不再触发。

---

## 6 · RFL 5 维度落地检查 (v2 目标)

| RFL 层面 | v1 | v2 |
|----|----|----|
| **A · 意识** | ❌ 拓扑不引导觉察 | ✅ 节点带 awarenessDepth, Mavis 触发 |
| **K · 知识** | ✅ 知识图本身 | ✅ 知识图 (降级为辅助显示) |
| **B · 行为** | ❌ 看完没行动 | ✅ dialogueDensity 引导"看图"是个动作 |
| **T · 时间** | △ 历史切换 | ✅ 当下 + 此刻 + 7 天前 + 30 天前 |
| **R · 关系** | ❌ 没有"我和它" | ✅ 中心是"我", 边是"对话" |

**v2 实现后, 5 层全部上线。**

---

## 7 · 实施路径 (A → C → B)

### 阶段 A · 沉淀方法论 ✅ (本文档)
- 写死 5 个缺陷 + 5 个改进
- 不动代码

### 阶段 C · 最小改动试 1 个核心
- 改 1 个关键点: **中心改成"你" + 节点大小按 awarenessDepth**
- 不加 implicit 节点, 不改 Mavis 触发器
- 验证"用户位置"概念是否生效
- 风险: 低

### 阶段 B · 全量 v2
- 数据模型: NodeAwareness + ImplicitNode + AwarenessEvent
- 算法: computeAwarenessDepth + classifyNodeType
- UI: 中心"你" + 3 类节点 + 边 visual
- Mavis: 5 类触发器
- LLM: 每天推算 implicit 节点
- 风险: 中, 但有阶段 C 验证

---

## 8 · 不在 v2 范围

为了避免**过拟合**, 下面这些**不进** v2:

- ❌ AR/VR 3D 镜面
- ❌ 多人拓扑 (用户之间互相看)
- ❌ 声音化节点
- ❌ NLP 自动给节点建议 label (让用户自己命名)
- ❌ 与 X (Twitter) 联动

**v2 先解决"一个人看见自己"这件事, 不扩展到多人 / 多模态。**

---

## 9 · 跟其他文档的关系

| 文档 | 关系 |
|----|----|
| METHODOLOGY.md §9 RFL | v2 是 RFL 在 cobweb 模块的具体落地 |
| METHODOLOGY.md §9.3 状态机 | v2 中心是"你", 但节点可以是 5 状态之一 |
| docs/ONTOLOGY.md 规则 4-5 | v2 把"多视角同时可见"+"操作回流"做到 cobweb |
| docs/COBWEB-V2.md (本文) | 阶段性设计, 不在 METHODOLOGY 主线 |
| vision-pages/02-cobweb.html | v1 视觉化, **v2 需要重做** |
| system-self/components/cobweb/ | v1 代码, **v2 需要重构** |

---

## 10 · 决策记录

### D-CW2-01 · v2 必须以"你"为中心
- 不允许出现"degree 最高的节点当中心"
- 这是本体层决定 (跟 ONTOLOGY 规则 1 一致)

### D-CW2-02 · 节点大小 = awarenessDepth, 不是 degree
- awarenessDepth 综合 hover / mention / click_delay
- 不允许用 degree 单一指标

### D-CW2-03 · 3 类节点共存
- known / emerging / implicit 同时存在
- 不允许"只显示 known"

### D-CW2-04 · Mavis 沉默, 只触发
- 默认不说话
- 5 个触发条件明确
- 用户可关闭

### D-CW2-05 · 时间 = 当下 + 此刻
- 时间不只是历史, 包含"此刻正在发生"
- 节点 awarenessDepth 实时累积

---

**last updated**: 2026-07-01 (从用户洞察沉淀的设计, 未实施)
**next review**: 实施阶段 C 后, 评估是否进入阶段 B
**owner**: Mavis + wcaca
**depends**: METHODOLOGY §9 RFL + ONTOLOGY 规则 1-7
