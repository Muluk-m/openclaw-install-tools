"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, LogIn } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RoomCreate } from "@/components/transfer/room-create";
import { RoomJoin } from "@/components/transfer/room-join";
import { useTransferStore } from "@/stores/transfer-store";

export default function TransferPage() {
  const router = useRouter();
  const { roomCode } = useTransferStore();
  const [mode, setMode] = useState<"choose" | "create" | "join">("choose");

  const handleCreated = () => {
    router.push(`/transfer/room?room=${roomCode || ""}`);
  };

  const handleJoined = () => {
    const code = useTransferStore.getState().roomCode;
    router.push(`/transfer/room?room=${code}`);
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold">LAN 传输</h1>
        <p className="mt-2 text-muted-foreground">
          通过局域网 P2P 直连传输文件和文本，数据不经服务器
        </p>
      </div>

      {mode === "choose" && (
        <div className="grid gap-4 md:grid-cols-2">
          <button onClick={() => setMode("create")} className="text-left">
            <Card className="h-full transition-colors hover:border-primary/50">
              <CardHeader>
                <Plus className="h-8 w-8 mb-2 text-primary" />
                <CardTitle>创建房间</CardTitle>
                <CardDescription>
                  生成一个房间号，等待对方加入
                </CardDescription>
              </CardHeader>
            </Card>
          </button>

          <button onClick={() => setMode("join")} className="text-left">
            <Card className="h-full transition-colors hover:border-primary/50">
              <CardHeader>
                <LogIn className="h-8 w-8 mb-2 text-primary" />
                <CardTitle>加入房间</CardTitle>
                <CardDescription>
                  输入对方的房间号，建立连接
                </CardDescription>
              </CardHeader>
            </Card>
          </button>
        </div>
      )}

      {mode === "create" && (
        <Card>
          <CardHeader>
            <CardTitle>创建房间</CardTitle>
          </CardHeader>
          <CardContent>
            <RoomCreate onCreated={handleCreated} />
          </CardContent>
        </Card>
      )}

      {mode === "join" && (
        <Card>
          <CardHeader>
            <CardTitle>加入房间</CardTitle>
          </CardHeader>
          <CardContent>
            <RoomJoin onJoined={handleJoined} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
