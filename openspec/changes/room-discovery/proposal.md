## Why

LAN 传输功能的连接体验不够好：(1) 创建房间后立刻跳转到传输页，房间号一闪而过，用户来不及复制分享给对方；(2) 加入房间需要手动输入 4 位房间号，而实际上同时在线的房间极少（通常 0-2 个），完全可以自动发现并一键加入。

## What Changes

- 新增服务端房间注册表（Cloudflare KV），创建房间时注册，断开时注销，30 分钟 TTL 自动过期
- 新增 `/api/rooms` API 端点，支持房间的注册、列出、注销
- Transfer 首页新增「发现的房间」区域，轮询展示当前活跃房间，点击一键加入
- 创建房间后不再立刻跳转，改为停留在当前页展示房间号 + 等待动画，对方连上后自动跳转到传输页
- 保留手动输入房间号加入的方式作为 fallback

## Capabilities

### New Capabilities
- `room-registry`: 服务端房间注册表 API，支持房间的注册、发现、注销
- `room-discovery-ui`: 传输首页的房间自动发现与展示，包括轮询刷新和一键加入

### Modified Capabilities

_(无已有 capability 的需求变更)_

## Impact

- **新增 Cloudflare KV binding**: `wrangler.jsonc` 需添加 `ROOMS` KV namespace
- **新增 API 路由**: `src/app/api/rooms/route.ts`, `src/app/api/rooms/[code]/route.ts`
- **修改组件**: `transfer/page.tsx`（添加发现区域）、`room-create.tsx`（停留展示房间号）
- **修改 store**: `transfer-store.ts`（创建/断开时调用注册/注销 API）
- **依赖**: 无新依赖，使用 Cloudflare KV 原生 API
