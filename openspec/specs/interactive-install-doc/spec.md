## ADDED Requirements

### Requirement: 分阶段线性安装文档
系统 SHALL 在 `/install` 路由展示一个线性的分阶段安装文档，包含三个阶段：环境准备（environment）、OpenClaw 初始化（openclaw）、飞书插件接入（feishu）。所有步骤按顺序展示在同一个页面上，不使用路由跳转。

#### Scenario: 用户访问安装页面
- **WHEN** 用户访问 `/install`
- **THEN** 页面展示所有安装步骤，按三个阶段分组显示，每个阶段有明确的标题分隔

### Requirement: 步骤包含可复制的 shell 命令
对于需要执行终端命令的步骤，系统 SHALL 显示一个代码块，包含要执行的 shell 命令和一键复制按钮。

#### Scenario: 用户复制安装命令
- **WHEN** 步骤包含 shell 命令
- **THEN** 显示带有 Copy 按钮的代码块，点击后命令被复制到剪贴板，按钮显示已复制状态

### Requirement: 步骤包含期望输出对照
对于可验证的步骤，系统 SHALL 显示一个"期望输出"示例区域，让用户知道正确的输出长什么样。

#### Scenario: 用户查看期望输出
- **WHEN** 步骤定义了 expectedOutput
- **THEN** 在命令块下方显示期望输出示例，使用视觉区分样式（如浅色背景 + 标签"期望输出"）

### Requirement: 步骤包含输出粘贴验证区
对于可验证的步骤，系统 SHALL 提供一个文本输入区域，让用户粘贴实际终端输出，并提供"检查"按钮触发 AI 验证。

#### Scenario: 用户粘贴输出并触发验证
- **WHEN** 用户在验证区粘贴文本并点击"检查"按钮
- **THEN** 系统将用户输出连同步骤上下文发送给 AI 验证，显示 loading 状态

#### Scenario: 验证通过
- **WHEN** AI 判断输出符合预期
- **THEN** 显示成功状态（绿色确认信息）

#### Scenario: 验证失败
- **WHEN** AI 判断输出不符合预期
- **THEN** 显示失败状态，包含 AI 给出的问题原因和修复建议

### Requirement: 平台差异通过 tab 切换
当步骤在 macOS 和 Windows 上有不同命令时，系统 SHALL 使用 tab 切换展示两个平台的命令，而非分离路由。

#### Scenario: 用户切换平台 tab
- **WHEN** 步骤定义了 platformCommands（mac + windows）
- **THEN** 显示 macOS / Windows 两个 tab，用户可切换查看对应平台的命令

### Requirement: 飞书插件步骤支持图文引导和外链
飞书插件接入阶段中，非 shell 操作的步骤 SHALL 展示图文说明并提供外链到飞书官方文档。

#### Scenario: 用户查看飞书配置步骤
- **WHEN** 步骤包含 externalLink
- **THEN** 显示步骤说明文字，并在显眼位置展示外链按钮，点击后在新标签页打开官方文档

### Requirement: 步骤数据由单一数据文件驱动
所有安装步骤 SHALL 定义在 `src/lib/install-steps.ts` 中，页面组件从该文件读取数据渲染，不在组件中硬编码步骤内容。

#### Scenario: 新增或修改步骤
- **WHEN** 需要调整安装流程
- **THEN** 只需修改 `src/lib/install-steps.ts` 中的数据，无需修改组件代码
