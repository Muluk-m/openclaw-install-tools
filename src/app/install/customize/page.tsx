"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { CommandBlock } from "@/components/install/command-block";

type Platform = "mac" | "windows";
type InstallMethod = "curl" | "npm" | "git";
type AIModel = "anthropic" | "openai" | "local";

const chatPlatforms = [
  { id: "telegram", label: "Telegram" },
  { id: "discord", label: "Discord" },
  { id: "slack", label: "Slack" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "signal", label: "Signal" },
];

const installMethods: Record<
  InstallMethod,
  { label: string; platforms: Platform[] }
> = {
  curl: { label: "curl 一键安装", platforms: ["mac"] },
  npm: { label: "npm 全局安装", platforms: ["mac", "windows"] },
  git: { label: "Git 克隆", platforms: ["mac", "windows"] },
};

function generateCommand(
  platform: Platform,
  method: InstallMethod,
  model: AIModel,
  chats: string[]
): string {
  const lines: string[] = [];

  if (method === "curl") {
    lines.push("curl -fsSL https://openclaw.ai/install.sh | bash");
  } else if (method === "npm") {
    lines.push("npm i -g openclaw");
  } else {
    lines.push("git clone https://github.com/nicepkg/openclaw.git");
    lines.push("cd openclaw");
    lines.push("pnpm install && pnpm build");
  }

  const args: string[] = [];
  if (model !== "anthropic") args.push(`--model ${model}`);
  if (chats.length > 0) args.push(`--chat ${chats.join(",")}`);

  if (args.length > 0) {
    lines.push(`openclaw onboard ${args.join(" ")}`);
  } else {
    lines.push("openclaw onboard");
  }

  return lines.join("\n");
}

export default function CustomizePage() {
  const [platform, setPlatform] = useState<Platform>("mac");
  const [method, setMethod] = useState<InstallMethod>("curl");
  const [model, setModel] = useState<AIModel>("anthropic");
  const [selectedChats, setSelectedChats] = useState<string[]>([]);

  const availableMethods = Object.entries(installMethods).filter(([, v]) =>
    v.platforms.includes(platform)
  );

  const handlePlatformChange = (value: string | null) => {
    if (!value) return;
    const p = value as Platform;
    setPlatform(p);
    if (method === "curl" && p === "windows") {
      setMethod("npm");
    }
  };

  const toggleChat = (chatId: string) => {
    setSelectedChats((prev) =>
      prev.includes(chatId)
        ? prev.filter((c) => c !== chatId)
        : [...prev, chatId]
    );
  };

  const command = generateCommand(platform, method, model, selectedChats);
  const lang = platform === "windows" ? "powershell" : "bash";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">安装命令生成器</h1>
        <p className="mt-2 text-muted-foreground">
          选择你的配置，生成定制化的安装命令
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">配置选项</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Label>平台</Label>
              <Select value={platform} onValueChange={handlePlatformChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mac">macOS</SelectItem>
                  <SelectItem value="windows">Windows</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label>安装方式</Label>
              <Select value={method} onValueChange={(v: string | null) => v && setMethod(v as InstallMethod)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableMethods.map(([key, val]) => (
                    <SelectItem key={key} value={key}>
                      {val.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label>AI 模型</Label>
              <Select value={model} onValueChange={(v: string | null) => v && setModel(v as AIModel)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="anthropic">Anthropic Claude</SelectItem>
                  <SelectItem value="openai">OpenAI</SelectItem>
                  <SelectItem value="local">本地模型</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-3">
              <Label>聊天平台</Label>
              {chatPlatforms.map((chat) => (
                <div key={chat.id} className="flex items-center gap-2">
                  <Checkbox
                    id={chat.id}
                    checked={selectedChats.includes(chat.id)}
                    onCheckedChange={() => toggleChat(chat.id)}
                  />
                  <Label htmlFor={chat.id} className="font-normal">
                    {chat.label}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-semibold">生成的命令</h3>
          <CommandBlock command={command} lang={lang} />
        </div>
      </div>
    </div>
  );
}
