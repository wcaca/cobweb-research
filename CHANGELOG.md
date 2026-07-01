# CHANGELOG · 迭代日志

> 每次 commit/版本/方法论变化都记录在这里。
> 旧版不删, 滚动向前。

---

## v0.2 · 2026-07-01 · RFL 概念 + 双层结构

### Added
- **§9 RFL (Reflective Feedback Loop)** 写进 METHODOLOGY
  - 一句话定义
  - 5 个层面 (Phenomenal / Knowledge / Behavioral / Temporal / Relational)
  - 5 个特征 (Visible / Truthful / Observed / Interactive / Closed)
  - 核心洞察: 观察者 = 被观察者; 闭环里流动的是觉察, 不是数据
  - 设计约束 (硬): 任何新功能必须满足 5 特征 + 触及 2 层
- **§10 The Two Layers** 写进 METHODOLOGY
  - 本体层 vs 方法层 vs 实现层 (三层架构)
  - 反例: 改本体层 = 改产品 (不是升级, 是新公司)
  - 落地方式: 本体层写 README 顶部 manifesto
- **README.md 顶部 Manifesto**
  - "We are a Reflective Feedback Loop"
  - "Not an app. Not a tool. Not a feature."
  - "You don't use this. You ARE in this."

### Decisions
- D-007 RFL 是本体, 不是方法
- D-008 5 层面 = Phenomenal/Knowledge/Behavioral/Temporal/Relational
- D-009 5 特征 = Visible/Truthful/Observed/Interactive/Closed
- D-010 三层架构: 本体 / 方法 / 实现
- D-011 改本体层 = 改产品 (不可逆)
- D-012 设计约束是硬约束 (不进终态 = 不满足 5 特征)

### Rationale (为什么)
用户洞察 (2026-07-01):
> "我们的视角可能有很多种, 可能是在意识层面, 可能是在知识层面,
> 但是都是在一个可视化的闭环中, 同时要反映真实情况,
> 这个闭环是被人观测的, 但又有可交互性"

→ 这是这个研究**本身的形而上学**, 不是"功能"。
→ RFL = 这个形而上学的名字。
→ 双层结构 = RFL 既指导设计 (方法层), 又定义产品 (本体层)。

---

## v0.1 · 2026-07-01 · 初始版本

### Added
- **核心命题**: 核是觉察不是结构
- **5 种状态**: center / edge / fog / dual / drifting + none
- **4 个算法**: 力导向布局, 凸包 (gift wrapping), 闭环检测, 核检测
- **7 条原则**: 核是觉察, AI 陪你看见, 失败 fallback, 不存 React state, AI 决定 UI, 行为+结构, 持续迭代
- **可视化**: 4 个 HTML (vision-pages 04-kernels)
- **代码骨架**: core/ TypeScript 接口设计

### Decisions
- D-001 核不是 Ring 0 紫色 (用户洞察)
- D-002 任何节点都可能是核
- D-003 5 状态足够覆盖真实使用
- D-004 核检测结合结构 + 行为
- D-005 Mavis 是镜子不是鉴定师
- D-006 失败 fallback 8 个 renderer

### Pending (下一版本)
- [ ] 收集真实用户行为数据, 调整检测权重
- [ ] 任意核 (no-structure) 状态
- [ ] 元认知层 (用户对核的态度)
- [ ] 声音化核 (audio 描述)
- [ ] 核的 NLP 抽取

### References
- 来源: system-self v25dk 蛛网 + vision-pages 04-kernels
- 仓库: https://github.com/wcaca/cobweb-research
