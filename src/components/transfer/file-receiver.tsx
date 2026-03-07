"use client";

import { Download, FileIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TransferItem } from "@/lib/webrtc";

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileReceiver({ items }: { items: TransferItem[] }) {
  const fileItems = items.filter(
    (i) => i.type === "file" && i.direction === "receive"
  );

  if (fileItems.length === 0) return null;

  const handleDownload = (item: TransferItem) => {
    if (!item.data) return;
    const blob = new Blob([item.data]);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = item.name ?? "file";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-medium text-muted-foreground">收到的文件</h3>
      {fileItems.map((item) => (
        <div
          key={item.id}
          className="flex items-center justify-between rounded-lg border p-3"
        >
          <div className="flex items-center gap-2">
            <FileIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{item.name}</span>
            <span className="text-xs text-muted-foreground">
              {item.size ? formatSize(item.size) : ""}
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => handleDownload(item)}>
            <Download className="mr-1 h-3.5 w-3.5" />
            下载
          </Button>
        </div>
      ))}
    </div>
  );
}
