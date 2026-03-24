## ADDED Requirements

### Requirement: 发送端在 file-end 前等待 buffer drain
发送端在发送完最后一个 chunk 后，SHALL 等待 DataChannel 的 bufferedAmount 降至阈值以下，然后再发送 `file-end` 消息。

#### Scenario: 大文件发送完最后一个 chunk
- **WHEN** 发送端发送完文件的最后一个 chunk
- **THEN** 系统 SHALL 调用 waitForDrain() 等待 buffer 清空后再发送 file-end 消息

### Requirement: file-end 消息携带 totalBytes
发送端的 `file-end` 消息 SHALL 包含 `totalBytes` 字段，值为文件的原始字节大小。

#### Scenario: 发送端发送 file-end
- **WHEN** 文件所有 chunk 发送完毕且 buffer 已 drain
- **THEN** 发送的 file-end 消息 SHALL 包含 `{ type: "file-end", id, totalBytes: file.size }`

### Requirement: 接收端字节数校验
接收端收到 `file-end` 消息时，SHALL 比对已接收字节数（receivedBytes）与 `totalBytes`，如不匹配则将该传输标记为 error 状态。

#### Scenario: 接收字节数匹配
- **WHEN** 接收端收到 file-end 且 receivedBytes === totalBytes
- **THEN** 系统 SHALL 正常完成传输，组装文件数据

#### Scenario: 接收字节数不匹配
- **WHEN** 接收端收到 file-end 且 receivedBytes !== totalBytes
- **THEN** 系统 SHALL 将该传输标记为 error 状态，清空 receiveBuffer，并通过 dataHandler 通知上层

### Requirement: 传输完成自动下载
接收端文件传输完成后，SHALL 自动触发浏览器下载，无需用户手动操作。

#### Scenario: 单个文件传输完成
- **WHEN** 接收端文件状态变为 done 且 data 不为空
- **THEN** 系统 SHALL 自动创建下载链接并触发浏览器下载

#### Scenario: 自动下载后仍可手动下载
- **WHEN** 文件已自动下载完成
- **THEN** 文件列表中 SHALL 仍展示下载按钮，用户可再次手动下载
