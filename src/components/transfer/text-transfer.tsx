"use client";

import { useState } from "react";
import { Send, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useTransferStore } from "@/stores/transfer-store";
import type { TransferItem } from "@/lib/webrtc";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <Button variant="ghost" size="icon-xs" onClick={handleCopy}>
      {copied ? (
        <Check className="h-3 w-3 text-green-500" />
      ) : (
        <Copy className="h-3 w-3" />
      )}
    </Button>
  );
}

export function TextTransfer({ items }: { items: TransferItem[] }) {
  const { sendText, connectionState } = useTransferStore();
  const [text, setText] = useState("");

  const textItems = items.filter((i) => i.type === "text" && i.name !== "__clipboard__");

  const handleSend = () => {
    if (!text.trim()) return;
    sendText(text);
    setText("");
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Textarea
          placeholder="输入要发送的文本..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSend();
          }}
          rows={4}
        />
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">
            Ctrl/Cmd + Enter 发送
          </span>
          <Button
            onClick={handleSend}
            disabled={connectionState !== "connected" || !text.trim()}
            size="sm"
          >
            <Send className="mr-1 h-3.5 w-3.5" />
            发送
          </Button>
        </div>
      </div>

      {textItems.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-medium text-muted-foreground">消息记录</h3>
          {textItems.map((item) => (
            <div
              key={item.id}
              className={`rounded-lg border p-3 text-sm ${
                item.direction === "send"
                  ? "ml-8 bg-primary/5"
                  : "mr-8 bg-muted"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <pre className="whitespace-pre-wrap break-all font-mono text-xs flex-1">
                  {item.text}
                </pre>
                {item.text && <CopyButton text={item.text} />}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {item.direction === "send" ? "你" : "对方"}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
