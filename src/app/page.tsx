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
    title: "安装指南",
    description: "从环境搭建到飞书插件接入，每一步都有 AI 验证",
    detail: "复制命令、粘贴输出、AI 判断是否正确，遇到问题当场诊断",
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
    title: "AI 诊断",
    description: "粘贴报错日志，AI 分析问题并给出修复建议",
    detail: "Cloudflare Workers AI 驱动，无需注册，即粘即诊",
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
          帮你装好 OpenClaw —— 安装指南、局域网传输、AI 问题诊断
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
