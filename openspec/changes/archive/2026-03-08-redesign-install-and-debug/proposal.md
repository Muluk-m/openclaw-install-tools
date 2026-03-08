## Why

当前安装向导是一个分支式的交互式 wizard，本质上就是让用户一步步复制粘贴命令，用 README 就能解决的事情却做成了复杂的状态机。诊断模块硬编码了 6 个正则匹配模式，覆盖不到用户实际遇到的问题，形同虚设。需要重新设计为更实用的形态：交互式安装文档 + 纯 AI 诊断。

## What Changes

- **BREAKING** 删除分支式安装向导（step-wizard、branch-selector、os-detector、wizard-store 等），替换为线性的交互式安装文档
- **BREAKING** 删除硬编码的错误模式库（error-patterns.ts、已知问题详情页 `/debug/[slug]`）
- 新增交互式安装文档页面：分阶段展示步骤，每步提供 shell 命令复制 + 输出粘贴 + AI 验证
- 新增飞书插件接入引导（图文说明 + 外链官方文档 + 关键节点验证）
- 简化诊断页面为纯 AI 分析入口（保留 Workers AI 调用，移除正则预处理层）
- `/transfer` 模块保持不变

## Capabilities

### New Capabilities
- `interactive-install-doc`: 交互式安装文档，分三个阶段（环境准备、OpenClaw 初始化、飞书插件接入），每步包含说明、shell 命令复制、期望输出对照、粘贴验证区、AI 诊断
- `step-ai-verifier`: 步骤级 AI 验证能力，接收当前步骤上下文 + 期望输出 + 用户实际输出，判断通过/不通过并给出修复建议

### Modified Capabilities
<!-- 无现有 spec 需要修改 -->

## Impact

- 删除文件：`src/lib/error-patterns.ts`、`src/stores/wizard-store.ts`、`src/components/install/step-wizard.tsx`、`src/components/install/step-card.tsx`、`src/components/install/branch-selector.tsx`、`src/components/install/os-detector.tsx`、`src/app/install/windows/page.tsx`、`src/app/install/mac/page.tsx`、`src/app/install/customize/page.tsx`、`src/app/debug/[slug]/page.tsx`
- 重写文件：`src/lib/install-steps.ts`（新数据结构）、`src/app/install/page.tsx`、`src/app/debug/page.tsx`、`src/components/debug/log-analyzer.tsx`
- 新增组件：步骤块组件、AI 验证组件
- API 路由 `POST /api/analyze` 保留但需要扩展 prompt 以支持步骤上下文验证
- 无依赖变更，技术栈不变
