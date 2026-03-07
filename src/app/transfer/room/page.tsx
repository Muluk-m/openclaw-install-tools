"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { ConnectionStatus } from "@/components/transfer/connection-status";
import { FileSender } from "@/components/transfer/file-sender";
import { FileReceiver } from "@/components/transfer/file-receiver";
import { TextTransfer } from "@/components/transfer/text-transfer";
import { ClipboardSync } from "@/components/transfer/clipboard-sync";
import { useTransferStore } from "@/stores/transfer-store";

function RoomContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomParam = searchParams.get("room");
  const { roomCode, connectionState, items, disconnect } = useTransferStore();

  useEffect(() => {
    if (!roomParam && !roomCode) {
      router.replace("/transfer");
    }
  }, [roomParam, roomCode, router]);

  const handleDisconnect = () => {
    disconnect();
    router.push("/transfer");
  };

  const displayCode = roomCode || roomParam || "";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/transfer" className={buttonVariants({ variant: "ghost", size: "icon" })}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">
              房间 <span className="font-mono">{displayCode}</span>
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ConnectionStatus state={connectionState} />
          <Button variant="outline" size="sm" onClick={handleDisconnect}>
            断开
          </Button>
        </div>
      </div>

      {connectionState === "connected" ? (
        <Tabs defaultValue="file">
          <TabsList>
            <TabsTrigger value="file">文件</TabsTrigger>
            <TabsTrigger value="text">文本</TabsTrigger>
            <TabsTrigger value="clipboard">剪贴板</TabsTrigger>
          </TabsList>

          <TabsContent value="file">
            <Card>
              <CardContent className="flex flex-col gap-4 pt-6">
                <FileSender />
                <FileReceiver items={items} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="text">
            <Card>
              <CardContent className="pt-6">
                <TextTransfer items={items} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="clipboard">
            <Card>
              <CardContent className="pt-6">
                <ClipboardSync />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12">
            {connectionState === "connecting" && (
              <p className="text-muted-foreground">正在建立 P2P 连接...</p>
            )}
            {connectionState === "disconnected" && (
              <>
                <p className="text-muted-foreground">连接已断开</p>
                <Button onClick={() => router.push("/transfer")}>
                  返回重新连接
                </Button>
              </>
            )}
            {connectionState === "idle" && (
              <p className="text-muted-foreground">等待对方加入房间...</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function RoomPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">加载中...</p>
        </div>
      }
    >
      <RoomContent />
    </Suspense>
  );
}
