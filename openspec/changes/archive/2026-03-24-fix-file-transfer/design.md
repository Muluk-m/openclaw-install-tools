## Context

当前文件传输基于 PeerJS (WebRTC DataChannel)，发送端将文件切片为 16KB chunk 逐个发送，接收端收集所有 `ArrayBuffer` chunk 后拼接成 Blob。存在两个问题：

1. **文件不完整**：发送端发完所有 chunk 后立即发送 `file-end` 信号，但 DataChannel 是异步的，接收端可能还没收完所有 chunk 就收到了 `file-end`，导致丢失尾部数据。当前没有完整性校验机制。
2. **需要额外下载**：接收端收到文件后仅展示在列表中，用户需手动点击"下载"按钮才能保存，这在局域网传输场景中不符合预期。

## Goals / Non-Goals

**Goals:**
- 确保接收端收到的文件与发送端完全一致（字节数校验）
- 传输完成后自动触发浏览器下载，零操作即可保存文件

**Non-Goals:**
- 不做 hash 级别的校验（字节数校验已足够检测丢包）
- 不做断点续传
- 不改变 chunk 大小或传输协议

## Decisions

### 1. 发送端等待 buffer 清空后再发 file-end

**选择**：在发送最后一个 chunk 后，调用 `waitForDrain()` 确保 DataChannel 的 `bufferedAmount` 降到阈值以下，然后再发送 `file-end`。

**理由**：当前 `sendFile` 在循环中每个 chunk 后都会 `waitForDrain`，但循环结束后直接发 `file-end`，没有等最后一批 chunk drain。这可能导致 `file-end` 和最后几个 chunk 的顺序在接收端不确定。

**替代方案**：在 `file-end` 中带 totalBytes 让接收端等待——但这更复杂，且根本原因是发送端时序问题。

### 2. file-end 消息携带 totalBytes 做校验

**选择**：`file-end` 消息增加 `totalBytes` 字段（即 `file.size`），接收端比对 `receivedBytes` 与 `totalBytes`，不匹配则标记 error。

**理由**：作为防御性措施，即使修复了时序问题，校验仍然是必要的安全网。

### 3. 接收端传输完成后自动触发下载

**选择**：在 `file-receiver.tsx` 的 `FileItem` 组件中，当 `item.data` 首次变为非空（status 变为 done）时，自动调用 `handleDownload()`。

**理由**：局域网传输的核心场景是"发过来就收到"，手动下载增加了不必要的步骤。自动下载后仍保留手动下载按钮以防用户需要再次下载。

**替代方案**：使用 File System Access API 直接写入——但兼容性差，移动端不支持。

## Risks / Trade-offs

- **自动下载可能被浏览器拦截**：多个文件同时完成时，浏览器可能阻止批量下载。→ 缓解：逐个文件触发，间隔时间由传输本身自然间隔保证。
- **用户可能不想自动下载每个文件**：→ 当前场景是局域网面对面传输，用户明确知道要接收文件，自动下载是合理的默认行为。
