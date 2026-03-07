## Why

OpenClaw (https://openclaw.ai/) 是一个部署在个人电脑上的 AI 助手，安装过程涉及 Node.js 环境、多种安装方式（curl/npm/git）、多平台差异（Windows/macOS），对非技术用户门槛较高。目前缺少一个交互式的安装引导工具，也缺少远程协助朋友安装时的文件/日志传输手段。本项目填补"官方 README"和"社区人工求助"之间的空白，提供"帮你装"的体验层。

## What Changes

- 新增交互式安装向导，支持 Windows 和 macOS 两条安装路径，采用条件分支引导用户根据自身环境走不同步骤
- 新增安装命令生成器，用户选择平台、安装方式、AI 模型、聊天平台后生成定制化安装命令
- 新增基于 WebRTC DataChannel 的局域网 P2P 文件/文本传输工具，通过 Cloudflare Durable Objects 做信令中转，支持文件传输、文本传输、剪贴板双向同步
- 新增常见安装问题诊断模块，包含已知错误模式库（前端正则匹配）和 Cloudflare Workers AI 兜底分析
- 新增项目 Landing 页，展示项目价值和三大功能入口

## Capabilities

### New Capabilities

- `install-wizard`: 条件分支式安装向导，支持 Windows/macOS 平台检测、步骤分支、可复制命令块
- `install-customizer`: 安装命令生成器，根据用户选择的平台/安装方式/AI模型/聊天平台生成定制命令
- `lan-transfer`: 基于 WebRTC P2P 的局域网文件/文本传输，含房间号配对、Durable Objects 信令、文件传输、文本传输、剪贴板同步
- `debug-diagnostics`: 安装问题诊断模块，含已知错误正则匹配库、搜索、问题详情页
- `ai-log-analyzer`: Workers AI 驱动的错误日志分析器，用户粘贴日志后给出诊断和修复建议
- `app-shell`: 全局布局骨架，含导航栏、暗色模式、响应式设计、Landing 页

### Modified Capabilities

（无，这是全新项目）

## Impact

- **依赖新增**: shadcn/ui, lucide-react, shiki, framer-motion, zustand
- **Cloudflare 配置**: 需要启用 Durable Objects（信令中转）和 Workers AI（错误分析）
- **wrangler.jsonc**: 需添加 Durable Object binding 和 AI binding 配置
- **项目结构**: 从默认 Next.js 模板重构为多模块应用，新增 components/, lib/, stores/ 目录结构
