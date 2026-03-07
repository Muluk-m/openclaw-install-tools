## ADDED Requirements

### Requirement: Log input interface
AI 日志分析页 SHALL 提供文本输入区域，用户可粘贴终端报错日志。

#### Scenario: User pastes log content
- **WHEN** 用户在 /debug/analyze 页面粘贴日志文本
- **THEN** 文本显示在输入区域，"分析"按钮可用

### Requirement: Two-tier analysis
系统 SHALL 先进行前端正则匹配，匹配失败后再调用 Workers AI 分析。

#### Scenario: Known error matched locally
- **WHEN** 用户提交的日志匹配前端已知错误模式
- **THEN** 立即显示匹配结果和修复建议，不调用 Workers AI

#### Scenario: Unknown error sent to AI
- **WHEN** 用户提交的日志不匹配任何已知模式
- **THEN** 将日志发送到 CF Worker API，由 Workers AI 分析，显示加载状态，返回后展示 AI 诊断结果和建议

### Requirement: AI analysis result display
AI 分析结果 SHALL 以结构化方式展示诊断信息。

#### Scenario: AI returns diagnosis
- **WHEN** Workers AI 完成分析
- **THEN** 显示：错误类型、可能原因、修复建议步骤、相关命令（可复制）

#### Scenario: AI analysis fails
- **WHEN** Workers AI 调用失败（网络错误或服务不可用）
- **THEN** 显示"AI 分析暂时不可用，请查看常见问题库"并链接到 /debug

### Requirement: Privacy notice
AI 分析页 SHALL 明确告知用户日志内容将发送到 Cloudflare Workers AI 进行分析。

#### Scenario: User sees privacy notice
- **WHEN** 用户访问 /debug/analyze
- **THEN** 页面显示隐私提示："您的日志内容将发送至 Cloudflare Workers AI 进行分析，不会被存储"
