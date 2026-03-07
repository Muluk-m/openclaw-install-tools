"use client";

import { useState } from "react";
import { Copy, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTransferStore } from "@/stores/transfer-store";

interface RoomCreateProps {
  onCreated: () => void;
}

export function RoomCreate({ onCreated }: RoomCreateProps) {
  const { roomCode, createRoom } = useTransferStore();
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    try {
      await createRoom();
      onCreated();
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!roomCode) return;
    await navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (roomCode) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>房间已创建</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="font-mono text-4xl font-bold tracking-widest">
              {roomCode}
            </span>
            <Button variant="ghost" size="icon" onClick={handleCopy}>
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            将此房间号告诉对方，等待对方加入...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Button onClick={handleCreate} disabled={loading} size="lg" className="w-full">
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      创建房间
    </Button>
  );
}
