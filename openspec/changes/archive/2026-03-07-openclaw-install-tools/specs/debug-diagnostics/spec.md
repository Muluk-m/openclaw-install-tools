## ADDED Requirements

### Requirement: Error search
诊断首页 SHALL 提供搜索框，用户输入错误信息关键词后匹配已知问题。

#### Scenario: Search matches known error
- **WHEN** 用户在搜索框输入"EACCES"
- **THEN** 显示匹配的问题列表（如"npm 权限错误"），点击可跳转到详情页

#### Scenario: Search has no matches
- **WHEN** 用户输入的关键词无匹配结果
- **THEN** 显示"未找到匹配问题，试试 AI 分析"并提供跳转 /debug/analyze 的链接

### Requirement: Popular issues list
诊断首页 SHALL 展示热门/常见安装问题列表。

#### Scenario: View popular issues
- **WHEN** 用户访问 /debug 页面
- **THEN** 显示预定义的常见问题列表（如 EACCES、command not found、SSL 证书、网络超时、端口占用、API Key 配置），每项显示简要描述

### Requirement: Issue detail page
每个已知问题 SHALL 有独立详情页，包含原因解释、分步修复指南、平台特定命令。

#### Scenario: View issue detail
- **WHEN** 用户点击问题列表中的某个问题
- **THEN** 跳转到 /debug/[slug] 页面，显示：问题原因、Windows 修复步骤、macOS 修复步骤、可复制的修复命令

### Requirement: Frontend error pattern matching
系统 SHALL 在前端使用正则表达式匹配已知错误模式，在 `lib/error-patterns.ts` 中维护模式库。

#### Scenario: Known error pattern detected
- **WHEN** 用户在 AI 分析器中粘贴的日志包含已知错误模式（如 "ERR! code EACCES"）
- **THEN** 立即（不调用 AI）显示匹配的问题和修复建议，响应时间 < 100ms
