## Context

当前项目有三个模块：安装向导（/install）、LAN 传输（/transfer）、错误诊断（/debug）。安装向导是一个基于 Zustand 状态机的分支式 wizard，用 Framer Motion 做步骤间切换动画，数据结构是一棵 StepTree（节点 + 分支）。诊断模块是两层架构：先用 6 个硬编码正则匹配，再用 Workers AI（Llama 3.1 8B）兜底。

问题：向导本质上是让用户复制粘贴命令，做成复杂的状态机过度设计了；硬编码正则覆盖不到真实问题，不好用。

技术栈：Next.js 16 + React 19 + Tailwind v4 + shadcn/ui + Framer Motion，部署在 Cloudflare Workers。

## Goals / Non-Goals

**Goals:**
- 用线性的交互式安装文档替代分支式向导，每步提供 shell 命令复制 + 输出验证
- 每一步的验证全部交给 AI（Workers AI），不再硬编码匹配规则
- 覆盖完整安装流程：环境准备 → OpenClaw 初始化 → 飞书插件接入
- 保留 `/debug` 作为独立的通用 AI 诊断入口
- 删除所有废弃代码，保持代码库精简

**Non-Goals:**
- 不改动 `/transfer` 模块
- 不更换技术栈或 UI 组件库
- 不做自动化安装检测（比如跑 WebSocket 连本地 agent）
- 不做多语言支持

## Decisions

### 1. 线性文档 vs 分支向导

**选择：线性文档**

当前向导有 Windows/macOS 两棵独立的 step tree，加上安装方式分支（npm/git/curl）。新设计改为单一线性步骤列表，平台差异在步骤内用 tab 切换（macOS / Windows），不再用路由分离。

理由：用户实际上不需要被引导选择路径，他们知道自己用什么系统。把选择降级为步骤内的 tab 切换，减少导航复杂度。

替代方案：保留按 OS 分路由 → 增加维护成本，步骤内容大量重复。

### 2. 验证方式：纯 AI vs 正则 + AI

**选择：纯 AI**

每一步的输出验证都发给 Workers AI，附带当前步骤的上下文（标题、描述、期望输出）。不再维护正则规则。

理由：硬编码正则只能匹配预设的几种错误，覆盖率低；AI 能处理各种意外输出并给出针对性建议。Workers AI 在 Cloudflare edge 运行，延迟可接受。

替代方案：正则快速通道 + AI 兜底 → 增加维护负担，且正则无法覆盖的场景才是用户真正需要帮助的。

### 3. 步骤数据结构

**选择：扁平数组 + 阶段分组**

```typescript
interface InstallStep {
  id: string
  phase: 'environment' | 'openclaw' | 'feishu'
  title: string
  description: string          // markdown
  command?: string             // 要复制执行的 shell 命令
  platformCommands?: {         // 平台差异命令
    mac?: string
    windows?: string
  }
  expectedOutput?: string      // 期望输出示例
  externalLink?: {             // 外部链接（飞书文档等）
    url: string
    label: string
  }
  verifiable: boolean          // 是否有输出可以验证
}
```

替代方案：保留 StepTree 图结构 → 过度复杂，线性流程不需要图。

### 4. API 路由复用

**选择：复用 `POST /api/analyze`，扩展 prompt**

在请求体中增加 `stepContext` 字段（可选）。当有 stepContext 时，AI 以步骤验证模式工作；没有时，以通用日志分析模式工作（`/debug` 页面使用）。

替代方案：新建独立 API 路由 → 不必要的拆分，两者本质都是调 Workers AI。

### 5. 飞书插件步骤中的非 shell 操作

**选择：图文说明 + 外链 + 关键节点验证**

飞书开放平台的操作（建应用、配权限、发版）用图文说明 + 外链到官方文章。到了可以用 shell 验证的节点（如安装插件、启动网关、配对授权），恢复命令复制 + AI 验证模式。

## Risks / Trade-offs

- **[Workers AI 延迟]** 每次验证都调 AI，比正则慢 → 可接受，用户在安装过程中不会频繁验证；加 loading 状态即可
- **[AI 输出不稳定]** Llama 3.1 8B 可能给出不准确的判断 → 在 prompt 中提供充分的步骤上下文和期望输出作为 ground truth，降低幻觉风险
- **[飞书文档外链失效]** 官方文章可能被删除或链接变更 → 低风险，但需要定期检查；关键步骤在本地也有说明，不完全依赖外链
- **[删除代码量大]** 一次性删除多个组件和页面 → 代码都在版本控制中，可回溯；删除前确认无其他模块引用
