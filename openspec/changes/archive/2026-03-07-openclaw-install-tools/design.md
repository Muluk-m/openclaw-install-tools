## Context

当前项目是一个通过 `create-cloudflare` 创建的 Next.js 16 空模板，部署在 Cloudflare Workers 上。目标是将其构建为 OpenClaw 的安装辅助工具站，包含安装向导、LAN 传输、诊断三大模块。

现有基础设施：
- Next.js 16 App Router + Tailwind CSS v4（已配置）
- Cloudflare Workers 部署（wrangler.jsonc 已配置）
- 仅有默认脚手架页面，无业务代码

## Goals / Non-Goals

**Goals:**
- 提供条件分支式安装向导，降低 Windows/macOS 用户安装 OpenClaw 的门槛
- 实现浏览器间 WebRTC P2P 文件/文本传输，支持局域网内设备协助安装
- 建立常见安装问题知识库，并通过 AI 分析兜底未知错误
- 作为开源项目发布，代码结构清晰、易于社区贡献

**Non-Goals:**
- 不做 OpenClaw 本身的安装器/下载器（不分发二进制文件）
- 不做跨广域网的文件传输（仅局域网 P2P）
- 不做用户账号系统或数据持久化
- 不做移动端原生适配（响应式即可，但核心场景是桌面浏览器）
- 不做国际化（v1 仅中文）

## Decisions

### D1: 安装向导采用声明式步骤树

**选择**: 在 `lib/install-steps.ts` 中用 TypeScript 对象声明步骤树，每个步骤包含内容、分支条件、下一步指向。组件 `step-wizard.tsx` 读取数据驱动渲染。

**替代方案**:
- 每个步骤写一个独立页面组件 → 重复代码多，难以维护分支逻辑
- 用 Markdown + MDX → 分支逻辑难以表达

**理由**: 声明式数据让步骤内容和渲染逻辑分离，新增/修改步骤只需改数据文件，社区贡献友好。

### D2: WebRTC 信令通过 Cloudflare Durable Objects

**选择**: 用 Durable Objects 管理房间状态，通过 WebSocket 转发 SDP offer/answer 和 ICE candidates。

**替代方案**:
- 独立 WebSocket 服务器（需额外基础设施）
- Cloudflare Workers + KV 轮询（延迟高，体验差）
- 纯手动 SDP 复制粘贴（用户体验极差）

**理由**: Durable Objects 是 Cloudflare 原生方案，和项目部署环境一致，支持 WebSocket，免费额度足够信令场景（数据量极小）。单个 DO 实例管理一个房间的两个连接，生命周期天然匹配。

### D3: 房间号配对方式

**选择**: 4 位数字房间号（0000-9999），由服务端生成，5 分钟过期。

**替代方案**:
- 6 位字母数字（更安全但输入麻烦）
- QR 码（电脑对电脑场景不方便）

**理由**: 局域网场景安全风险低，4 位数字足够避免冲突（同时在线房间不会太多），输入快捷。

### D4: WebRTC 使用原生 API 而非 simple-peer

**选择**: 直接使用 RTCPeerConnection + RTCDataChannel 原生 API。

**替代方案**:
- simple-peer 库（封装更简洁）
- PeerJS（带公共信令服务器）

**理由**: 信令已自建（DO），不需要第三方信令。原生 API 代码量不大（~200 行），避免额外依赖。作为开源教育项目，原生实现更有学习价值。

### D5: 错误诊断两层架构

**选择**:
- 第一层：前端正则匹配已知错误模式（`lib/error-patterns.ts`），毫秒级响应
- 第二层：Cloudflare Workers AI（llama 模型）分析未知错误

**替代方案**:
- 全部走 AI（延迟高，成本高）
- 仅前端匹配（无法处理未知错误）

**理由**: 80% 的安装错误是已知的重复问题（EACCES、command not found 等），前端匹配即可。Workers AI 只处理未知错误，控制成本。

### D6: UI 组件库选型

**选择**: shadcn/ui + Lucide React 图标 + Shiki 代码高亮 + Framer Motion 动画 + Zustand 状态管理

**理由**: shadcn/ui 是可复制组件，不增加运行时依赖包大小，与 Tailwind CSS v4 原生兼容。Lucide 是 shadcn 默认图标库。Shiki 支持服务端渲染，适合 Next.js。Zustand 轻量（~1KB），适合向导步骤和 WebRTC 连接这两个状态域。

### D7: 路由结构

**选择**:
```
/                      Landing
/install               平台选择（自动检测 OS）
/install/windows       Windows 向导
/install/mac           macOS 向导
/install/customize     命令生成器
/transfer              创建/加入房间
/transfer/room         传输界面（动态，带 roomId query param）
/debug                 诊断首页
/debug/[slug]          问题详情
/debug/analyze         AI 分析器
```

**理由**: 扁平路由，符合 Next.js App Router 约定。`/transfer/room` 用 query param `?room=8742` 而非动态路由，因为房间号是临时的，不需要 SSR。

## Risks / Trade-offs

**[WebRTC 兼容性]** → 现代浏览器均支持 WebRTC DataChannel（Chrome/Firefox/Safari/Edge）。不支持 IE，但 OpenClaw 用户不太可能用 IE。兜底方案：显示"请使用现代浏览器"提示。

**[Durable Objects 冷启动]** → 首次创建房间可能有 ~100ms 冷启动延迟。对信令场景可接受，用户感知不到。

**[Workers AI 模型变更]** → Cloudflare 可能调整可用模型。将模型名提取为配置项，便于切换。

**[大文件传输]** → WebRTC DataChannel 理论上无文件大小限制，但浏览器内存受限。v1 限制单文件 100MB，大文件建议使用其他工具。

**[剪贴板 API 权限]** → `navigator.clipboard` 需要用户授权。首次使用时引导授权，授权失败回退到手动粘贴文本框。

**[隐私]** → 所有文件数据走 WebRTC P2P 直连，不经服务器。仅 SDP 信令（不含用户数据）经过 CF Worker。AI 分析时日志内容会发送到 Workers AI，需在 UI 中明确告知用户。
