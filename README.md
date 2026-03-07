# OpenClaw Install Tools

帮你装好 [OpenClaw](https://openclaw.ai/) — 交互式安装向导、局域网文件传输、智能问题诊断。

## 功能

### 安装向导
- Windows / macOS 交互式安装引导
- 条件分支式步骤，根据你的环境自动推荐路径
- 一键复制命令、安装命令定制生成器

### LAN 传输
- 局域网 P2P 文件/文本传输（基于 WebRTC DataChannel）
- 数据不经服务器，隐私安全
- 支持文件传输、文本传输、剪贴板双向同步
- 4 位房间号配对，即开即用

### 问题诊断
- 常见安装错误速查（6 大类已知问题）
- AI 日志分析（Cloudflare Workers AI）
- 前端正则匹配 + AI 兜底，两层诊断策略

## 技术栈

- **框架**: Next.js 16 (App Router)
- **部署**: Cloudflare Workers
- **UI**: shadcn/ui + Tailwind CSS v4 + Lucide React
- **状态管理**: Zustand
- **P2P 传输**: WebRTC 原生 API
- **信令**: Cloudflare Durable Objects
- **AI 分析**: Cloudflare Workers AI

## 开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建
npm run build

# 本地预览（Cloudflare 环境）
npm run preview

# 部署到 Cloudflare
npm run deploy
```

## Cloudflare 配置

项目使用了以下 Cloudflare 特性，部署前需确保已启用：

- **Durable Objects**: 用于 WebRTC 信令中转（房间管理）
- **Workers AI**: 用于日志分析（llama 模型）

配置已在 `wrangler.jsonc` 中定义。

## 项目结构

```
src/
├── app/                    # 页面路由
│   ├── install/            # 安装向导
│   ├── transfer/           # LAN 传输
│   ├── debug/              # 问题诊断
│   └── api/                # API 路由
├── components/
│   ├── ui/                 # shadcn 组件
│   ├── install/            # 安装向导组件
│   ├── transfer/           # 传输组件
│   └── debug/              # 诊断组件
├── lib/                    # 工具库
│   ├── webrtc.ts           # WebRTC 连接管理
│   ├── signaling.ts        # 信令客户端
│   ├── error-patterns.ts   # 错误模式库
│   └── install-steps.ts    # 安装步骤数据
└── stores/                 # Zustand 状态
```

## 贡献

欢迎贡献! 主要贡献方向：

- 补充安装步骤内容（特别是不同系统版本的差异）
- 添加更多已知错误模式到 `src/lib/error-patterns.ts`
- 改进 UI/UX
- 添加新的聊天平台支持到命令生成器

## License

[MIT](./LICENSE)
