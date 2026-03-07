"use client";

import { Wifi, WifiOff, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ConnectionState } from "@/lib/webrtc";

const statusConfig: Record<
  ConnectionState,
  { label: string; icon: typeof Wifi; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  idle: { label: "未连接", icon: WifiOff, variant: "secondary" },
  connecting: { label: "连接中...", icon: Loader2, variant: "outline" },
  connected: { label: "已连接", icon: Wifi, variant: "default" },
  disconnected: { label: "连接断开", icon: WifiOff, variant: "destructive" },
};

export function ConnectionStatus({ state }: { state: ConnectionState }) {
  const config = statusConfig[state];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className="gap-1.5">
      <Icon
        className={`h-3.5 w-3.5 ${state === "connecting" ? "animate-spin" : ""}`}
      />
      {config.label}
    </Badge>
  );
}
