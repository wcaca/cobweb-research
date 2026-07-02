# system-self API Reference

> 8 大域统一架构 · RESTful 风格 · 2026-07-02 重构

## 域划分

```
1. /api/auth/*       认证 (2)
2. /api/user/*       用户域 (5)
3. /api/journal/*    日记 (3)
4. /api/cobweb/*     蛛网 (2)
5. /api/learn/*      学习 (16)
6. /api/identity/*   身份/闭环/洞察 (5)
7. /api/agent/*      AI 干预 (3)
8. /api/system/*     系统 (7)

[KEEP] /api/map, /api/universe, /api/workbench, /api/fun-test, /api/life,
       /api/landscape, /api/wish, /api/works, /api/mirror, /api/today,
       /api/pre-render
```

## 1. /api/auth/*

| Method | Path | Body | Response | 说明 |
|---|---|---|---|---|
| POST | /login | { password } | Set-Cookie | 颁发 JWT (30 天 TTL) |
| POST | /logout | - | 200 | 清 cookie |

## 2. /api/user/*

| Method | Path | 说明 |
|---|---|---|
| GET | /me | **完整用户 profile (displayName/avatar/entityName/primaryColor/onboardingDone/counts/rfl)** |
| GET | /me/state | 实时状态 (合并 me + rfl) |
| GET | /me/memory | 跨 session 记忆 |
| GET | /me/stats | 统计 |
| GET | /me/env | 环境 |
| PUT | /me/preferences | 偏好 |
| POST | /me/reset-ui | 重置 UI |
| GET | /color-unlock | 色彩解锁 |
| GET | /profile | (DEPRECATED, 用 /me) |
| GET | /skills | 技能 |

### GET /api/user/me 响应示例
```json
{
  "id": "00000000-0000-0000-0000-000000000001",
  "email": "sf@example.com",
  "displayName": "显影者",
  "avatar": "🌱",
  "entityName": "显影者",
  "primaryColor": "#CE7E3E",
  "onboardingDone": "true",
  "createdAt": "2026-05-01T...",
  "lastInnerMapEntry": "2026-07-02T...",
  "counts": {
    "journal": 88,
    "learning": 30,
    "closedLoops": 15,
    "cobwebNodes": 23,
    "expressions": 4
  },
  "rfl": "/api/identity/rfl"
}
```

## 3. /api/journal/*

| Method | Path | Body | Response | 说明 |
|---|---|---|---|---|
| GET | / | ?limit=10 | entries[] | 列表 |
| POST | / | { content } | { entry, agentRunId, status: "pending" } | 写日记 (异步 AI 分析) |
| GET | /status | ?runId=... | journal 分析结果 | 查 AI 状态 |

## 4. /api/cobweb/*

| Method | Path | Body | Response | 说明 |
|---|---|---|---|---|
| GET | / | - | { nodes, crossLinks, loops, rankings, mathFramework, groupModel } | 完整拓扑 |
| POST | /expand | { parentId } | { parentId, status, expanded } | AI 扩展节点 |

## 5. /api/learn/* (16 endpoints)

modules / session / complete / recommendation / tutor / inspector / weakness /
prefetch / preview / deep / continue / options / capability/[id] / papers/*
(a + analyze + cards + [id] + upload)

## 6. /api/identity/*

| Method | Path | Body | Response | 说明 |
|---|---|---|---|---|
| GET | /loops | - | { loops[], count, closedCount, completeness } | **闭环列表 (DB 15 行, 已暴露!)** |
| GET | /insights/recent | ?limit=10 | { insights[], count } | **跨 session 洞察 recall** |
| GET | /rfl | - | { A, K, B, T, R, layers, updatedAt } | **RFL 5 层实时指标** |
| GET | /expression | - | expression[] | 表达列表 |
| POST | /expression | { content } | { id, version } | 写表达 |
| GET | /expression/version | - | versions[] | 表达版本 |
| GET | /ideal-self | - | ideals[] | 理想自我 |
| GET | /world | - | world | 我的世界 |

### GET /api/identity/rfl 响应示例
```json
{
  "A": { "awarenessPercent": 33, "journalToday": 1, "label": "觉察" },
  "K": { "loops": 15, "nodes": 23, "label": "知识" },
  "B": { "learningSessions": 30, "streak": 0, "label": "行为" },
  "T": { "journalWeek": 1, "today": "2026-07-02", "label": "时间" },
  "R": { "expressions": 4, "ideals": 0, "partner": "active", "label": "关系" },
  "layers": ["A", "K", "B", "T", "R"],
  "updatedAt": "2026-07-02T05:46:25.000Z"
}
```

### GET /api/identity/loops 响应示例
```json
{
  "loops": [...15 loops...],
  "count": 15,
  "closedCount": 10,
  "completeness": 90
}
```

### GET /api/identity/insights/recent 响应示例
```json
{
  "insights": [
    {
      "id": "858143de...",
      "content": "今天花了很多时间在想 RFL 这个概念...",
      "fogPoints": ["..."],
      "lightPoints": ["突破单一维度理解: RFL不只是本体承诺..."],
      "suggestions": ["试着画出 RFL 在研究→产品这条链路上的具体节点"],
      "createdAt": "2026-07-02T04:02:52.270Z"
    }
  ],
  "count": 3,
  "limit": 3
}
```

## 7. /api/agent/* (Mavis 干预)

| Method | Path | 说明 |
|---|---|---|
| GET | /intervention | 干预卡 (基于历史 journal) |
| GET | /status | 状态 |
| POST | /step | 下一步 |

## 8. /api/system/* (取代 admin + shell + materials + mcp)

| Method | Path | 说明 |
|---|---|---|
| GET | /health | 健康检查 |
| GET | /admin/metrics | 管理员 metrics |
| GET | /shell-state | Shell 状态 |
| GET | /materials | 素材 |
| GET | /notifications | 通知 |
| GET | /profile/staleness | Profile staleness |
| GET | /mcp | MCP 服务 |

## 跨域 Endpoints (KEEP)

- /api/map/* (seed, fog, fog-state, question-direction)
- /api/universe/* (draw)
- /api/workbench/* (analysis)
- /api/fun-test/* (generate, presets, result)
- /api/life/* (chat, entity)
- /api/landscape/* (from-history, generate, get, save)
- /api/wish
- /api/works/* (edit, generate, upload)
- /api/mirror/* (external, sharp)
- /api/today/recommend
- /api/pre-render/* (cleanup, refresh, warm, warm-daily)

## 命名规范

- **复数 resource** (journal / loops / insights)
- **GET 列表** 永远带 `count` + 原始数组
- **GET 单个** 永远带 `id`
- **POST 写入** 异步返回 `{ id, status: "pending", ... }`
- **错误** 统一 `{ error: "..." }` + HTTP status code

## 鉴权

- Cookie: `system-self-token` (JWT, 30 天 TTL)
- 所有 `/api/*` 除 /auth/login + /health 外都要 cookie
- dev mode: AUTH_SECRET 未设时返回 DEV_USER_ID

## 版本

v1.0 · 2026-07-02 · 重构: 加 4 endpoint + 8 大域统一

## Sunset / Deprecation (2026-10-01)

| 旧 endpoint | 新 alias | Sunset date |
|---|---|---|
| `/api/profile/staleness` | `/api/identity/staleness` | 2026-10-01 |
| `/api/skills` | `/api/user/skills` | 2026-10-01 |
| `/api/profile` | `/api/user/me` | TBD |

旧 endpoint 加 header:
- `Sunset: Wed, 01 Oct 2026 00:00:00 GMT`
- `Deprecation: true`
- `Link: <新路径>; rel="successor-version"`
