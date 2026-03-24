"use client";

import { useEffect, useMemo, useRef } from "react";
import { Download, Eye, FileIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TransferItem } from "@/lib/webrtc";

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function getMimeType(name?: string): string {
  if (!name) return "application/octet-stream";
  const ext = name.split(".").pop()?.toLowerCase();
  const map: Record<string, string> = {
    png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", gif: "image/gif",
    webp: "image/webp", svg: "image/svg+xml", bmp: "image/bmp",
    pdf: "application/pdf",
    txt: "text/plain", md: "text/plain", log: "text/plain", json: "application/json",
    mp4: "video/mp4", webm: "video/webm", mov: "video/quicktime",
    mp3: "audio/mpeg", wav: "audio/wav", ogg: "audio/ogg",
  };
  return map[ext ?? ""] ?? "application/octet-stream";
}

function isPreviewable(name?: string): boolean {
  if (!name) return false;
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  return ["png","jpg","jpeg","gif","webp","svg","bmp","pdf","txt","md","log","json","mp4","webm","mov","mp3","wav","ogg"].includes(ext);
}

function isImage(name?: string): boolean {
  if (!name) return false;
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  return ["png","jpg","jpeg","gif","webp","svg","bmp"].includes(ext);
}

function FileItem({ item }: { item: TransferItem }) {
  const isTransferring = item.status === "transferring" || (!item.data && item.status !== "error");
  const progress = item.progress ?? 0;
  const percent = Math.round(progress * 100);
  const autoDownloaded = useRef(false);

  const objectUrl = useMemo(() => {
    if (!item.data) return null;
    const mime = getMimeType(item.name);
    return URL.createObjectURL(new Blob([item.data], { type: mime }));
  }, [item.data, item.name]);

  // Auto-download when file transfer completes
  useEffect(() => {
    if (item.data && !autoDownloaded.current) {
      autoDownloaded.current = true;
      const mime = getMimeType(item.name);
      const blob = new Blob([item.data], { type: mime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = item.name ?? "file";
      a.click();
      URL.revokeObjectURL(url);
    }
  }, [item.data, item.name]);

  const handlePreview = () => {
    if (!objectUrl) return;
    window.open(objectUrl, "_blank");
  };

  const handleDownload = () => {
    if (!item.data) return;
    const mime = getMimeType(item.name);
    const blob = new Blob([item.data], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = item.name ?? "file";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-lg border overflow-hidden">
      {/* Image thumbnail */}
      {isImage(item.name) && objectUrl && (
        <button
          type="button"
          onClick={handlePreview}
          className="block w-full cursor-pointer bg-muted/30"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={objectUrl}
            alt={item.name ?? "image"}
            className="max-h-48 w-full object-contain"
          />
        </button>
      )}

      <div className="flex items-center gap-2 p-3">
        <FileIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm" title={item.name}>
            {item.name}
          </p>
          {isTransferring ? (
            <div className="mt-1 flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">
                {percent}%
              </span>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              {item.size ? formatSize(item.size) : ""}
            </p>
          )}
        </div>
        <div className="flex shrink-0 gap-1">
          {isTransferring ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <>
              {isPreviewable(item.name) && (
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handlePreview} title="预览">
                  <Eye className="h-3.5 w-3.5" />
                </Button>
              )}
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleDownload} title="下载">
                <Download className="h-3.5 w-3.5" />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function FileReceiver({ items }: { items: TransferItem[] }) {
  const fileItems = items.filter(
    (i) => i.type === "file" && i.direction === "receive"
  );

  if (fileItems.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-medium text-muted-foreground">收到的文件</h3>
      {fileItems.map((item) => (
        <FileItem key={item.id} item={item} />
      ))}
    </div>
  );
}
