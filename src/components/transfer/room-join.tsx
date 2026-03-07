"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTransferStore } from "@/stores/transfer-store";

interface RoomJoinProps {
  onJoined: () => void;
}

export function RoomJoin({ onJoined }: RoomJoinProps) {
  const { joinRoom } = useTransferStore();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleJoin = async () => {
    if (code.length !== 4) {
      setError("请输入 4 位房间号");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await joinRoom(code);
      onJoined();
    } catch {
      setError("房间不存在或已过期");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <Input
          placeholder="输入 4 位房间号"
          value={code}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, "").slice(0, 4);
            setCode(v);
            setError("");
          }}
          onKeyDown={(e) => e.key === "Enter" && handleJoin()}
          className="font-mono text-center text-lg tracking-widest"
          maxLength={4}
        />
        <Button onClick={handleJoin} disabled={loading || code.length !== 4}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          加入
        </Button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
