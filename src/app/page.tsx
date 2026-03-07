"use client";

import Link from "next/link";
import { Download, Wifi, Bug, ArrowRight } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";

const features = [
  {
    href: "/install",
    icon: Download,
    title: "安装向导",
    description: "Windows / macOS 交互式安装引导，根据你的环境自动推荐步骤",
    detail: "支持条件分支、一键复制命令、安装命令定制生成",
  },
  {
    href: "/transfer",
    icon: Wifi,
    title: "LAN 传输",
    description: "局域网 P2P 文件传输，帮朋友装机时互传安装包和日志",
    detail: "基于 WebRTC 直连，数据不经服务器，支持文件/文本/剪贴板同步",
  },
  {
    href: "/debug",
    icon: Bug,
    title: "问题诊断",
    description: "常见安装错误速查 + AI 日志分析，快速定位问题",
    detail: "已知问题秒级匹配，未知错误 AI 智能分析",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col items-center gap-12 py-8 md:py-16">
      <section className="flex flex-col items-center gap-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
          OpenClaw Install Tools
        </h1>
        <p className="max-w-[600px] text-lg text-muted-foreground">
          帮你装好 OpenClaw —— 交互式安装向导、局域网文件传输、智能问题诊断
        </p>
        <div className="flex gap-3 mt-2">
          <Link href="/install" className={buttonVariants({ size: "lg" })}>
            开始安装
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
          <Link
            href="https://github.com/Muluk-m/openclaw-install-tools"
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            GitHub
          </Link>
        </div>
      </section>

      <section className="grid w-full gap-6 md:grid-cols-3">
        {features.map((feature) => (
          <Link key={feature.href} href={feature.href} className="group">
            <Card className="h-full transition-colors group-hover:border-primary/50">
              <CardHeader>
                <feature.icon className="h-8 w-8 mb-2 text-primary" />
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {feature.detail}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </section>
    </div>
  );
}
