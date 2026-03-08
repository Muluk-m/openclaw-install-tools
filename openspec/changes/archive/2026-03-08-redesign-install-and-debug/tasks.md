## 1. 清理废弃代码

- [x] 1.1 删除旧向导组件：`step-wizard.tsx`、`step-card.tsx`、`branch-selector.tsx`、`os-detector.tsx`
- [x] 1.2 删除旧向导页面：`install/windows/page.tsx`、`install/mac/page.tsx`、`install/customize/page.tsx`
- [x] 1.3 删除 `stores/wizard-store.ts`
- [x] 1.4 删除 `lib/error-patterns.ts`
- [x] 1.5 删除 `app/debug/[slug]/page.tsx` 已知问题详情页

## 2. 步骤数据

- [x] 2.1 重写 `src/lib/install-steps.ts`：定义新的 `InstallStep` 类型和三个阶段的步骤数据（environment / openclaw / feishu）
- [x] 2.2 填充环境准备阶段步骤：检查 Node.js、安装 Node.js、检查 npm/pnpm
- [x] 2.3 填充 OpenClaw 初始化阶段步骤：安装 OpenClaw、openclaw onboard、连接大模型、openclaw status
- [x] 2.4 填充飞书插件接入阶段步骤：创建应用、配权限、发布应用、安装插件、启动网关、配对授权，包含 externalLink 到官方文档

## 3. API 扩展

- [x] 3.1 扩展 `POST /api/analyze` 请求体：增加可选 `stepContext` 字段（title、description、expectedOutput）
- [x] 3.2 增加步骤验证模式的 system prompt：当 stepContext 存在时，以期望输出为 ground truth 判断通过/不通过
- [x] 3.3 统一返回格式：通过时返回 `{ pass: true, message }` ，不通过时返回 `{ pass: false, errorType, cause, fixSteps, commands }`

## 4. 新组件

- [x] 4.1 创建 `src/components/install/step-block.tsx`：单步展示组件，包含标题、描述（markdown）、命令块（复制）、期望输出对照、平台 tab 切换、外链按钮
- [x] 4.2 创建 `src/components/install/step-verifier.tsx`：AI 验证组件，包含粘贴区、检查按钮、loading 状态、通过/失败结果展示、字符数限制（10000）

## 5. 页面重写

- [x] 5.1 重写 `src/app/install/page.tsx`：读取步骤数据，按阶段分组渲染 step-block 列表
- [x] 5.2 重写 `src/app/debug/page.tsx`：移除搜索框和已知问题卡片，只保留日志粘贴区 + AI 分析按钮
- [x] 5.3 重写 `src/components/debug/log-analyzer.tsx`：移除 `matchError` 正则层，直接调用 `/api/analyze`

## 6. 收尾

- [x] 6.1 更新 navbar 导航链接（如有变化）
- [x] 6.2 更新首页卡片描述文字，反映新的安装文档定位
- [x] 6.3 验证所有路由可正常访问，无 broken import
