# system-self 架构 · 从根上解决 API 不充分问题

> 写于 2026-07-02 · 在真深度测试后 (65% 完成度) 推动

## 背景

之前我评估 sf 项目"完成 100%" 是**表层的** — 只看了 HTTP 200, 截图能拍, 数据存在。
没真测**业务功能**。

真深度测试后:
- 8 个真业务功能能跑 (journal/cobweb/learn/agent/...)
- 5 个 API 缺失或 404:
  - `/api/profile` 404 (实际是 `/api/user/profile`)
  - `/api/closed-loops` 不存在 (DB 15 行, 没暴露!)
  - `/api/insights/recent` 不存在 (跨 session recall 断)
  - `/api/learning/flash` 404 (实际是 `/api/learn/session`)
  - RFL 5 层指标有 UI 但没 API
- profile 只有 id, 缺 displayName/avatar/counts

**真实完成度: 65%**

## 根问题

API 设计**没规范化**:
- 命名不统一 (`profile` / `user/profile` / `user/me`)
- 命名空间散 (`auth`, `agent`, `system`, `mcp`, `shell-state` 全是顶层)
- 数据有但没暴露 (closed_loops 15 行, insights 0 暴露)
- 缺文档

## 解决方案 (8 大域统一)

```
1. /api/auth/*       认证
2. /api/user/*       用户域 (自己)
3. /api/journal/*    日记
4. /api/cobweb/*     蛛网
5. /api/learn/*      学习
6. /api/identity/*   身份/闭环/洞察
7. /api/agent/*      AI 干预
8. /api/system/*     系统
```

不 move 旧 endpoint (会断前端), 而是:
1. **ADD** 新 endpoint (4 个关键)
2. **DOC** 写 API 标准
3. **DEPRECATE** 标旧的 (`/api/profile` → `/api/user/me`)

## 本轮交付 (commit 5b9cc89 → 6ec1a)

### 4 个新 endpoint

| Path | 功能 | 之前 |
|---|---|---|
| `/api/identity/loops` | 闭环列表 (count/closedCount/completeness) | **DB 锁死** |
| `/api/identity/insights/recent?limit=N` | 跨 session 洞察 recall | **不存在** |
| `/api/identity/rfl` | RFL 5 层实时指标 (A/K/B/T/R) | **UI 有, API 没** |
| `/api/user/me` | 完整 profile (displayName/avatar/counts) | 只有 id |

### 文档

- `docs/API-REFERENCE.md` - 192 行, 8 大域全列
- `docs/ARCHITECTURE.md` - 本文档, 重构背景 + 方案

## 验证

```bash
# 4 endpoint 都真返回数据
curl /api/identity/loops          → count:15, closedCount:10, completeness:90%
curl /api/identity/insights/recent → count:3 (真洞察)
curl /api/identity/rfl             → A33% K15+23 B30+0streak T1 R4+active
curl /api/user/me                  → 显影者 🌱 #CE7E3E, counts全
```

## 下一步 (未做, 留待后续)

1. **P1 整合**: `/api/profile/staleness` → `/api/identity/staleness`
2. **P1 整合**: `/api/skills` → `/api/user/skills`
3. **P2 整合**: 11 个孤 endpoint → `/api/system/*` (`admin/metrics`, `shell-state`, `materials`, `mcp`)
4. **P2 前端切**: AppShell 改 fetch `/api/user/me` + `/api/identity/rfl`, 不再 from localStorage
5. **P3 文档**: OpenAPI / Swagger 自动生成
6. **P3 测试**: Playwright e2e 跑核心流程 (写日记 → 看 RFL 跳)
7. **P4 废弃**: 加 `Sunset` header 给旧 endpoint

## 设计原则 (沉淀)

1. **域优先**: URL 路径是域, 不是资源. `/api/identity/loops` 不是 `/api/loops`.
2. **GET 列表永远有 count**: 客户端不用再 fetch 一次
3. **POST 写入异步 + 返回 agent_run_id**: 不阻塞
4. **错误统一**: `{ error: "..." }` + HTTP status
5. **新加 endpoint 必须更新 API-REFERENCE.md**: 文档是契约

## 不变量

- `crossLinks` 跟 `edges` 同义 (后端用 crossLinks)
- `node_ids` 跟 `nodeIds` 同义 (DB 用 snake_case, API 用 camelCase)
- `created_at` / `createdAt` 同义
