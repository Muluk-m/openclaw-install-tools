## Context

LAN 传输功能当前使用 PeerJS（公共信令服务器 0.peerjs.com）实现 WebRTC P2P 连接。房间号为 4 位随机数字（1000-9999），peer ID 格式为 `openclaw-{code}`。创建房间后立刻路由跳转到 `/transfer/room`，用户看不到房间号。加入房间需要手动输入 4 位数字。

项目部署在 Cloudflare Workers 上（通过 opennextjs-cloudflare），已有 Workers AI binding。

## Goals / Non-Goals

**Goals:**
- 创建房间后用户能清楚看到房间号并有时间分享
- 在另一台设备打开传输页时自动发现活跃房间并一键加入
- 对方连接成功后自动进入传输页面

**Non-Goals:**
- 不做真正的局域网 mDNS/Bonjour 扫描（浏览器无法实现）
- 不自建 PeerJS 信令服务器
- 不做房间密码/鉴权（同时在线房间极少，无安全顾虑）

## Decisions

### 1. 使用 Cloudflare KV 单 key 存储活跃房间列表

**选择**: 将所有活跃房间存储在一个 KV key `active-rooms` 中，值为 JSON 对象 `{ [code]: timestamp }`。

**替代方案**:
- 每个房间一个 KV key（`room:XXXX`）→ KV `list()` 是最终一致的，可能延迟 60 秒才能发现新房间
- Durable Object → 过重，之前有 `SignalingRoom` DO 但已删除
- PeerJS peers API → 公共服务器不暴露此 API

**理由**: 单 key `get()` 是强一致的，读取即最新。房间数极少（0-2 个），单 key JSON 完全够用。写入竞态在低流量场景下可忽略。

### 2. 创建房间后停留在当前页，连接成功后自动跳转

**选择**: `RoomCreate` 组件在 `createRoom()` 完成后不调用 `onCreated()`，而是展示房间号 + 等待状态。监听 `connectionState` 变为 `connected` 后再触发导航。

**理由**: 给用户时间看到、复制和分享房间号。与发现功能配合，对方通过发现加入后自动进入传输页。

### 3. 前端轮询发现房间（3 秒间隔）

**选择**: Transfer 首页通过 `setInterval` 每 3 秒调用 `GET /api/rooms`。

**替代方案**:
- WebSocket/SSE 实时推送 → 增加复杂度，3 秒轮询已足够
- 更短间隔 → 不必要，房间创建是用户主动操作，不需要毫秒级响应

### 4. API 路由设计

```
GET    /api/rooms          → 返回活跃房间列表（过滤掉超过 30 分钟的）
POST   /api/rooms          → 注册房间 { code: string }
DELETE /api/rooms/[code]    → 注销房间
```

注册和注销在 `transfer-store.ts` 的 `createRoom` / `disconnect` 中调用，作为 fire-and-forget（不阻塞主流程，失败静默忽略）。

## Risks / Trade-offs

- **KV 单 key 写入竞态**: 两个用户同时创建房间可能覆盖对方的注册 → 发生概率极低（用户极少），且有 30 分钟 TTL 兜底
- **KV 不自动过期单 key 内的条目**: 需要在读取时手动过滤超时条目 → 在 GET handler 中清理
- **注销 API 可能不被调用**（用户直接关闭浏览器）→ TTL 30 分钟后自动过期，发现列表中显示的房间可能已失效，用户点击加入会报错，需要友好提示
- **无鉴权**: 任何人可以注册/注销房间 → 工具用户极少，风险可接受
