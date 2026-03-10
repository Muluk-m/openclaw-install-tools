"use client";

import { useRef } from "react";
import { Upload, FileIcon, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTransferStore } from "@/stores/transfer-store";
import type { TransferItem } from "@/lib/webrtc";

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function SendItem({ item }: { item: TransferItem }) {
  const progress = item.progress ?? 0;
  const percent = Math.round(progress * 100);

  return (
    <div className="flex items-center gap-3 rounded-lg border p-3">
      <FileIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm">{item.name}</p>
        <div className="mt-1 flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${percent}%` }}
            />
          </div>
          <span className="shrink-0 text-xs text-muted-foreground">
            {item.status === "done"
              ? formatSize(item.size ?? 0)
              : `${percent}%`}
          </span>
        </div>
      </div>
      <div className="shrink-0">
        {item.status === "done" && (
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        )}
        {item.status === "error" && (
          <AlertCircle className="h-4 w-4 text-destructive" />
        )}
        {(item.status === "transferring" || item.status === "pending") && (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>
    </div>
  );
}

export function FileSender() {
  const { sendFile, connectionState, items } = useTransferStore();
  const inputRef = useRef<HTMLInputElement>(null);

  const sendItems = items.filter(
    (i) => i.type === "file" && i.direction === "send"
  );

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await sendFile(file);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="flex flex-col gap-3">
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={handleFileChange}
      />
      <Button
        onClick={() => inputRef.current?.click()}
        disabled={connectionState !== "connected"}
        variant="outline"
        className="w-full"
      >
        <Upload className="mr-2 h-4 w-4" />
        选择文件发送
      </Button>

      {sendItems.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-medium text-muted-foreground">
            发送的文件
          </h3>
          {sendItems.map((item) => (
            <SendItem key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
