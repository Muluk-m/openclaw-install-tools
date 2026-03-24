## 1. 发送端修复

- [x] 1.1 在 `sendFile` 中，发送 `file-end` 前增加 `await this.waitForDrain()` 确保最后的 chunk 已 drain
- [x] 1.2 `file-end` 消息增加 `totalBytes` 字段，值为 `file.size`

## 2. 接收端完整性校验

- [x] 2.1 在 `setupConnection` 的 `file-end` 处理中，比对 `receivedBytes` 与 `msg.totalBytes`，不匹配则标记 error 并清空 buffer
- [x] 2.2 错误状态通过 dataHandler 和 progressHandler 通知上层（emit error status）

## 3. 自动下载

- [x] 3.1 在 `file-receiver.tsx` 的 `FileItem` 组件中，当 `item.data` 首次出现时自动触发 `handleDownload()`（使用 useEffect 监听 item.data）
- [x] 3.2 保留手动下载和预览按钮不变
