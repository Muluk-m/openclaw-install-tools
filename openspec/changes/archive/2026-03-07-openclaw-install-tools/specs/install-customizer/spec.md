## ADDED Requirements

### Requirement: Install command generator
系统 SHALL 提供一个交互式命令生成器，用户选择配置项后生成定制化的安装命令。

#### Scenario: User selects all options and generates command
- **WHEN** 用户选择平台（Windows/macOS）、安装方式（curl/npm/git）、AI 模型（Anthropic/OpenAI/Local）、聊天平台（Telegram/Discord/Slack 等多选）
- **THEN** 页面实时生成对应的安装命令组合

#### Scenario: User copies generated command
- **WHEN** 用户点击生成命令区域的复制按钮
- **THEN** 完整命令文本复制到剪贴板

### Requirement: Dynamic option filtering
命令生成器 SHALL 根据用户选择动态过滤可用选项。

#### Scenario: curl only available on macOS
- **WHEN** 用户选择 Windows 平台
- **THEN** curl 安装方式选项不可用（置灰或隐藏）

#### Scenario: Options update command in real-time
- **WHEN** 用户更改任何配置项
- **THEN** 生成的命令立即更新，无需点击"生成"按钮
