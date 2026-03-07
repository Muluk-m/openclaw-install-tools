"use client";

import { useRef } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTransferStore } from "@/stores/transfer-store";

export function FileSender() {
  const { sendFile, connectionState } = useTransferStore();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await sendFile(file);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div>
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
    </div>
  );
}
