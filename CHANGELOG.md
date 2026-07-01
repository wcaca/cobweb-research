# CHANGELOG · 迭代日志

> 每次 commit/版本/方法论变化都记录在这里。
> 旧版不删, 滚动向前。

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
