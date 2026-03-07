## ADDED Requirements

### Requirement: Room creation
系统 SHALL 允许用户创建一个传输房间，生成 4 位数字房间号，房间 5 分钟内无连接自动过期。

#### Scenario: User creates a room
- **WHEN** 用户在 /transfer 页面点击"创建房间"
- **THEN** 系统通过 CF Durable Object 创建房间，返回 4 位数字房间号，页面跳转到 /transfer/room?room=XXXX 并显示"等待对方加入"

#### Scenario: Room expires
- **WHEN** 房间创建后 5 分钟内无人加入
- **THEN** Durable Object 自动销毁房间，房间号可被复用

### Requirement: Room joining
系统 SHALL 允许用户通过输入房间号加入已存在的房间。

#### Scenario: User joins with valid room code
- **WHEN** 用户输入正确的 4 位房间号并点击"加入"
- **THEN** 系统匹配房间，开始 WebRTC 信令交换，建立 P2P 连接

#### Scenario: User joins with invalid room code
- **WHEN** 用户输入不存在或已过期的房间号
- **THEN** 显示错误提示"房间不存在或已过期"

### Requirement: WebRTC P2P connection
系统 SHALL 通过 Cloudflare Durable Objects WebSocket 交换 SDP 信令，建立 WebRTC DataChannel 直连。

#### Scenario: Successful P2P connection
- **WHEN** 两个设备完成 SDP 交换
- **THEN** WebRTC DataChannel 建立，连接状态显示"已连接"，后续数据传输不经服务器

#### Scenario: Connection lost
- **WHEN** WebRTC 连接断开（如设备离开网络）
- **THEN** 连接状态显示"连接断开"，提供"重新连接"按钮

### Requirement: File transfer
系统 SHALL 支持通过 WebRTC DataChannel 发送和接收文件。

#### Scenario: Send a file
- **WHEN** 用户选择文件并点击"发送"
- **THEN** 文件通过 DataChannel 传输，双方显示传输进度条

#### Scenario: Receive a file
- **WHEN** 对方发送文件
- **THEN** 接收方显示文件名和大小，传输完成后提供"下载"按钮

#### Scenario: File size limit
- **WHEN** 用户选择超过 100MB 的文件
- **THEN** 显示警告"文件过大，建议使用其他传输工具"，但不阻止发送

### Requirement: Text transfer
系统 SHALL 支持通过 WebRTC DataChannel 发送和接收文本消息。

#### Scenario: Send text
- **WHEN** 用户在文本输入框粘贴内容并点击"发送"
- **THEN** 文本通过 DataChannel 实时发送，对方立即收到并显示

#### Scenario: Receive text
- **WHEN** 对方发送文本
- **THEN** 接收方文本区域显示收到的内容，可一键复制

### Requirement: Clipboard sync
系统 SHALL 支持双向剪贴板同步功能。

#### Scenario: Enable clipboard sync
- **WHEN** 用户点击"开启剪贴板同步"
- **THEN** 系统请求剪贴板权限，授权后双方剪贴板内容变更自动同步

#### Scenario: Clipboard permission denied
- **WHEN** 用户拒绝剪贴板权限
- **THEN** 显示提示"剪贴板同步需要权限，您可以使用手动粘贴方式"，回退到文本传输模式
