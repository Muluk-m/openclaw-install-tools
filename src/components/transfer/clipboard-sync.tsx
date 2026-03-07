"use client";

import { useEffect, useRef } from "react";
import { ClipboardCopy } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useTransferStore } from "@/stores/transfer-store";

export function ClipboardSync() {
  const { clipboardSyncEnabled, toggleClipboardSync, manager, connectionState } =
    useTransferStore();
  const lastClipboard = useRef("");

  useEffect(() => {
    if (!clipboardSyncEnabled || connectionState !== "connected" || !manager)
      return;

    const interval = setInterval(async () => {
      try {
        const text = await navigator.clipboard.readText();
        if (text && text !== lastClipboard.current) {
          lastClipboard.current = text;
          manager.sendClipboard(text);
        }
      } catch {
        // clipboard read permission denied
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [clipboardSyncEnabled, connectionState, manager]);

  return (
    <div className="flex flex-col gap-3 rounded-lg border p-4">
      <div className="flex items-center gap-3">
        <ClipboardCopy className="h-5 w-5 text-muted-foreground" />
        <div className="flex-1">
          <h3 className="font-medium">剪贴板同步</h3>
          <p className="text-sm text-muted-foreground">
            开启后，双方剪贴板内容变更会自动同步
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="clipboard-sync"
            checked={clipboardSyncEnabled}
            onCheckedChange={toggleClipboardSync}
            disabled={connectionState !== "connected"}
          />
          <Label htmlFor="clipboard-sync">
            {clipboardSyncEnabled ? "已开启" : "关闭"}
          </Label>
        </div>
      </div>
      {clipboardSyncEnabled && (
        <p className="text-xs text-muted-foreground">
          需要浏览器剪贴板权限。如果权限被拒绝，请使用文本传输功能手动粘贴。
        </p>
      )}
    </div>
  );
}
