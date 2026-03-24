## Why

局域网文件传输存在两个问题：(1) 大文件传输后内容不完整，接收端收到的数据可能丢失尾部 chunk；(2) 传输完成后接收端需要手动点击"下载"按钮才能保存文件，体验不直观——用户期望传输完成即等于"已收到文件"，不应还有额外的下载步骤。

## What Changes

- 修复文件传输完整性问题：发送端在 `file-end` 消息中附带总字节数，接收端校验收到的字节数是否匹配，不匹配则报错
- 接收端传输完成后自动触发浏览器下载，无需用户手动点击
- 保留预览和手动下载按钮作为辅助操作，但文件到达即自动保存

## Capabilities

### New Capabilities
- `reliable-file-transfer`: 文件传输完整性校验与自动下载机制

### Modified Capabilities

## Impact

- `src/lib/webrtc.ts` — 发送端 `file-end` 消息增加 `totalBytes` 字段；接收端增加字节数校验逻辑
- `src/components/transfer/file-receiver.tsx` — 传输完成后自动触发下载
- `src/stores/transfer-store.ts` — 可能需要调整 `onData` 回调中的文件完成处理逻辑
