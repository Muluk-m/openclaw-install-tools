## 1. Cloudflare KV 配置

- [ ] 1.1 在 `wrangler.jsonc` 中添加 KV namespace `ROOMS` 绑定
- [ ] 1.2 通过 `wrangler kv namespace create ROOMS` 创建 KV namespace（或使用 preview 模式本地开发）

## 2. 房间注册 API

- [ ] 2.1 创建 `src/app/api/rooms/route.ts`，实现 GET（列出活跃房间，过滤 30 分钟以上的）和 POST（注册房间 code + timestamp 到 KV 单 key `active-rooms`）
- [ ] 2.2 创建 `src/app/api/rooms/[code]/route.ts`，实现 DELETE（从 KV 中移除指定房间）

## 3. Store 集成

- [ ] 3.1 修改 `transfer-store.ts` 的 `createRoom`，在创建成功后 fire-and-forget 调用 POST `/api/rooms`
- [ ] 3.2 修改 `transfer-store.ts` 的 `disconnect`，调用 DELETE `/api/rooms/[code]`，并在 `beforeunload` 事件中用 `navigator.sendBeacon` 发送注销请求

## 4. 房间发现 UI

- [ ] 4.1 修改 `src/app/transfer/page.tsx`，在 "choose" 模式下每 3 秒轮询 GET `/api/rooms`，展示"发现的房间"列表，点击一键加入
- [ ] 4.2 处理发现的房间已失效的情况：加入失败时显示"房间已关闭或已过期"错误提示并刷新列表

## 5. 创建房间流程优化

- [ ] 5.1 修改 `room-create.tsx`，创建成功后不调用 `onCreated()`，改为展示房间号 + 等待动画
- [ ] 5.2 监听 `connectionState` 变为 `connected` 后自动触发导航到 `/transfer/room?room={code}`
