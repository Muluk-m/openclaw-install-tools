## ADDED Requirements

### Requirement: AI 验证接受步骤上下文
`POST /api/analyze` 接口 SHALL 接受可选的 `stepContext` 字段，包含当前步骤标题、描述和期望输出。当 stepContext 存在时，AI 以步骤验证模式工作。

#### Scenario: 带步骤上下文的验证请求
- **WHEN** 请求体包含 `{ log: "...", stepContext: { title: "...", description: "...", expectedOutput: "..." } }`
- **THEN** AI 的 system prompt 包含步骤上下文信息，以期望输出为 ground truth 判断用户输出是否正确

#### Scenario: 不带步骤上下文的通用分析
- **WHEN** 请求体只包含 `{ log: "..." }` 没有 stepContext
- **THEN** AI 以通用日志分析模式工作（与当前 `/debug` 页面行为一致）

### Requirement: AI 验证返回结构化结果
AI 验证 SHALL 返回结构化的 JSON 结果，包含通过/不通过判断、问题原因和修复建议。

#### Scenario: 验证通过的返回
- **WHEN** AI 判断用户输出符合预期
- **THEN** 返回 `{ "pass": true, "message": "简短确认信息" }`

#### Scenario: 验证不通过的返回
- **WHEN** AI 判断用户输出不符合预期
- **THEN** 返回 `{ "pass": false, "errorType": "...", "cause": "...", "fixSteps": ["..."], "commands": ["..."] }`

### Requirement: 诊断页面仅保留 AI 分析
`/debug` 页面 SHALL 只提供一个日志粘贴区和 AI 分析按钮，移除硬编码的错误模式搜索和已知问题卡片。

#### Scenario: 用户使用通用诊断
- **WHEN** 用户访问 `/debug` 页面
- **THEN** 页面显示一个文本区域用于粘贴日志、一个"分析"按钮、隐私提示文字，无搜索框和预设问题卡片

#### Scenario: AI 分析日志
- **WHEN** 用户粘贴日志并点击"分析"
- **THEN** 调用 `POST /api/analyze`（不带 stepContext），显示 loading 状态，完成后展示 AI 的分析结果

### Requirement: AI 验证输入限制
系统 SHALL 限制用户粘贴的日志内容不超过 10,000 字符，与当前 API 限制保持一致。

#### Scenario: 超长输入
- **WHEN** 用户粘贴的内容超过 10,000 字符
- **THEN** 禁用提交按钮并显示字符数超限提示
