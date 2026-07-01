# 蛛网图谱 · 研究仓库

> **核不是结构, 是觉察。**
> 这是一个研究仓库, 持续迭代 "怎么让 AI 帮你看见自己" 这件事。

---

## 📜 Manifesto · 宣言

> ### **We are a Reflective Feedback Loop.**
> 
> ### **Not an app. Not a tool. Not a feature.**
> 
> ### **You don't use this. You ARE in this.**

This is not a product you open and close.
It is a **reflective feedback loop** you enter and stay in.

The system shows your topology.
You click. It changes.
You watch. You realize.
You change. The topology changes.

You are **observer** and **observed**.
You are **inside** the loop, not **outside** looking in.

If you can see this page, you are already in.

---

## 这是什么

**不是** 一个产品仓库, **不是** 一个应用仓库。
**是** 一个**研究**仓库 — 方法论 + 核心算法 + 状态机 + 持续实验。

像物理学的研究, 不直接造产品, 但所有造产品的人都从这里引用公式。

## 核心命题

> 核 (kernel) 不是节点的"中心位置"或"最大尺寸"。
> 核是**用户此刻觉察到的那一个 (或两个)**。
> 它可能**在中心, 在边缘, 模糊不清, 两个之间, 或正在漂移**。
> AI 的角色是**陪你看见**, 不是**标注**。

## 仓库结构

```
cobweb-research/
├── README.md              ← 你在这里
├── METHODOLOGY.md         ← 整套方法论 (5 状态 + 7 原则 + 4 算法 + RFL)
├── CHANGELOG.md           ← 版本 + 每次迭代
├── core/                  ← 核心算法 (TypeScript)
│   ├── kernel-state.ts    ← 核状态机
│   ├── kernel-detector.ts ← 实时检测 (基于行为 + 结构)
│   ├── force-directed.ts  ← 力导向布局
│   ├── convex-hull.ts     ← 凸包 (gift wrapping)
│   ├── loop-detection.ts  ← 闭环检测 (强连通分量)
│   └── index.ts
├── examples/              ← 示例 (1-basic / 2-states / 3-drift)
├── tests/                 ← 单元测试 (vitest)
├── docs/                  ← 可视化方法论 (从 vision-pages 链接)
└── research/              ← 实验性想法 (不一定进核心)
```

## 怎么用

### 给 system-self 引用

```typescript
// system-self 里的 cobweb 模块
import { KernelDetector, detectLoops, forceDirected } from 'cobweb-research';
```

### 自己探索

```bash
git clone https://github.com/wcaca/cobweb-research
cd cobweb-research
npm install
npm test
```

## 5 种核的状态

| 状态 | 一句话 | 视觉 |
|----|----|----|
| **中心** (center) | "我看清了" | 节点在画布中心, 强连接 |
| **边缘** (edge) | "我知道有, 但没说" | 节点在角落, 弱连接 |
| **模糊** (fog) | "我感觉到, 说不清" | 半透明 + blur 滤镜 |
| **双核** (dual) | "是 A 还是 B?" | 2 个半透明核重叠 |
| **漂移** (drifting) | "这个月是 X, 下月是 Y" | 5 帧时间线, 核在移动 |

## 7 条原则

1. **核是觉察不是结构** — 任何节点都可能是核
2. **AI 陪你看见不标注** — 镜子不是鉴定师
3. **失败 fallback** — 检测不出就显示 "无核" 状态, 永不出错
4. **不存 React state** — 状态从 URL/数据来, 永不出 bug
5. **AI 决定 UI** — 5 状态映射 5 渲染器, 不硬编码
6. **行为 + 结构** — 核的检测结合用户行为 (停留/迟疑/点击)
7. **持续迭代** — 方法论是活的, 每次 commit 都更新 CHANGELOG

## RFL · Reflective Feedback Loop

> cobweb / 5 状态 / 检测算法, **都是** RFL 的**具体形态**。
> RFL 是**本体**, 这些是**实例**。

RFL 的 5 个层面 + 5 个特征, 详见 [METHODOLOGY.md §9](METHODOLOGY.md)。

## 双层结构

| 层 | 内容 | 可改 |
|--|--|--|
| **本体层** | "这个产品就是 RFL" (manifesto) | 不可改 (改就不是这个产品) |
| **方法层** | 5 特征 + 5 层面 (设计指南) | 大版本 |
| **实现层** | cobweb / journal / 6 capability | 升级 |

## 跟其他仓库的关系

- **`wcaca/system-self`** — 主产品, 引用这里的算法
- **`wcaca/vision-pages`** — 可视化产品愿景, 包含 04-kernels.html
- **`wcaca/agent-memory`** — 个人记忆库, 沉淀每次迭代的 decide

## 维护

- 每次 commit: 改 `CHANGELOG.md` + 写 `research/` 下的实验笔记
- 每次大版本: 改 `METHODOLOGY.md` + 更新 `core/` 的接口
- 引用方: 跟随 minor version 升级, major version 需要 review

---

**started**: 2026-07-01
**owner**: Mavis (Mavis 系统自维护)
**license**: MIT
