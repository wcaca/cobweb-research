# CHANGELOG · 迭代日志

> 每次 commit/版本/方法论变化都记录在这里。
> 旧版不删, 滚动向前。

---

## v0.2.4 · 2026-07-01 · cobweb-v2 B.1 数据模型落地

### Changed (system-self commit 0cfc3cc)
- **3 张新表** 落地 + 验证:
  1. cobweb_node_awareness (14 cols) - 节点觉察深度
  2. cobweb_implicit_nodes (12 cols) - LLM 推算的隐式节点
  3. cobweb_awareness_events (8 cols) - session 内实时觉察事件
- **migration 0005** 写好 + 应用
- **schema 文件** cobweb-awareness.ts
- **journal + snapshot** 更新
- **不动 UI / 不动现有 cobweb 代码**

### Verified
- ✓ tsc --noEmit pass
- ✓ 3 张表 columns 跟 schema 一致
- ✓ insert / select / delete 测试 OK
- ✓ D-CW2-01 ~ D-CW2-05 决策实现基础

### 下一步 (B.2 ~ B.5)
- B.2 算法层: computeAwarenessDepth / classifyNodeType / LLM 推算 implicit
- B.3 前端: 中心是"你" + 3 类节点 visual
- B.4 Mavis 触发器 (5 类: linger/repeat_hover/on_emerging/on_implicit/session_return)
- B.5 LLM 推算 cron (每天 1 次 + journal 触发)

---

## v0.2.3 · 2026-07-01 · cobweb-v2 概念设计 (v1 缺陷诊断)

### Changed
- **docs/COBWEB-V2.md** 新增 (405 行)
- **5 个结构性缺陷** (v1 cobweb 不是 RFL 镜子):
  1. 知识图谱被误当自我工具
  2. 节点大小按 degree 不是觉察深度
  3. 拓扑里没有"我"
  4. 没有"未知" (known/emerging/implicit)
  5. 没有"自我对话" (Mavis 应该触发型不是标注型)

### Decisions (D-CW2-01 ~ D-CW2-05)
- D-CW2-01: 中心是"你", 不是 degree 最高节点
- D-CW2-02: 节点大小 = awarenessDepth, 不是 degree
- D-CW2-03: 3 类节点共存 (known/emerging/implicit)
- D-CW2-04: Mavis 沉默, 只触发 (5 个触发条件)
- D-CW2-05: 时间 = 当下 + 此刻, 不只是历史

### Rationale
用户洞察 (2026-07-01):
> "线条杂乱, 不能反映信息真实的层级,
> 都是已知没有未知,
> 好像一个人看到信息都不能跟自身整合起来"

→ 当前 cobweb 只实现了 RFL 5 层面中的 1 层 (K 知识层)
→ A 意识 / B 行为 / T 时间 / R 关系 全缺失
→ v2 不是 UI 优化, 是结构性重新设计
→ 阶段 A: 沉淀方法论 (本文档)
→ 阶段 C: 最小改动试 1 个核心 (中心是"你"+awarenessDepth)
→ 阶段 B: 全量 v2 (数据模型 + 算法 + UI + Mavis 触发 + LLM 推算 implicit)

### 不动代码
本阶段只沉淀方法论, 不动 system-self cobweb 代码.

---

## v0.2.2 · 2026-07-01 · system-self AppShell 移动端 RFL bar

### Changed
- **system-self** commit c06eff5: AppShell 加移动端 mini RFL 5 层 bar
  - 位置: 移动端 sticky top (lg:hidden, 桌面不显示)
  - 内容: 5 层缩写 A/K/B/T/R + 当前 active layer badge (黑底白字)
  - 路径映射 (硬编码, 无后端):
    - / / /today → A (觉察)
    - /map /cobweb /radar → K (拓扑)
    - /learning /workbench → B (行动)
    - /universe /life /wish /works /ideal → T (时间)
    - /profile /partner → R (关系)

### Verified (Playwright mobile 390x844)
- ✓ /  → active A
- ✓ /cobweb → active K
- ✓ /learning → active B
- ✓ /profile → active R
- 截图 4 张: screenshots/system-self-rfl-{home,cobweb,learning,profile}.png

### Rationale
ONTOLOGY.md 规则 4 + 规则 5: "多视角同时可见" + "每次操作回流"
- 主页 (cb044ca) 5 层只在 / 可见
- 用户切到 cobweb 后就脱离 RFL, 闭环断
- AppShell 是全局包裹, mini bar 让用户**永远**看到 5 层存在
- 移动端尤其重要 (桌面 sidebar 已有视觉密度)

---

## v0.2.1 · 2026-07-01 · system-self 主页 RFL 落地

### Changed
- **system-self** 主仓库 commit cb044ca: 主页 (TodayImagingScreen) header 改造
  - 旧: 迷茫浓度% / X天连续 / 今日手账 X篇 (单层显示)
  - 新: RFL 5 层 indicator 同时可见
    - 上行: '▸ 5 层 · 此刻' + 'A · K · B · T · R'
    - 下行: A 觉察% / K N 闭环 / B N 天 / T 今天 / R 在场
  - 设计: 50 行新代码, 1 行删除, 没碰其他组件

### Verified (Playwright + dev user)
- ✓ Token 拿到, 主页 200
- ✓ 5 层 indicator 全部渲染
- ✓ 实测值: A 57% / K 8 闭环 / T 7月1日 / R 在场
- ✓ tsc --noEmit pass / bun build OK / system-self.service active (3030)

### Screenshot
- `screenshots/system-self-rfl-home.png` — 主页 RFL 5 层 indicator

### Rationale
ONTOLOGY.md 规则 4: "多视角同时可见"
- 旧版主页只有知识层 (洞察) + 行为层 (输入)
- 现在意识 + 知识 + 行为 + 时间 + 关系 5 层同步展示
- 用户进首页 1 秒内看到 5 个视角同时存在
- 不再"切换 tab 找东西", 而是"打开就在闭环里"

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
