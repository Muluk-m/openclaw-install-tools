## ADDED Requirements

### Requirement: Platform auto-detection
系统 SHALL 通过浏览器 User-Agent 自动检测用户操作系统（Windows/macOS/Linux），并在 /install 页面默认高亮对应平台入口。

#### Scenario: Windows user visits install page
- **WHEN** 用户使用 Windows 浏览器访问 /install
- **THEN** Windows 安装入口默认高亮，用户可直接点击进入

#### Scenario: macOS user visits install page
- **WHEN** 用户使用 macOS 浏览器访问 /install
- **THEN** macOS 安装入口默认高亮

#### Scenario: Unsupported or undetectable OS
- **WHEN** 系统无法识别用户 OS
- **THEN** 不高亮任何平台，用户手动选择

### Requirement: Conditional branch wizard
安装向导 SHALL 采用条件分支模式，根据用户选择动态展示不同步骤路径。步骤数据定义在 `lib/install-steps.ts` 中，组件读取数据驱动渲染。

#### Scenario: User has Node.js installed
- **WHEN** 用户在"检查 Node.js"步骤选择"已安装"
- **THEN** 跳过 Node.js 安装步骤，直接进入 OpenClaw 安装步骤

#### Scenario: User does not have Node.js
- **WHEN** 用户在"检查 Node.js"步骤选择"未安装"
- **THEN** 展开 Node.js 安装子步骤（含下载链接和验证命令）

#### Scenario: User navigates backward
- **WHEN** 用户点击"上一步"
- **THEN** 回到之前的步骤，之前的选择状态保留

### Requirement: Copyable command blocks
向导中的所有终端命令 SHALL 提供一键复制功能，并使用 Shiki 进行语法高亮。

#### Scenario: User copies a command
- **WHEN** 用户点击命令块的复制按钮
- **THEN** 命令文本复制到剪贴板，按钮显示"已复制"反馈，2 秒后恢复

### Requirement: Windows installation flow
Windows 向导 SHALL 覆盖以下步骤路径：检查 Node.js → 选择安装方式（npm/git clone）→ 执行安装 → onboard 配置（选择 AI 模型、聊天平台）→ 验证安装。

#### Scenario: Windows npm install path
- **WHEN** 用户选择 npm 安装方式
- **THEN** 展示 `npm i -g openclaw` 命令，后续展示 `openclaw onboard` 步骤

#### Scenario: Windows git install path
- **WHEN** 用户选择 git 安装方式
- **THEN** 展示 git clone + pnpm install + pnpm build 系列命令

### Requirement: macOS installation flow
macOS 向导 SHALL 覆盖以下步骤路径：检查 Homebrew → 检查 Node.js → 选择安装方式（curl/npm/git clone）→ 执行安装 → onboard 配置 → 验证安装。

#### Scenario: macOS curl one-liner path
- **WHEN** 用户选择 curl 安装方式
- **THEN** 展示 `curl -fsSL https://openclaw.ai/install.sh | bash` 命令

#### Scenario: macOS without Homebrew
- **WHEN** 用户在"检查 Homebrew"步骤选择"未安装"
- **THEN** 展开 Homebrew 安装子步骤，然后继续 Node.js 检查
